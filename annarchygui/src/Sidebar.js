import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ onConnectToggle }) {
  const [activeTab, setActiveTab] = useState('Pestaña 1');

  const handleDragStart = (event, itemType) => {
    event.dataTransfer.setData('itemType', itemType);
  };

  return (
    <div className="Sidebar" id="sidebar">
      <ul className="headerSidebar">
        <li className={activeTab === 'Pestaña 1' ? 'active' : ''}>
          <a onClick={() => setActiveTab('Pestaña 1')}>Pestaña 1</a>
        </li>
        <li className={activeTab === 'Pestaña 2' ? 'active' : ''}>
          <a onClick={() => setActiveTab('Pestaña 2')}>Pestaña 2</a>
        </li>
      </ul>

      <h2>Opciones</h2>

      {activeTab === 'Pestaña 1' && (
        <div>
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
        </div>
      )}

      {activeTab === 'Pestaña 2' && (
        <div>
          <div
            className="draggable-item"
            draggable
            onDragStart={(event) => handleDragStart(event, 'Elemento 3')}
          >
            Elemento 3
          </div>
          <div
            className="draggable-item"
            draggable
            onDragStart={(event) => handleDragStart(event, 'Elemento 4')}
          >
            Elemento 4
          </div>
        </div>
      )}

      <button onClick={onConnectToggle}>Conectar</button>
    </div>
  );
}

export default Sidebar;
