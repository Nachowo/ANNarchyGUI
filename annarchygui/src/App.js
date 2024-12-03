import React, { useState } from 'react';
import './App.css';
import Lienzo from './Lienzo';
import Sidebar from './Sidebar';

function App() {
  const [isConnecting, setIsConnecting] = useState(false); 
  const [items, setItems] = useState([]); // Estado para los items del lienzo
  const [selectedSynapse, setSelectedSynapse] = useState(null); // Estado para la sinapsis seleccionada
  const [connections, setConnections] = useState([]); // Estado para las conexiones del lienzo

  // Maneja el cambio de modo de conexión
  const handleConnectToggle = (synapse) => {
    setSelectedSynapse(synapse);
    setIsConnecting(true);
    document.body.style.cursor = 'crosshair'; 
    console.log(`Modo conexión: true`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <button className='buttonHeader'>Simular</button>
      </header>
      <div className="App-body">
        <Lienzo isConnecting={[isConnecting, setIsConnecting]} items={items} setItems={setItems} selectedSynapse={selectedSynapse} connections={connections} setConnections={setConnections} />
        <Sidebar onConnectToggle={handleConnectToggle} items={items} connections={connections} />
      </div>
    </div>
  );
}

export default App;
