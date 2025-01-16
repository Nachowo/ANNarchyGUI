import React, { useState } from 'react';
import './App.css';
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
    
    setIsLoading(true); // Mostrar el modal de carga

    try {
      const jobId = await sendCodeToBackend(code);
      console.log('ID del trabajo:', jobId);
      pollJobStatus(jobId);
    } catch (error) {
      console.error('Error al enviar el código al backend:', error);
      setSimulationOutput('Error al ejecutar la simulación.');
      setShowOutputModal(true); // Mostrar el modal de resultado
      setIsLoading(false); // Ocultar el modal de carga
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
    // Buscar el texto 'array([...])' y extraer su contenido interno.
    const regex = /array\(\[([\s\S]*?)\]\)/;
    const match = finalOutput.match(regex);
    if (!match) return [];

    // match[1] es la parte interna, p. ej. [[-65. ], [-58.4 ], ...]
    const arrayStrings = match[1].trim();
    // Extraer cada fila entre corchetes.
    const rowRegex = /\[([^\]]+)\]/g;
    let rows = [];
    let rowMatch;

    while ((rowMatch = rowRegex.exec(arrayStrings)) !== null) {
      // Separar en valores y convertir a número.
      const values = rowMatch[1].split(',').map(str => parseFloat(str));
      rows.push(values);
    }
    return rows;
  }

  const pollJobStatus = async (jobId) => {
    const pollInterval = 2000; // Intervalo de polling en milisegundos
  
    const checkStatus = async () => {
      try {
        const result = await getJobStatus(jobId);
        const { status, error, output, monitors } = result;
        console.log('resultado:', result);
        if (status === 'En progreso' || status === 'En espera') {
          setTimeout(checkStatus, pollInterval);
        } else if (error) {
          setSimulationOutput('Error: ' + error);
          setShowOutputModal(true);
          setIsLoading(false);
        } else {
          let finalOutput = output || status || 'Simulación completada.';
          //console.log('Resultado final:', parseVArrayFromOutput(finalOutput));
          if (monitors.length > 0) {
            console.log("Se entró al if de gráficas");
            const voltages = parseVArrayFromOutput(finalOutput);
            finalOutput = voltages;
            finalOutput += '\n\nResultados de los Monitores:\n';

            // Crear un contenedor con tamaño fijo y añadirle un canvas
            const container = document.createElement('div');
            container.style.width = '600px';
            container.style.height = '400px';
            container.style.margin = '0 auto';
            document.body.appendChild(container);

            const canvas = document.createElement('canvas');
            container.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
              type: 'line',
              data: {
                labels: voltages.map((_, index) => index),
                datasets: [
                  {
                    label: 'Voltaje',
                    data: voltages.map(value => value[0]),
                    borderColor: 'blue',
                    borderWidth: 2,
                    fill: false
                  }
                ]
              },
              options: {
                scales: {
                  x: { title: { display: true, text: 'Muestra' } },
                  y: { title: { display: true, text: 'Voltaje (mV)' } }
                }
              }
            });

            downloadMonitorResults(monitors); // Descargar resultados de los monitores
          }
          setSimulationOutput(finalOutput);
          setShowOutputModal(true);
          setIsLoading(false);
        }
      } catch (e) {
        if (e.message.includes('404')) {
          setSimulationOutput('Error 404 al ejecutar la simulación.');
          setShowOutputModal(true);
          setIsLoading(false);
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
        <label htmlFor="simulation-time">Simulation Time:</label>
        <input
          type="number"
          id="simulation-time"
          value={simulationTime}
          onChange={(e) => setSimulationTime(e.target.value)}
        />
        <button className='buttonHeader' onClick={handleSimulate}>Simulate</button>
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
        />
      </div>
      {isLoading && (
        <div className="loading-modal">
          <div className="loading-content">
            <h3>Cargando...</h3>
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
