import React, { useState } from 'react';
import './App.css';
import Lienzo from './Lienzo';
import Sidebar from './Sidebar';
import ContextMenu from './ContextMenu';

function App() {
  const [isConnecting, setIsConnecting] = useState(false); 
  const [items, setItems] = useState([]); // Estado para los items del lienzo

  // Maneja el cambio de modo de conexión
  const handleConnectToggle = () => {
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
        <Lienzo isConnecting={[isConnecting, setIsConnecting]} items={items} setItems={setItems} />
        <Sidebar onConnectToggle={handleConnectToggle} items={items} />
      </div>
    </div>
  );
}

export default App;
