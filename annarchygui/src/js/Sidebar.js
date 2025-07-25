import React, { useState, useEffect, useRef } from 'react';
import './../css/Sidebar.css';
import ConfigPanelNeuron from './ConfigPanelNeuron'; // Importa el componente Gestionador
import { generateANNarchyCodeUser } from '../SubModulos/CodeGenerator'; // Importa el componente CodeGenerator
import ConfigPanelSynapse from './ConfigPanelSynapse';

/**
 * Componente Sidebar para la gestión de modelos neuronales, sinápticos y generación de código ANNarchy.
 * @param {function} onConnectToggle - Función para activar el modo de conexión de sinapsis.
 * @param {Array} items - Elementos actuales en el lienzo.
 * @param {Array} connections - Conexiones actuales en el lienzo.
 * @param {function} onMonitorToggle - Función para activar/desactivar monitores.
 * @param {function} onAssignMonitor - Función para activar el modo de asignación de monitores.
 * @param {Array} monitors - Lista de monitores actuales.
 * @param {number} simulationTime - Tiempo de simulación.
 * @param {number} stepTime - Paso temporal de simulación.
 */
function Sidebar({ onConnectToggle, items, connections, onMonitorToggle, onAssignMonitor, monitors, simulationTime, stepTime }) {
  /**
   * Pestaña activa del sidebar ('Opciones' o 'Código').
   */
  const [activeTab, setActiveTab] = useState('Opciones');
  /**
   * Modelos neuronales personalizados creados por el usuario.
   */
  const [customModels, setCustomModels] = useState([]);
  /**
   * Estado para mostrar/ocultar el panel de creación de neuronas personalizadas.
   */
  const [showGestionador, setShowGestionador] = useState(false);
  /**
   * Estado para mostrar/ocultar el submenú de modelos neuronales.
   */
  const [showNeuronModels, setShowNeuronModels] = useState(false);
  /**
   * Estado temporal para la creación de un nuevo modelo neuronal personalizado.
   */
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

  /**
   * Estado para mostrar/ocultar el submenú de modelos de sinapsis.
   */
  const [showSynapseModels, setShowSynapseModels] = useState(false);
  /**
   * Sinapsis personalizadas creadas por el usuario.
   */
  const [customSynapses, setCustomSynapses] = useState([]);
  /**
   * Estado temporal para la creación de una nueva sinapsis personalizada.
   */
  const [newSynapse, setNewSynapse] = useState({
    name: '',
    attributes: { weight: '', delay: '' },
  });
  /**
   * Estado para mostrar/ocultar el panel de creación de sinapsis personalizadas.
   */
  const [showSynapseGestionador, setShowSynapseGestionador] = useState(false);
  /**
   * Código ANNarchy generado para la red actual.
   */
  const [networkCode, setNetworkCode] = useState('');
  /**
   * Estado para indicar si está activo el modo de asignación de monitores.
   */
  const [isAssigningMonitor, setIsAssigningMonitor] = useState(false); 

  /**
   * Ancho actual del sidebar (en píxeles).
   */
  const [sidebarWidth, setSidebarWidth] = useState(250);
  /**
   * Posición X inicial para el redimensionamiento del sidebar.
   */
  const [startX, setStartX] = useState(0);
  /**
   * Ancho inicial del sidebar antes de comenzar a redimensionar.
   */
  const [initialWidth, setInitialWidth] = useState(sidebarWidth);
  /**
   * Referencia al handle de redimensionamiento del sidebar.
   */
  const resizeHandleRef = useRef(null); 

  useEffect(() => {
    if (resizeHandleRef.current) {
      const rect = resizeHandleRef.current.getBoundingClientRect();
      setStartX(rect.left); // Asignar automáticamente la posición inicial
    }
  }, []); // Ejecutar solo una vez al montar el componente

  /**
   * Maneja el movimiento del mouse durante el redimensionamiento del sidebar.
   * @param {MouseEvent} e - Evento de movimiento del mouse.
   */
  const handleMouseMove = (e) => {
    const delta = e.clientX - startX;
    const newWidth = initialWidth - delta;
    if (newWidth < 200) return; // Limitar el ancho mínimo
    setSidebarWidth(newWidth);
  };

  /**
   * Finaliza el redimensionamiento del sidebar y restaura la selección de texto.
   */
  const handleMouseUp = () => {
      document.body.style.userSelect = 'auto'; // Restaurar selección de texto
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    
  };

  /**
   * Inicia el proceso de redimensionamiento del sidebar.
   * @param {MouseEvent} e - Evento de mouse down.
   */
  const startResize = (e) => {
    e.preventDefault(); // Evitar comportamientos por defecto
    const rect = resizeHandleRef.current.getBoundingClientRect();
    setStartX(rect.left); // Actualizar startX dinámicamente
    setInitialWidth(sidebarWidth);
    document.body.style.userSelect = 'none'; // Deshabilitar selección de texto
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  /**
   * Estado de modelos neuronales predefinidos en sidebar
   */
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
      variablesMonitor: ['v', 'spike','raster_plot'],
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
      variablesMonitor: ['v','u', 'spike','raster_plot'], 
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

  /**
   * Estado de modelos de sinapsis predefinidos en sidebar
   */
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


  /**
   * Maneja el inicio del drag de un modelo neuronal o sináptico.
   * @param {DragEvent} event - Evento de drag.
   * @param {Object} model - Modelo a arrastrar.
   */
  const handleDragStart = (event, model) => {
    event.dataTransfer.setData('application/json', JSON.stringify(model));
  };

  /**
   * Guarda un nuevo modelo neuronal personalizado en la lista.
   * @param {Object} updatedModel - Modelo neuronal actualizado.
   */
  const handleSaveModel = (updatedModel) => {
    setCustomModels([...customModels, { ...updatedModel, id: customModels.length + 1, type: 'Población neuronal' }]);
    setShowGestionador(false);
  };

  /**
   * Guarda una nueva sinapsis personalizada en la lista.
   * @param {Object} updatedSynapse - Sinapsis actualizada.
   */
  const handleSaveSynapse = (updatedSynapse) => {
    const newCustomSynapses = [...customSynapses, { ...updatedSynapse, id: customSynapses.length + 1, type: 'Sinapsis', name: updatedSynapse.name }];
    setCustomSynapses(newCustomSynapses);
    setShowSynapseGestionador(false);
  };

  /**
   * Activa el modo de conexión para una sinapsis seleccionada.
   * @param {Object} synapse - Sinapsis seleccionada.
   */
  const handleSynapseClick = (synapse) => {
    onConnectToggle(synapse);
  };

  /**
   * Genera el código ANNarchy de la red actual y lo almacena en el estado.
   */
  const handleGenerateNetworkCode = () => {
    const code = generateANNarchyCodeUser(items, connections, monitors, simulationTime, stepTime);
    setNetworkCode(code);
  };

  /**
   * Activa el modo de asignación de monitores.
   */
  const handleAssignMonitorClick = () => {
    setIsAssigningMonitor(true);
    onAssignMonitor(true); // Notificar al Lienzo que está en modo de asignación
  };
  /**
   * UseEffect para generar el código ante cambios en el liezno
   */
  useEffect(() => {
    handleGenerateNetworkCode();
  }, [items, connections, monitors,stepTime]);

  /**
   * Estado para cambiar el tiempo de simulacion
   */
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
          </div>
        )}

        {/* Simulation */}
      

      {activeTab === 'Código' && (
        <div className="Sidebar-Content">
          <h3>Generated Network Code:</h3>
          <pre>{networkCode}</pre>
          <button
            onClick={() => {
              import('../SubModulos/CodeGenerator').then(({ downloadCodeAsFile }) => {
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
            <ConfigPanelNeuron neuron={newModel} onSave={handleSaveModel} />
          </div>
        </div>
      )}
      {showSynapseGestionador && (
        <div className="gestionador-container">
          <div className="gestionador-content">
            <span className="close" onClick={() => setShowSynapseGestionador(false)}>&times;</span>
            <ConfigPanelSynapse synapse={newSynapse} onSave={handleSaveSynapse} />
          </div>
        </div>
      )}
      <div
        className="Sidebar-resize-handle"
        ref={resizeHandleRef} 
        onMouseDown={startResize}
      ></div>
    </div>
  );
}

export default Sidebar;
