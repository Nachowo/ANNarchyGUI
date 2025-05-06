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

  useEffect(() => {
    // Actualizar el código ANNarchy cuando simulationTime cambie
    const itemsList = items;
  }, [simulationTime]);

  const parseBackendResponse = (responseString) => {
    try {
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
    const itemsList = items;
    const code = generateANNarchyCode(itemsList, connections, monitors, simulationTime);

    setGraphics([]); // Vaciar el arreglo de gráficos
    setGraphicMonitors([]); // Vaciar el arreglo de monitores

    setLoadingProgress(33); // Primera etapa: Enviando
    setIsLoading(true); // Mostrar el modal de carga

    try {
      const jobId = await sendCodeToBackend(code);
      //console.log('ID del trabajo:', jobId);
      setLoadingProgress(66); // Segunda etapa: Esperando respuesta
      pollJobStatus(jobId);
    } catch (error) {
      console.error('Error al enviar el código al backend:', error);
      setSimulationOutput('Error al ejecutar la simulación.');
      setShowOutputModal(true); // Mostrar el modal de resultado
      setIsLoading(false); // Ocultar el modal de carga
      setLoadingProgress(0); // Reiniciar progreso
    }
  };

  const pollJobStatus = async (jobId) => {
    const pollInterval = 2000; // Intervalo de polling en milisegundos

    const displayFirstGraph = (jsonResponse) => {
      Object.values(jsonResponse).forEach((monitor) => {
        Object.values(monitor.graphs).forEach((graphBase64) => {
          // Crear un elemento de imagen
          const imgElement = document.createElement('img');
          imgElement.src = `data:image/png;base64,${graphBase64}`;
          imgElement.alt = 'Monitor Graph';
          imgElement.style.maxWidth = '100%';

          // Actualizar el estado con el nuevo gráfico y el ID del monitor
          setGraphics((prevGraphics) => [...prevGraphics, imgElement]);
          setGraphicMonitors((prevMonitors) => [...prevMonitors, monitor.monitorId]);
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
          // Continuar con el polling
          setTimeout(checkStatus, pollInterval);
        } else {
          const json = parseBackendResponse(output);
          console.log('json:', json);
          setLoadingProgress(100); // Tercera etapa: Analizando resultados
          let finalOutput = output || error || status || 'Simulación completada.';
          displayFirstGraph(json); // Mostrar los gráficos recibidos
          setSimulationOutput(finalOutput);
          setShowOutputModal(true);
          setIsLoading(false);
          setTimeout(() => setLoadingProgress(0), 500); // Reiniciar progreso tras un breve retraso
        }
      } catch (e) {
        if (e.message.includes('404')) {
          setSimulationOutput('Error 404 al ejecutar la simulación.');
          setShowOutputModal(true);
          setIsLoading(false);
          setLoadingProgress(0); // Reiniciar progreso
          return;
        }
        // Error de red o similar, seguir intentando
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
          <div className="loading-content">
            <h3>Simulación en progreso...</h3>
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
            <h3>Simulation Output:</h3>
            <button onClick={() => setShowOutputModal(false)}>Cerrar</button>
            {/*{graphics.length > 0 && (
              <img src={graphics[0].src} alt="Monitor Graph" style={{ maxWidth: '100%' }} />
            )}*/}
          </div>
        </div>
      )}
      <button onClick={() => alert(`El largo del arreglo de gráficos es: ${graphics.length}`)}>
        Mostrar Largo de Gráficos
      </button>
    </div>
  );
}

export default App;
