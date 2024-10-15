import React from 'react';
import './Sidebar.css';

function Sidebar({ onConnectToggle }) {
  const handleDragStart = (event, itemType) => {
    event.dataTransfer.setData('itemType', itemType);
  };

  return (
    <div className="Sidebar" id="sidebar">
      <h2>Opciones</h2>
      <div
        className="draggable-item"
        draggable
        onDragStart={(event) => handleDragStart(event, 'Elemento 1')}
      >
        Elemento 1
      </div>
      <div
        className="draggable-item"
        draggable
        onDragStart={(event) => handleDragStart(event, 'Elemento 2')}
      >
        Elemento 2
      </div>
      <button onClick={onConnectToggle}>Conectar</button>
    </div>
  );
}

export default Sidebar;
