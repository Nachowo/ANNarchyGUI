import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ onConnectToggle }) {
  const [activeTab, setActiveTab] = useState('Pestaña 1');

  // Ejemplo de un modelo de neurona
  const neuronModel = {
    id: 1,
    name: 'Población neuronal',
    attributes: {
      cantidad: 1,
      firingRate: 10,
      threshold: -55,
    },
  };

  const monitorModel = {
    id: 2,
    name: 'Monitor',
    attributes: {
      vatiable: 'v',
      intervalo: 1.0,
    },
  };

  const estimuloModel = {
    id: 3,
    name: 'Estimulo',
    attributes: {
      amplitud: 0.5,
      inicio: 0.0,
      duracion: 1.0,
    },
  };

  const sinapsisModel = {
    id: 4,
    name: 'Sinapsis',
    attributes: {
      peso: 0.5,
      delay: 1.0,
      direccion: 'Excitatoria',
    },
  };

  const handleDragStart = (event, model) => {
    event.dataTransfer.setData('application/json', JSON.stringify(model));
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
            onDragStart={(event) => handleDragStart(event, neuronModel)} 
          >
            {neuronModel.name}
          </div>
          <div
            className="draggable-item"
            draggable
            onDragStart={(event) => handleDragStart(event, monitorModel)}
          >
            Monitor
          </div>
          <div
            className="draggable-item"
            draggable
            onDragStart={(event) => handleDragStart(event, estimuloModel)}
          >
            Estimulo
          </div>
        </div>
      )}

      {activeTab === 'Pestaña 2' && (
        <div>
          <div
            className="draggable-item"
            draggable
            onDragStart={(event) => handleDragStart(event, { id: 3, name: 'Elemento 3' })}
          >
            Elemento 3
          </div>
          <div
            className="draggable-item"
            draggable
            onDragStart={(event) => handleDragStart(event, { id: 4, name: 'Elemento 4' })}
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
