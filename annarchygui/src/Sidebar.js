import React, { useState } from 'react';
import './Sidebar.css';
import Modal from './Modal'; // Importa el componente Modal

function Sidebar({ onConnectToggle }) {
  const [activeTab, setActiveTab] = useState('Pestaña 1');
  const [simulationTime, setSimulationTime] = useState(0);
  const [customModels, setCustomModels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModelList, setShowModelList] = useState(false); // Estado para mostrar/ocultar la lista de modelos
  const [newModel, setNewModel] = useState({
    name: '',
    quantity: '', // Añadir la cantidad de neuronas
    neuron: {
      equation: '', // Añadir la ecuación de la neurona
      parameters: {
        tau: '',
        I: '',
      },
      variables: {
        v: '',
      },
    },
    attributes: {
      firingRate: '',
      threshold: '',
    },
  });

  // Neurona predeterminada
  const neuronModel = {
    id: 1,
    type: 'Población neuronal',
    name: 'Población Neuronal',
    quantity: 100, // Añadir la cantidad de neuronas
    neuron: {
      equation: 'dv/dt = -v + I', // Añadir la ecuación de la neurona
      parameters: {
        tau: 10,
        I: 1,
      },
      variables: {
        v: -65,
      },
    },
    attributes: {
      firingRate: 10,
      threshold: -55,
    },
  };

  //Monitor predeterminado
  const monitorModel = {
    id: 2,
    type: 'Monitor',
    name: 'Monitor',
    attributes: {
      variable: 'v',
      intervalo: 1.0,
    },
  };

  //Estimulo predeterminado
  const estimuloModel = {
    id: 3,
    type: 'Estimulo',
    name: 'Estimulo',
    attributes: {
      amplitud: 0.5,
      inicio: 0.0,
      duracion: 1.0,
    },
  };
  //Sinapsis predeterminada
  const sinapsisModel = {
    id: 4,
    name: 'Sinapsis',
    attributes: {
      peso: 0.5,
      delay: 1.0,
      direccion: 'Excitatoria',
    },
  };

  // Maneja el drag de un elemento
  const handleDragStart = (event, model) => {
    event.dataTransfer.setData('application/json', JSON.stringify(model));
  };

  // Maneja el cambio en el formulario del modal
  const handleInputChange = (e, attr) => {
    setNewModel({
      ...newModel,
      attributes: {
        ...newModel.attributes,
        [attr]: e.target.value,
      },
    });
  };

  // Maneja el cambio en el modelo o cantidad del nuevo modelo personalizado
  const handleModelChange = (e, field) => {
    setNewModel({
      ...newModel,
      [field]: e.target.value,
    });
  };

  // Guarda el nuevo modelo personalizado
  const handleSaveModel = () => {
    setCustomModels([...customModels, { ...newModel, id: customModels.length + 1, type: 'Población neuronal' }]);
    setShowModal(false);
    setNewModel({
      name: '',
      quantity: '', // Añadir la cantidad de neuronas
      neuron: {
        equation: '', // Añadir la ecuación de la neurona
        parameters: {
          tau: '',
          I: '',
        },
        variables: {
          v: '',
        },
      },
      attributes: {
        firingRate: '',
        threshold: '',
      },
    });
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
        <div className="sidebar-content">
          <div className="default-items">
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
              {monitorModel.name}
            </div>
            <div
              className="draggable-item"
              draggable
              onDragStart={(event) => handleDragStart(event, estimuloModel)}
            >
              {estimuloModel.name}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Pestaña 2' && (
        <div>
          <div>
            <label>Tiempo de Simulación:</label>
            <input
              type="number"
              value={simulationTime}
              onChange={(e) => setSimulationTime(e.target.value)}
            />
          </div>
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
      <button onClick={() => setShowModal(true)}>Crear Neurona</button>
      <button onClick={() => setShowModelList(!showModelList)}>Mostrar Modelos</button> {/* Botón para mostrar/ocultar la lista de modelos */}

      {showModelList && (
        <div className="model-list">
          <h3>Modelos Personalizados</h3>
          <ul>
            {customModels.map((model) => (
              <li
                key={model.id}
                draggable
                onDragStart={(event) => handleDragStart(event, model)}
              >
                {model.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          newModel={newModel}
          setNewModel={setNewModel}
          handleSaveModel={handleSaveModel}
          handleModelChange={handleModelChange}
          handleInputChange={handleInputChange}
        />
      )}
    </div>
  );
}

export default Sidebar;
