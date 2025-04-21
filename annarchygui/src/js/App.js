import React, { useState } from 'react';
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
  const [simulationTime, setSimulationTime] = useState(1000); // Estado para el tiempo de simulación
  const [isCreatingMonitor, setIsCreatingMonitor] = useState(false); // Estado para la creación de monitores
  const [isAssigningMonitor, setIsAssigningMonitor] = useState(false); // Estado para la asignación de monitores
  const [monitors, setMonitors] = useState([]); // Estado para los monitores creados
  const [loadingStage, setLoadingStage] = useState(''); // Estado para la etapa de carga
  const [loadingProgress, setLoadingProgress] = useState(0); // Estado para el progreso de la barra
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // Estado para controlar la visibilidad del sidebar

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

    setLoadingProgress(33); // Primera etapa: Enviando
    setIsLoading(true); // Mostrar el modal de carga

    try {
      const jobId = await sendCodeToBackend(code);
      console.log('ID del trabajo:', jobId);
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


  /**
   * Retorna solamente el arreglo 'v' de cada monitor.
   * @param {object} monitors - Resultados de los monitores.
   * @returns {object} - Objeto con sólo el array 'v' de cada monitor.
   */
  function getOnlyVArrays(monitors) {
    const result = {};
    for (const [monitorId, monitorData] of Object.entries(monitors)) {
      if (monitorData && monitorData.v) {
        result[monitorId] = monitorData.v;
      }
    }
    return result;
  }

  function parseVArrayFromOutput(finalOutput) {
    // Busca el inicio de la parte JSON identificando el primer '{'
    const jsonStart = finalOutput.indexOf('{');
    if (jsonStart === -1) return [];
    
    try {
      const jsonStr = finalOutput.substring(jsonStart);
      const data = JSON.parse(jsonStr);
      return data["Monitor"] || [];
    } catch (error) {
      console.error("Error al parsear JSON del output:", error);
      return [];
    }
  }

  const pollJobStatus = async (jobId) => {
    const pollInterval = 2000; // Intervalo de polling en milisegundos
  
    const checkStatus = async () => {
      try {
        const result = await getJobStatus(jobId);
        const { status, error, output, monitors } = result;
        console.log('resultado:', result);
        console.log('monitores:', monitors);
        console.log('output:', output);
        console.log('status:', status);
        console.log('error:', error);
        
        if (status === 'En progreso' || status === 'En espera' || error) {
          // Continuar con el polling
          setTimeout(checkStatus, pollInterval);
        } else {
          setLoadingProgress(100); // Tercera etapa: Analizando resultados
          let finalOutput = output || error || status || 'Simulación completada.';
          if (!monitors.length > 0) {
            const voltages = parseVArrayFromOutput(finalOutput);
            // Guardar los voltajes en una variable global
            window.monitorVoltages = voltages;
            finalOutput = "Simulation ended.";
            // (Se elimina la generación inmediata del gráfico)
          }
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
          isAssigningMonitor={isAssigningMonitor} // Pasar estado de asignación
          setIsAssigningMonitor={setIsAssigningMonitor} // Pasar función para actualizar estado
          monitors={monitors} // Pasar monitores
          setMonitors={setMonitors} // Pasar función para actualizar monitores
        />
        <Sidebar 
          onConnectToggle={handleConnectToggle} 
          items={items} 
          connections={connections} 
          onMonitorToggle={handleMonitorToggle} 
          onAssignMonitor={setIsAssigningMonitor} // Pasar función para asignar monitor
          monitors={monitors} // Pasar monitores
          isVisible={isSidebarVisible} // Pasar visibilidad del sidebar
          toggleVisibility={() => setIsSidebarVisible(!isSidebarVisible)} // Pasar función para alternar visibilidad
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
            <pre>{simulationOutput}</pre>
            <button onClick={() => setShowOutputModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
