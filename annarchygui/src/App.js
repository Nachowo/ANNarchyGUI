import React, { useState } from 'react';
import './App.css';
import Lienzo from './Lienzo';
import Sidebar from './Sidebar';
import ContextMenu from './ContextMenu';

function App() {
  const [isConnecting, setIsConnecting] = useState(false); // Estado para modo conexión
  const [hasConnectionBeenMade, setHasConnectionBeenMade] = useState(false); // Estado para conexión realizada

  const handleConnectToggle = () => {
    // Cambiar estado de conexión
    setIsConnecting(true);
    setHasConnectionBeenMade(false);
    console.log(`Modo conexión: true`);
  };

  return (
    <div className="App">
      <header className="App-header">
 
      </header>
      <div className="App-body">
        <Lienzo isConnecting={[isConnecting,hasConnectionBeenMade]} />
        <Sidebar onConnectToggle={handleConnectToggle} />
      </div>
    </div>
  );
}

export default App;
