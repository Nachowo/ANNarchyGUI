import React, { useState } from 'react';
import './Sidebar.css';
import Gestionador from './Gestionador'; // Importa el componente Gestionador
import CodeGenerator from './CodeGenerator'; // Importa el componente CodeGenerator

function Sidebar({ onConnectToggle, items, connections }) {
  const [activeTab, setActiveTab] = useState('Opciones');
  const [simulationTime, setSimulationTime] = useState(0);
  const [customModels, setCustomModels] = useState([]);
  const [showGestionador, setShowGestionador] = useState(false);
  const [showNeuronModels, setShowNeuronModels] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    quantity: '',
    neuron: {
      equation: '',
      parameters: { },
      variables: {  },
    },
    attributes: { firingRate: '', threshold: '' },
  });

  const [showSynapseModels, setShowSynapseModels] = useState(false);
  const [customSynapses, setCustomSynapses] = useState([]);
  const [newSynapse, setNewSynapse] = useState({
    name: '',
    attributes: { weight: '', delay: '' },
  });

  const predefinedModels = [
    {
      id: 1,
      type: 'Población neuronal',
      name: 'LIF Neuron',
      quantity: 100,
      neuron: {
        equation: 'dv/dt = (-v + I) / tau : 1',
        parameters: { tau: 10, I: 1 },
        variables: { v: -65 },
      },
      attributes: { firingRate: 10, threshold: -55 },
    },
    {
      id: 2,
      type: 'Población neuronal',
      name: 'Izhikevich Neuron',
      quantity: 100,
      neuron: {
        equation: 'dv/dt = 0.04*v^2 + 5*v + 140 - u + I; du/dt = a*(b*v - u)',
        parameters: { a: 0.02, b: 0.2, c: -65, d: 8, I: 10 },
        variables: { v: -65, u: -14 },
      },
      attributes: { firingRate: 10, threshold: -55 },
    },
    {
      id: 3,
      type: 'Población neuronal',
      name: 'Hodgkin-Huxley Neuron',
      quantity: 100,
      neuron: {
        equation: 'dv/dt = (I - (g_na*m^3*h*(v - v_na) + g_k*n^4*(v - v_k) + g_l*(v - v_l)) / C) : 1',
        parameters: { g_na: 120, g_k: 36, g_l: 0.3, v_na: 50, v_k: -77, v_l: -54.4, C: 1 },
        variables: { v: -65, m: 0.0529, h: 0.5961, n: 0.3177 },
      },
      attributes: { firingRate: 10, threshold: -55 },
    },
    {
      id: 4,
      type: 'Población neuronal',
      name: 'Poisson Neuron',
      quantity: 100,
      neuron: {
        equation: 'spike = 1.0 * (rand() < rate * dt) : boolean',
        parameters: { rate: 10.0 },
        variables: {},
      },
    }
  ];

  const predefinedSynapses = [
    {
      id: 1,
      type: 'Sinapsis',
      name: 'Excitatory Synapse',
      attributes: { weight: 0.1, delay: 1 },
    },
    {
      id: 2,
      type: 'Sinapsis',
      name: 'Inhibitory Synapse',
      attributes: { weight: -0.1, delay: 1 },
    },
  ];

  const handleDragStart = (event, model) => {
    event.dataTransfer.setData('application/json', JSON.stringify(model));
  };

  const handleSaveModel = (updatedModel) => {
    setCustomModels([...customModels, { ...updatedModel, id: customModels.length + 1, type: 'Población neuronal' }]);
    setShowGestionador(false);
  };

  const handleSaveSynapse = (updatedSynapse) => {
    setCustomSynapses([...customSynapses, { ...updatedSynapse, id: customSynapses.length + 1, type: 'Sinapsis', name: updatedSynapse.attributes.name }]);
    setShowGestionador(false);
  };

  const handleSynapseClick = (synapse) => {
    onConnectToggle(synapse);
  };

  return (
    <div className="Sidebar" id='sidebar'>
      {/* Tabs */}
      <ul className="Sidebar-Tabs">
        <li
          className={activeTab === 'Opciones' ? 'active' : ''}
          onClick={() => setActiveTab('Opciones')}
        >
          Opciones
        </li>
        <li
          className={activeTab === 'Simulación' ? 'active' : ''}
          onClick={() => setActiveTab('Simulación')}
        >
          Simulación
        </li>
      </ul>

      {/* Opciones */}
      {activeTab === 'Opciones' && (
        <div className="Sidebar-Content">
          <div className="Sidebar-Section">
            <h3 onClick={() => setShowNeuronModels(!showNeuronModels)}>
              Neuronas {showNeuronModels ? '▲' : '▼'}
            </h3>
            {showNeuronModels && (
              <div className="Sidebar-Submenu">
                {predefinedModels.map((model) => (
                  <div
                    key={model.id}
                    className="Sidebar-Item"
                    draggable
                    onDragStart={(event) => handleDragStart(event, model)}
                  >
                    {model.name}
                  </div>
                ))}
                {customModels.map((model) => (
                  <div
                    key={model.id}
                    className="Sidebar-Item"
                    draggable
                    onDragStart={(event) => handleDragStart(event, model)}
                  >
                    {model.name} (Personalizado)
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setShowGestionador(true)}>Crear Neurona</button>
          
          <div className="Sidebar-Section">
            <h3 onClick={() => setShowSynapseModels(!showSynapseModels)}>
              Sinapsis {showSynapseModels ? '▲' : '▼'}
            </h3>
            {showSynapseModels && (
              <div className="Sidebar-Submenu">
                {predefinedSynapses.map((synapse) => (
                  <button
                    key={synapse.id}
                    className="Sidebar-Item"
                    onClick={() => handleSynapseClick(synapse)}
                  >
                    {synapse.name}
                  </button>
                ))}
                {customSynapses.map((synapse) => (
                  <button
                    key={synapse.id}
                    className="Sidebar-Item"
                    onClick={() => handleSynapseClick(synapse)}
                  >
                    {synapse.name} (Personalizado)
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setShowGestionador(true)}>Crear Sinapsis</button>
          <div>
            </div>
        </div>
      )}

      {/* Simulación */}
      {activeTab === 'Simulación' && (
        <div className="Sidebar-Content">
          <div>
            <label>Tiempo de Simulación:</label>
            <input
              type="number"
              value={simulationTime}
              onChange={(e) => setSimulationTime(e.target.value)}
            />
          </div>
          <CodeGenerator items={items} connections={connections} />
        </div>
      )}

      {/* Gestionador para crear neuronas personalizadas */}
      {showGestionador && (
        <div className="gestionador-container">
          <div className="gestionador-content">
            <span className="close" onClick={() => setShowGestionador(false)}>&times;</span>
            <Gestionador neuron={newModel} onSave={handleSaveModel} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
