import React, { useState, useEffect, useRef } from 'react';
import './../css/Sidebar.css';
import Gestionador from './Gestionador'; // Importa el componente Gestionador
import SynapseGestionador from './SynapseGestionador'; // Importa el componente SynapseGestionador
import CodeGenerator, { generateANNarchyCode } from './CodeGenerator'; // Importa el componente CodeGenerator

function Sidebar({ onConnectToggle, items, connections, onMonitorToggle, onAssignMonitor, monitors, simulationTime }) {
  const [activeTab, setActiveTab] = useState('Opciones');
  const [customModels, setCustomModels] = useState([]);
  const [showGestionador, setShowGestionador] = useState(false);
  const [showNeuronModels, setShowNeuronModels] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    quantity: '',
    hasMonitor: false,
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
  const [isAssigningMonitor, setIsAssigningMonitor] = useState(false); // Nuevo estado para modo de asignación

  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [startX, setStartX] = useState(0);
  const [initialWidth, setInitialWidth] = useState(sidebarWidth);
  const resizeHandleRef = useRef(null); // Referencia al div de Sidebar-resize-handle

  useEffect(() => {
    if (resizeHandleRef.current) {
      const rect = resizeHandleRef.current.getBoundingClientRect();
      setStartX(rect.left); // Asignar automáticamente la posición inicial
    }
  }, []); // Ejecutar solo una vez al montar el componente

  const handleMouseMove = (e) => {
    const delta = e.clientX - startX;
    const newWidth = initialWidth - delta;
    if (newWidth < 200) return; // Limitar el ancho mínimo
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
      document.body.style.userSelect = 'auto'; // Restaurar selección de texto
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    
  };

  const startResize = (e) => {
    e.preventDefault(); // Evitar comportamientos por defecto
    const rect = resizeHandleRef.current.getBoundingClientRect();
    setStartX(rect.left); // Actualizar startX dinámicamente
    setInitialWidth(sidebarWidth);
    document.body.style.userSelect = 'none'; // Deshabilitar selección de texto
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const predefinedModels = [
    {
      id: 1,
      type: 'Población neuronal',
      name: 'LIF Neuron',
      quantity: 1,
      hasMonitor: false,
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
      },
      variablesMonitor: ['v', 'spike','raster_plot'], // Agregado spike
    },
    {
      id: 2,
      type: 'Población neuronal',
      name: 'Izhikevich Neuron',
      quantity: 1,
      hasMonitor: false,
      attributes: {
        tipo: 'Spiking neuron',
        parameters: {
          noise: 5.0,
          a: 0.02,
          b: 0.2,
          c: -65.0,
          d: 2.0,
          v_thresh: 30.0
        },
        equations: "I = g_exc - g_inh + noise * Normal(0.0, 1.0)\ndv/dt = 0.04 * v^2 + 5.0 * v + 140.0 - u + I\ndu/dt = a * (b*v - u)",
        functions: {},
        variables: {},
        spike: "v >= v_thresh",
        axon_spike: '',
        reset: "v = c\nu += d",
        axon_reset: '',
        refractory: ''
      },
      variablesMonitor: ['v','u', 'spike','raster_plot'], // Agregado spike
    },
    {
      id: 3,
      type: 'Población neuronal',
      name: 'Hodgkin-Huxley Neuron',
      quantity: 1,
      hasMonitor: false,
      attributes: {
        tipo: 'Spiking neuron',
        parameters: {
          C: 1.0,
          VL: -59.387,
          VK: -82.0,
          VNa: 45.0,
          gK: 36.0,
          gNa: 120.0,
          gL: 0.3,
          vt: 30.0,
          I: 0.0
        },
        equations: `# Previous membrane potential\nprev_V = V\n\n# Voltage-dependency parameters\nan = 0.01 * (V + 60.0) / (1.0 - exp(-0.1* (V + 60.0) ) )\nam = 0.1 * (V + 45.0) / (1.0 - exp (- 0.1 * ( V + 45.0 )))\nah = 0.07 * exp(- 0.05 * ( V + 70.0 ))\n\nbn = 0.125 * exp (- 0.0125 * (V + 70.0))\nbm = 4.0 *  exp (- (V + 70.0) / 80.0)\nbh = 1.0/(1.0 + exp (- 0.1 * ( V + 40.0 )) )\n\n# Alpha/Beta functions\ndn/dt = an * (1.0 - n) - bn * n : init = 0.3, midpoint\ndm/dt = am * (1.0 - m) - bm * m : init = 0.0, midpoint\ndh/dt = ah * (1.0 - h) - bh * h : init = 0.6, midpoint\n\n# Membrane equation\nC * dV/dt = gL * (VL - V ) + gK * n**4 * (VK - V) + gNa * m**3 * h * (VNa - V) + I : midpoint\n`,
        functions: {},
        variables: { V: -65, m: 0.0, h: 0.6, n: 0.3 },
        spike: '(V > vt) and (prev_V <= vt)',
        axon_spike: '',
        reset: '',
        axon_reset: '',
        refractory: '',
        prev: ["dt=0.01", "setup(dt=dt)"]
      },
      variablesMonitor: ['V','m','h','n', 'spike','raster_plot'], 
    },
    {
      id: 4,
      type: 'Población neuronal',
      name: 'Poisson Neuron',
      quantity: 1,
      hasMonitor: false,
      attributes: {
        tipo: 'Spiking neuron',
        parameters: { rate: 10.0 },
        equations:  'spike: spike = 1.0 * (rand() < rate * dt) : boolean' ,
        functions: {},
        variables: {},
        spike: '',
        axon_spike: '',
        reset: '',
        axon_reset: '',
        refractory: '',
      },
      variablesMonitor: ['spike','raster_plot'], 
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

  const predefinedMonitors = [
    {
      id: 1,
      type: 'Monitor',
      name: 'Monitor',
      attributes: {
        target: '1',
        variables: ["xd"]
      }
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
    const code = generateANNarchyCode(items, connections, monitors, simulationTime);
    setNetworkCode(code);
  };

  const handleAssignMonitorClick = () => {
    setIsAssigningMonitor(true);
    onAssignMonitor(true); // Notificar al Lienzo que está en modo de asignación
  };

  useEffect(() => {

    handleGenerateNetworkCode();
  }, [items, connections, monitors]);

  useEffect(() => {
    handleGenerateNetworkCode();
  }, [simulationTime]);

  return (
    <div className="Sidebar" id='sidebar' style={{ width: sidebarWidth + 'px', position: 'relative' }}>
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
            <button onClick={handleAssignMonitorClick}>Assign Monitor</button> {/* Nuevo botón */}
            <div>
          </div>
          </div>
        )}

        {/* Simulation */}
      

      {activeTab === 'Código' && (
        <div className="Sidebar-Content">
          <h3>Generated Network Code:</h3>
          <pre>{networkCode}</pre>
          <button
            onClick={() => {
              import('./CodeGenerator').then(({ downloadCodeAsFile }) => {
                downloadCodeAsFile(networkCode);
              });
            }}
            style={{ marginTop: '10px' }}
          >
            Download Code
          </button>
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
      <div
        className="Sidebar-resize-handle"
        ref={resizeHandleRef} // Asignar la referencia al div
        onMouseDown={startResize}
      ></div>
    </div>
  );
}

export default Sidebar;
