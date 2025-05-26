import React, { useState, useEffect } from 'react';
import './../css/App.css';
import Lienzo from './Lienzo';
import Sidebar from './Sidebar';
import { generateANNarchyCode, sendCodeToBackend, getJobStatus, downloadMonitorResults } from './CodeGenerator';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


function App() {
  const [isConnecting, setIsConnecting] = useState(false); 
  const [items, setItems] = useState([]); // Estado para los items del lienzo
  const [selectedSynapse, setSelectedSynapse] = useState(null); // Estado para la sinapsis seleccionada
  const [connections, setConnections] = useState([]); // Estado para las conexiones del lienzo
  const [simulationOutput, setSimulationOutput] = useState(''); // Estado para el resultado de la simulación
  const [isLoading, setIsLoading] = useState(false); // Estado para mostrar/ocultar el modal de carga
  const [showOutputModal, setShowOutputModal] = useState(false); // Estado para mostrar/ocultar el modal de resultado
  const [simulationTime, setSimulationTime] = useState(10); // Estado para el tiempo de simulación
  const [isCreatingMonitor, setIsCreatingMonitor] = useState(false); // Estado para la creación de monitores
  const [isAssigningMonitor, setIsAssigningMonitor] = useState(false); // Estado para la asignación de monitores
  const [monitors, setMonitors] = useState([]); // Estado para los monitores creados
  const [loadingStage, setLoadingStage] = useState(''); // Estado para la etapa de carga
  const [loadingProgress, setLoadingProgress] = useState(0); // Estado para el progreso de la barra
  const [graphics, setGraphics] = useState([]); // Estado para los gráficos
  const [graphicMonitors, setGraphicMonitors] = useState([]); // Estado para los IDs de los monitores
  const [variablesData, setVariablesData] = useState([]);
  const [spikesData, setSpikesData] = useState([]);
  const [lastSimTime, setLastSimTime] = useState(0); // Estado para el último tiempo de simulación
  const [elapsedTime, setElapsedTime] = useState(0); // Tiempo transcurrido en ms
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    // Actualizar el código ANNarchy cuando simulationTime cambie
    const itemsList = items;
  }, [simulationTime]);

  useEffect(() => {
    if (showOutputModal) {
      setLastSimTime(simulationTime); // Actualizar lastSimTime solo cuando showOutputModal sea true
    }
  }, [showOutputModal, simulationTime]); // Ejecutar este efecto solo cuando cambien estas dependencias

  const parseBackendResponse = (responseString) => {
    try {
      console.log('Respuesta del backend:', responseString);
      // Saltar hasta el primer "{" en el string
      const jsonString = responseString.substring(responseString.indexOf('{'));

      const jsonResponse = JSON.parse(jsonString);
      return jsonResponse;
    } catch (error) {
      console.error('Error al convertir la respuesta del backend a JSON:', error);
      return null;
    }
  };

  // Maneja el cambio de modo de conexión
  const handleConnectToggle = (synapse) => {
    setSelectedSynapse(synapse);
    setIsConnecting(true);
    document.body.style.cursor = 'crosshair'; 
  };

  // Maneja la creación de monitores
  const handleMonitorToggle = () => {
    setIsCreatingMonitor(true);
    document.body.style.cursor = 'crosshair';
  };

  // Maneja la simulación
  const handleSimulate = async () => {
    // Limpiar datos anteriores
    setGraphics([]);
    setGraphicMonitors([]);
    setVariablesData([]);
    setSpikesData([]);

    setElapsedTime(0);
    if (timerInterval) clearInterval(timerInterval);
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 10);
    }, 10);
    setTimerInterval(interval);

    const itemsList = items;
    const code = generateANNarchyCode(itemsList, connections, monitors, simulationTime);

    setLoadingStage('sending');
    setLoadingProgress(20); // Primera etapa: Enviando
    setIsLoading(true); // Mostrar el modal de carga

    try {
      const jobId = await sendCodeToBackend(code);
      setLoadingStage('simulating');
      setLoadingProgress(50); // Segunda etapa: Simulando
      pollJobStatus(jobId, interval);
    } catch (error) {
      console.error('Error al enviar el código al backend:', error);
      setSimulationOutput('Error al ejecutar la simulación.');
      setShowOutputModal(true); // Mostrar el modal de resultado
      setIsLoading(false); // Ocultar el modal de carga
      setLoadingProgress(0); // Reiniciar progreso
      setLoadingStage('');
      clearInterval(interval);
      setTimerInterval(null);
    }
  };

  const pollJobStatus = async (jobId, interval) => {
    const pollInterval = 2000; // Intervalo de polling en milisegundos

    const renderMonitorGraphs = (jsonResponse) => {
      Object.values(jsonResponse).forEach((monitor) => {
        // Solo procesar datos crudos
        Object.entries(monitor.results).forEach(([variable, result]) => {
          if (result.data) {
            setVariablesData((prevData) => [
              ...prevData,
              {
                monitorId: monitor.monitorId,
                variable,
                data: result.data,
                histogram: result.histogram || null,
                raster: result.raster || null,
              },
            ]);
          }
        });
      });
    };

    const checkStatus = async () => {
      try {
        const result = await getJobStatus(jobId);
        const { status, error, output } = result;
        //console.log('resultado:', result);
        //console.log('output:', output);
        //console.log('status:', status);
        //console.log('error:', error);
        

        if (status === 'En progreso' || status === 'En espera' || error) {
          setLoadingStage('simulating');
          setLoadingProgress(50);
          setTimeout(checkStatus, pollInterval);
        } else {
          setLoadingStage('analyzing');
          setLoadingProgress(80); // Tercera etapa: Analizando resultados
          const json = parseBackendResponse(output);
          let finalOutput = output || error || status || 'Simulación completada.';
          renderMonitorGraphs(json); // Mostrar los gráficos recibidos
          setSimulationOutput(finalOutput);
          setShowOutputModal(true);
          setIsLoading(false);
          setTimeout(() => {
            setLoadingProgress(0);
            setLoadingStage('');
          }, 500);
          clearInterval(interval);
          setTimerInterval(null);
        }
      } catch (e) {
        if (e.message.includes('404')) {
          setSimulationOutput('Error 404 al ejecutar la simulación.');
          setShowOutputModal(true);
          setIsLoading(false);
          setLoadingProgress(0); // Reiniciar progreso
          setLoadingStage('');
          clearInterval(interval);
          setTimerInterval(null);
          return;
        }
        // Error de red o similar, seguir intentando
        setLoadingStage('simulating');
        setLoadingProgress(50);
        setTimeout(checkStatus, pollInterval);
      }
    };

    checkStatus();
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="simulation-controls">
          <label htmlFor="simulation-time" className="simulateLabel">Simulation Time:</label>
          <input
            type="number"
            id="simulation-time"
            value={simulationTime}
            onChange={(e) => setSimulationTime(e.target.value)}
          />
          <button className="buttonHeader" onClick={handleSimulate}>Simulate</button>
        </div>
      </header>
      <div className="App-body">
        <Lienzo 
          isConnecting={[isConnecting, setIsConnecting]} 
          items={items} 
          setItems={setItems} 
          selectedSynapse={selectedSynapse} 
          connections={connections} 
          setConnections={setConnections} 
          isCreatingMonitor={isCreatingMonitor} 
          setIsCreatingMonitor={setIsCreatingMonitor} 
          isAssigningMonitor={isAssigningMonitor} 
          setIsAssigningMonitor={setIsAssigningMonitor} 
          monitors={monitors} 
          setMonitors={setMonitors} 
          graphics={graphics} 
          graphicMonitors={graphicMonitors} // Pasar graphics y graphicMonitors
          variablesData={variablesData} // Pasar variablesData
          lastSimTime={lastSimTime} // Pasar lastSimTime
        />
        <Sidebar 
          onConnectToggle={handleConnectToggle} 
          items={items} 
          connections={connections} 
          onMonitorToggle={handleMonitorToggle} 
          onAssignMonitor={setIsAssigningMonitor} 
          monitors={monitors} 
          simulationTime={simulationTime} // Pasar simulationTime como propiedad
        />
      </div>
      {isLoading && (
        <div className="loading-modal">
          <div className="loading-content" style={{ width: '500px' }}>
            <h3>Simulation</h3>
            <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
              {loadingStage === 'sending' && 'Sending simulation...'}
              {loadingStage === 'simulating' && 'Simulating...'}
              {loadingStage === 'analyzing' && 'Analyzing results...'}
              {!loadingStage && 'Preparing...'}
            </div>
            <div style={{ marginBottom: '10px', fontSize: '1.1em' }}>
              Time elapsed: {Math.floor(elapsedTime / 1000)}.{String(elapsedTime % 1000).padStart(3, '0')} s
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      {showOutputModal && (
        <div className="output-modal">
          <div className="output-content">
            <h3>Simulation completed</h3>
            <div style={{ margin: '16px 0', color: simulationOutput.includes('Error') ? 'red' : 'inherit' }}>
              {simulationOutput.includes('Error')
                ? simulationOutput
                : <>
                    
                    <div style={{ marginTop: '10px', fontWeight: 'bold', color: '#333' }}>
                      Total time: {Math.floor(elapsedTime / 1000)}.{String(elapsedTime % 1000).padStart(3, '0')} s
                    </div>
                  </>
              }
            </div>
            <button onClick={() => setShowOutputModal(false)}>Close</button>
          </div>
        </div>
      )}
      <button onClick={() => alert(`El largo del arreglo de gráficos es: ${graphics.length} y el arreglo de monitores es: ${graphicMonitors}`)}>
        Mostrar Largo de Gráficos
      </button>
    </div>
  );
}

export default App;
