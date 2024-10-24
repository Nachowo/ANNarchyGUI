import React, { useState } from 'react';
import './App.css';
import Lienzo from './Lienzo';
import Sidebar from './Sidebar';
import ContextMenu from './ContextMenu';

function App() {
  const [isConnecting, setIsConnecting] = useState(false); // Estado para modo conexión

  const handleConnectToggle = () => {
    setIsConnecting(true);
    document.body.style.cursor = 'crosshair'; // Cambia el cursor al
    console.log(`Modo conexión: true`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <button className='buttonHeader'>Simular</button>
      </header>
      <div className="App-body">
        <Lienzo isConnecting={[isConnecting, setIsConnecting]} />
        <Sidebar onConnectToggle={handleConnectToggle} />
      </div>
    </div>
  );
}

export default App;
