import React, { useState } from 'react';
import './App.css';
import Lienzo from './Lienzo';
import Sidebar from './Sidebar';
import { generateANNarchyCode, sendCodeToBackend, downloadCodeAsFile } from './CodeGenerator';

function App() {
  const [isConnecting, setIsConnecting] = useState(false); 
  const [items, setItems] = useState([]); // Estado para los items del lienzo
  const [selectedSynapse, setSelectedSynapse] = useState(null); // Estado para la sinapsis seleccionada
  const [connections, setConnections] = useState([]); // Estado para las conexiones del lienzo
  const [simulationOutput, setSimulationOutput] = useState(''); // Estado para el resultado de la simulación
  const [isLoading, setIsLoading] = useState(false); // Estado para mostrar/ocultar el modal de carga
  const [showOutputModal, setShowOutputModal] = useState(false); // Estado para mostrar/ocultar el modal de resultado

  // Maneja el cambio de modo de conexión
  const handleConnectToggle = (synapse) => {
    setSelectedSynapse(synapse);
    setIsConnecting(true);
    document.body.style.cursor = 'crosshair'; 
    console.log(`Modo conexión: true`);
  };

  // Maneja la simulación
  const handleSimulate = async () => {
    const itemsList = items;
    const code = generateANNarchyCode(itemsList, connections);
    downloadCodeAsFile(code);
    
    setIsLoading(true); // Mostrar el modal de carga

    try {
      const output = await sendCodeToBackend(code);
      setSimulationOutput(output);
      setShowOutputModal(true); // Mostrar el modal de resultado
    } catch (error) {
      console.error('Error al enviar el código al backend:', error);
      setSimulationOutput('Error al ejecutar la simulación.');
      setShowOutputModal(true); // Mostrar el modal de resultado
    } finally {
      setIsLoading(false); // Ocultar el modal de carga
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <button className='buttonHeader' onClick={handleSimulate}>Simulate</button>
      </header>
      <div className="App-body">
        <Lienzo isConnecting={[isConnecting, setIsConnecting]} items={items} setItems={setItems} selectedSynapse={selectedSynapse} connections={connections} setConnections={setConnections} />
        <Sidebar onConnectToggle={handleConnectToggle} items={items} connections={connections} />
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
