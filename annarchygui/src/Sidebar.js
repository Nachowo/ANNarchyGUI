import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import Gestionador from './Gestionador'; // Importa el componente Gestionador
import SynapseGestionador from './SynapseGestionador'; // Importa el componente SynapseGestionador
import CodeGenerator, { generateANNarchyCode } from './CodeGenerator'; // Importa el componente CodeGenerator

function Sidebar({ onConnectToggle, items, connections }) {
  const [activeTab, setActiveTab] = useState('Opciones');
  const [customModels, setCustomModels] = useState([]);
  const [showGestionador, setShowGestionador] = useState(false);
  const [showNeuronModels, setShowNeuronModels] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    quantity: '',
    attributes: {
      name: '',
      quantity: '1',
      attributes: {
        tipo: 'Spiking neuron', 
        parameters: {},
        equations: '',
        functions: {},
        variables: {},
        spike: '',
        axon_spike: '',
        reset: '',
        axon_reset: '',
        refractory: '',
      }
    }
  });

  const [showSynapseModels, setShowSynapseModels] = useState(false);
  const [customSynapses, setCustomSynapses] = useState([]);
  const [newSynapse, setNewSynapse] = useState({
    name: '',
    attributes: { weight: '', delay: '' },
  });
  const [showSynapseGestionador, setShowSynapseGestionador] = useState(false);
  const [networkCode, setNetworkCode] = useState('');

  const predefinedModels = [
    {
      id: 1,
      type: 'Población neuronal',
      name: 'LIF Neuron',
      quantity: 1,
      attributes: {
        tipo: 'Spiking neuron',
        parameters: { tau: 10, I: 1 },
        equations:  'dv/dt = (I - v) / tau',
        functions: {},
        variables: { v: -65 },
        spike: 'v >= -50',
        axon_spike: '',
        reset: 'v = -65',
        axon_reset: '',
        refractory: '',
      }
    },
    {
      id: 2,
      type: 'Población neuronal',
      name: 'Izhikevich Neuron',
      quantity: 1,
      attributes: {
        tipo: 'Spiking neuron',
        parameters: { a: 0.02, b: 0.2, c: -65, d: 8, I: 10 },
        equations: 'dv/dt = 0.04 * v^2 + 5 * v + 140 - u + I : 1',
        functions: {},
        variables: { v: -65, u: -14 },
        spike: '',
        axon_spike: '',
        reset: '',
        axon_reset: '',
        refractory: '',
      }
    },
    {
      id: 3,
      type: 'Población neuronal',
      name: 'Hodgkin-Huxley Neuron',
      quantity: 1,
      attributes: {
        tipo: 'Spiking neuron',
        parameters: { g_na: 120, g_k: 36, g_l: 0.3, v_na: 50, v_k: -77, v_l: -54.4, C: 1 },
        equations:  'dv: dv/dt = (I - (g_na*m^3*h*(v - v_na) + g_k*n^4*(v - v_k) + g_l*(v - v_l)) / C) : 1' ,
        functions: {},
        variables: { v: -65, m: 0.0529, h: 0.5961, n: 0.3177 },
        spike: '',
        axon_spike: '',
        reset: '',
        axon_reset: '',
        refractory: '',
      }
    },
    {
      id: 4,
      type: 'Población neuronal',
      name: 'Poisson Neuron',
      quantity: 1,
      attributes: {
        tipo: 'Rate-Coded neuron',
        parameters: { rate: 10.0 },
        equations:  'spike: spike = 1.0 * (rand() < rate * dt) : boolean' ,
        functions: {},
        variables: {},
        spike: '',
        axon_spike: '',
        reset: '',
        axon_reset: '',
        refractory: '',
      }
    }
  ];

  const predefinedSynapses = [
    {
      id: 1,
      type: 'Sinapsis',
      name: 'Synapse',
      attributes: {
        parameters: {},
        equations: '',
        psp: '',
        operation: '',
        pre_spike: '',
        post_spike: '',
        pre_axon_spike: '',
        functions: ''
      },
    }
  ];

  const handleDragStart = (event, model) => {
    event.dataTransfer.setData('application/json', JSON.stringify(model));
  };

  const handleSaveModel = (updatedModel) => {
    setCustomModels([...customModels, { ...updatedModel, id: customModels.length + 1, type: 'Población neuronal' }]);
    setShowGestionador(false);
  };

  const handleSaveSynapse = (updatedSynapse) => {
    const newCustomSynapses = [...customSynapses, { ...updatedSynapse, id: customSynapses.length + 1, type: 'Sinapsis', name: updatedSynapse.name }];
    setCustomSynapses(newCustomSynapses);
    setShowSynapseGestionador(false);
  };

  const handleSynapseClick = (synapse) => {
    onConnectToggle(synapse);
  };

  const handleGenerateNetworkCode = () => {
    const code = generateANNarchyCode(items, connections);
    setNetworkCode(code);
  };

  useEffect(() => {
    handleGenerateNetworkCode();
  }, [items, connections]);

  return (
    <div className="Sidebar" id='sidebar'>
      {}
      <ul className="Sidebar-Tabs">
        <li
          className={activeTab === 'Opciones' ? 'active' : ''}
          onClick={() => setActiveTab('Opciones')}
        >
          Options
        </li>
        <li
          className={activeTab === 'Código' ? 'active' : ''}
          onClick={() => {
            setActiveTab('Código');
            handleGenerateNetworkCode();
          }}
        >
          Code
        </li>
      </ul>

      
        {activeTab === 'Opciones' && (
          <div className="Sidebar-Content">
            <div className="Sidebar-Section">
          <h3 onClick={() => setShowNeuronModels(!showNeuronModels)}>
            Neurons {showNeuronModels ? '▲' : '▼'}
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
              {model.name} (Custom)
            </div>
              ))}
            </div>
          )}
            </div>
            <button onClick={() => setShowGestionador(true)}>Create Neuron</button>
            
            <div className="Sidebar-Section">
          <h3 onClick={() => setShowSynapseModels(!showSynapseModels)}>
            Synapses {showSynapseModels ? '▲' : '▼'}
          </h3>
          {showSynapseModels && (
            <div className="Sidebar-Submenu">
              {predefinedSynapses.map((synapse) => (
            <div
              key={synapse.id}
              className="Sidebar-Item"
              onClick={() => handleSynapseClick(synapse)}
            >
              {synapse.name}
            </div>
              ))}
              {customSynapses.map((synapse) => (
            <div
              key={synapse.id}
              className="Sidebar-Item"
              onClick={() => handleSynapseClick(synapse)}
            >
              {synapse.name} (Custom)
            </div>
              ))}
            </div>
          )}
            </div>
            <button onClick={() => setShowSynapseGestionador(true)}>Create Synapse</button>
            <div>
          </div>
          </div>
        )}

        {/* Simulation */}
      

      {activeTab === 'Código' && (
        <div className="Sidebar-Content">
          <h3>Generated Network Code:</h3>
          <pre>{networkCode}</pre>
        </div>
      )}

      {/* Manager to create custom neurons */}
      {showGestionador && (
        <div className="gestionador-container">
          <div className="gestionador-content">
            <span className="close" onClick={() => setShowGestionador(false)}>&times;</span>
            <Gestionador neuron={newModel} onSave={handleSaveModel} />
          </div>
        </div>
      )}
      {showSynapseGestionador && (
        <div className="gestionador-container">
          <div className="gestionador-content">
            <span className="close" onClick={() => setShowSynapseGestionador(false)}>&times;</span>
            <SynapseGestionador synapse={newSynapse} onSave={handleSaveSynapse} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
