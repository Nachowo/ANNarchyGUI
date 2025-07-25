import React, { useState, useEffect } from 'react';
import './../css/Lienzo.css';
import ConfigPanelNeuron from './ConfigPanelNeuron'; // Importar el componente Gestionador
import ConfigPanelSynapse from './ConfigPanelSynapse'; // Importar el componente SynapseGestionador

/**
 * Componente principal del lienzo de ANNarchyGUI.
 * Permite arrastrar, soltar, conectar y editar poblaciones neuronales, sinapsis, monitores y estímulos.
 * Gestiona el estado visual y funcional del canvas, así como la interacción con los paneles de configuración.
 */
function Lienzo({ isConnecting: [isConnecting, setIsConnecting], items, setItems, selectedSynapse, connections, setConnections, isAssigningMonitor, setIsAssigningMonitor, monitors, setMonitors, graphics, graphicMonitors, variablesData,lastSimTime }) {
  const [draggedItemIndex, setDraggedItemIndex] = useState(null); // Índice del elemento que se está arrastrando
  const [nextId, setNextId] = useState(1); // Siguiente ID disponible para nuevos elementos
  const [nextMonitorId, setNextMonitorId] = useState(1); // Siguiente ID disponible para monitores
  const [selectedItems, setSelectedItems] = useState([]); // Elementos seleccionados para conexión
  const [stimulusMonitorConnections, setStimulusMonitorConnections] = useState([]); // Conexiones de estímulos y monitores
  const [showGestionador, setShowGestionador] = useState(false); // Mostrar/ocultar el panel de gestión de neuronas
  const [selectedNeuron, setSelectedNeuron] = useState(null); // Neurona seleccionada para edición
  const [showSynapseGestionador, setShowSynapseGestionador] = useState(false); // Mostrar/ocultar el panel de gestión de sinapsis
  const [selectedSynapseItem, setSelectedSynapseItem] = useState(null); // Sinapsis seleccionada para edición
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight }); // Tamaño actual del lienzo

  /**
   * UseEffect para disponer items en el lienzo
   */  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      setItems((prevItems) =>
        prevItems.map((item) => {
          const adjustedX = Math.min(Math.max((item.x / canvasSize.width) * newWidth, 0), newWidth - 100); 
          const adjustedY = Math.min(Math.max((item.y / canvasSize.height) * newHeight, 0), newHeight - 50); 
          return {
            ...item,
            x: adjustedX,
            y: adjustedY,
          };
        })
      );

      setCanvasSize({ width: newWidth, height: newHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasSize, setItems]);

  /**
   * Permite el arrastre sobre el lienzo (necesario para el drop).
   */
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  /**
   * Maneja el evento de soltar un elemento en el lienzo (nuevo o reposicionado).
   */
  const handleDrop = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('application/json');

    const rect = event.currentTarget.getBoundingClientRect(); 
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const elementWidth = 100;
    const elementHeight = 50;

    if (data) {
      const newItem = JSON.parse(data);
      const itemToAdd = {
        id: nextId,
        type: newItem.type,
        name: newItem.name,
        quantity: newItem.quantity, // Añadir la cantidad de neuronas
        attributes: newItem.attributes,
        hasMonitor: false, // Añadir el atributo hasMonitor
        x: Math.min(Math.max(x - elementWidth / 2, 0), canvasSize.width - elementWidth), // Limitar dentro del lienzo
        y: Math.min(Math.max(y - elementHeight / 2, 0), canvasSize.height - elementHeight), // Limitar dentro del lienzo
        variablesMonitor: newItem.variablesMonitor || [],
      };
      setItems([...items, itemToAdd]);
      setNextId(nextId + 1);
    } else {
      if (draggedItemIndex !== null) {
        const updatedItems = [...items];
        updatedItems[draggedItemIndex] = {
          ...updatedItems[draggedItemIndex],
          x: Math.min(Math.max(x - elementWidth / 2, 0), canvasSize.width - elementWidth), // Limitar dentro del lienzo
          y: Math.min(Math.max(y - elementHeight / 2, 0), canvasSize.height - elementHeight), // Limitar dentro del lienzo
        };
        setItems(updatedItems);
        setDraggedItemIndex(null);
      }
    }
  };

  /**
   * Elimina todas las conexiones (sinápticas o de estímulo/monitor) asociadas a un elemento.
   */
  const removeConnections = (itemId) => {
    setConnections(prevConnections => prevConnections.filter(connection => connection.origen !== itemId && connection.destino !== itemId));
    setStimulusMonitorConnections(prevConnections => prevConnections.filter(connection => connection.origen !== itemId && connection.destino !== itemId));
  };

  /**
   * Elimina todos los monitores asociados a una población neuronal.
   */
  const removeMonitors = (populationId) => {
    setMonitors(prevMonitors => prevMonitors.filter(monitor => monitor.populationId !== populationId));
  };

  /**
   * Elimina un elemento del lienzo junto con sus conexiones y monitores asociados.
   */
  const handleDeleteItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
    removeConnections(itemId);
    removeMonitors(itemId); // Eliminar monitores asociados
  };

  /**
   * Maneja el clic sobre un elemento para iniciar o continuar una conexión.
   */
  const handleItemClick = (item, event) => {
    event.stopPropagation();
    if (isConnecting) {
      setSelectedItems((prev) => {
        if (prev.length < 2) {
          return [...prev, item];
        } else {
          return [item];
        }
      });
    }
  };

  /**
   * Maneja el clic sobre una población neuronal. Si está en modo de asignar monitor, lo asigna; si no, inicia conexión.
   */
  const handlePopulationClick = (item, event) => {
    event.stopPropagation();
    if (isAssigningMonitor) {
      if (item.hasMonitor) {
        alert('Esta población ya tiene un monitor asignado.');
        return;
      }
      const newMonitor = {
        id: monitors.length + 1,
        target: item.name,
        variables: [item.variablesMonitor[0]],
        populationId: item.id,
        populationName: item.name, // Guardar información de la neurona a la que se conecta
      };
      setMonitors([...monitors, newMonitor]); // Almacenar el monitor en el arreglo
      setItems(items.map(i => i.id === item.id ? { ...i, hasMonitor: true } : i)); // Actualizar el atributo hasMonitor
      setIsAssigningMonitor(false); // Salir del modo de asignación
    } else {
      handleItemClick(item, event);
    }
  };

  /**
   * Muestra el panel de gestión (Gestionador) al hacer clic derecho sobre una población neuronal.
   */
  const handleNeuronContextMenu = (event, item) => {
    event.preventDefault();
    setSelectedNeuron(item);
    setShowGestionador(true);
  };

  /**
   * Guarda los cambios realizados en una población neuronal y sus monitores desde el Gestionador.
   */
  const handleSaveNeuron = (updatedNeuron, updatedMonitors) => {
    setItems(items.map(item =>
      item.id === updatedNeuron.id
        ? { ...item, ...updatedNeuron, attributes: { ...item.attributes, ...updatedNeuron.attributes } }
        : item
    ));
    setMonitors(monitors.map(monitor => {
      const updatedMonitor = updatedMonitors.find(m => m.id === monitor.id);
      return updatedMonitor ? { ...monitor, ...updatedMonitor } : monitor;
    }));
    setShowGestionador(false);
  };

  /**
   * Actualiza las variables monitorizadas de un monitor específico.
   */
  const handleMonitorVariableChange = (monitorId, newVariables) => {
    setMonitors(monitors.map(monitor =>
      monitor.id === monitorId ? { ...monitor, variables: newVariables } : monitor
    ));
  };

  /**
   * Cierra el panel de gestión de neuronas (Gestionador).
   */
  const handleCloseGestionador = () => {
    setShowGestionador(false);
  };

  /**
   * Elimina una conexión sináptica específica.
   */
  const handleDeleteConnection = (connectionId) => {
    setConnections(connections.filter(connection => connection.id !== connectionId));
  };

  /**
   * Guarda los cambios realizados en una sinapsis desde el panel de gestión de sinapsis.
   */
  const handleSaveSynapse = (updatedSynapse) => {
    setConnections(connections.map(connection =>
      connection.id === updatedSynapse.id ? { ...connection, attributes: updatedSynapse.attributes, connections: updatedSynapse.connections } : connection
    ));
    setShowSynapseGestionador(false);
  };

  /**
   * Muestra el panel de gestión de sinapsis al hacer clic derecho sobre una conexión entre poblaciones neuronales.
   */
  const handleSynapseClick = (event, connection) => {
    event.preventDefault();
    setSelectedSynapseItem(connection);
    setShowSynapseGestionador(true);
  };

  /**
   * Efecto para guardar una nueva conexión cuando hay dos elementos seleccionados.
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCloseGestionador();
      }
    };

    const handleClickOutsideGestionador = (event) => {
      if (showGestionador && !event.target.closest('.gestionador-container')) {
        handleCloseGestionador();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutsideGestionador);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutsideGestionador);
    };
  }, [showGestionador]);

  //Funcion para guardar la conexion entre elementos
  useEffect(() => {
    if (selectedItems.length === 2) {
      const [origen, destino] = selectedItems;
      if (origen.id !== destino.id) {
        // Reglas de conexión
        if (
          (origen.type === 'Monitor' || origen.type === 'Estimulo') &&
          destino.type === 'Población neuronal'
        ) {
          setStimulusMonitorConnections(prevConnections => [
            ...prevConnections,
            { id: prevConnections.length + 1, origen: origen.id, destino: destino.id, attributes: selectedSynapse ? { ...selectedSynapse.attributes, name:selectedSynapse.name } : { name: selectedSynapse.name }, connections: { target: 'exc', disable_omp: true, rule: 'all_to_all', weights: '1', delays: '1' } }
          ]);
        } else if (origen.type === 'Población neuronal' && destino.type === 'Población neuronal') {
          if (origen.attributes.tipo === destino.attributes.tipo) {
            const synapseType = origen.attributes.tipo === 'Spiking neuron' ? 'spiking' : 'rate-coded';
            setConnections(prevConnections => [
              ...prevConnections,
              { id: prevConnections.length + 1, origen: origen.id, destino: destino.id, attributes: selectedSynapse ? { ...selectedSynapse.attributes, name: selectedSynapse.name, tipo: synapseType } : { name: selectedSynapse.name, tipo: synapseType }, connections: { target: 'exc', disable_omp: true, rule: 'all_to_all', weights: '1', delays: '1' } }
            ]);
          } else {
            alert('Only neurons of the same type can be connected and use synapses of the same type.');
          }
        } else {
          if (origen.type === 'Monitor' || origen.type === 'Estimulo') {
            alert('Monitors and stimuli can only connect to a neuronal population.');
          } else if (destino.type !== 'Población neuronal') {
            alert('Neuronal populations must always be the destination.');
          }
        }
      } else {
        alert('An item cannot be connected to itself.');
      }
      setIsConnecting(false);
      setSelectedItems([]);
      document.body.style.cursor = 'default';
    }
  }, [selectedItems, setIsConnecting, selectedSynapse, setConnections]);

  /**
   * Quita el modo de conexión si se hace clic en el lienzo vacío.
   */
  const handleCanvasClick = () => {
    if (isConnecting) {
      setIsConnecting(false);
      setSelectedItems([]);
      document.body.style.cursor = 'default';
    }
  };

  /**
   * Función auxiliar para imprimir en consola el estado actual de conexiones, items y monitores.
   */
  const debugear = () => {
    console.log('Current connections:', connections);
    console.log('Current items:', items);
    console.log('Current monitors:', monitors);
    console.log('variablesData:', variablesData);
  };

  /**
   * Renderiza el marcador SVG de flecha para las conexiones.
   */
  const renderArrowMarker = () => {
    const refX = 50;
    return (
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX={refX}
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="black" />
      </marker>
    );
  };

  /**
   * Devuelve la clase CSS correspondiente a la forma del elemento según su tipo.
   */
  const getShapeClass = (type) => {
    switch (type) {
      case 'Población neuronal':
        return 'oval-shape';
      default:
        return '';
    }
  };

  /**
   * Maneja el evento de soltar un elemento fuera del lienzo (por ejemplo, sobre el sidebar para eliminarlo).
   */
  const handleDragEnd = (event, index) => {
    const sidebar = document.getElementById('sidebar');
    const rect = sidebar.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      const itemId = items[index].id;
      setItems(items.filter((_, i) => i !== index));
      removeConnections(itemId);
      removeMonitors(itemId); // Eliminar monitores asociados
    }
  };

  return (
    <div
      className="Lienzo"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      <svg className="connections-svg" style={{ zIndex: 2 }}>
        <defs>
          {renderArrowMarker()}
        </defs>
        {connections.map((connection, index) => {
          const origenItem = items.find(item => item.id === connection.origen);
          const destinoItem = items.find(item => item.id === connection.destino);

          if (!origenItem || !destinoItem) {
            return null;
          }

          const x1 = origenItem.x + 50;
          const y1 = origenItem.y + 25;
          const x2 = destinoItem.x + 50;
          const y2 = destinoItem.y + 25;

          const isNeuronConnection = origenItem.type === 'Población neuronal' && destinoItem.type === 'Población neuronal';

          // Determinar color según el tipo de conexión (exc/inhib)
          let color = 'black';
          if (connection.connections && connection.connections.target === 'exc') {
            color = '#1e88e5'; // Azul para excitatoria 
          } else if (connection.connections && connection.connections.target === 'inh') {
            color = '#e53935'; // Rojo para inhibitoria 
          }

          return (
            <React.Fragment key={index}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth="10"
                pointerEvents="all"
                onContextMenu={(e) => {
                  if (isNeuronConnection) {
                    e.preventDefault();
                    handleSynapseClick(e, connection);
                  }
                }}
                onMouseEnter={(e) => e.target.setAttribute('stroke', 'red')}
                onMouseLeave={(e) => e.target.setAttribute('stroke', 'transparent')}
              />
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                pointerEvents="none"
                onMouseEnter={(e) => e.target.setAttribute('stroke', 'red')}
                onMouseLeave={(e) => e.target.setAttribute('stroke', color)}
              />
              {connection.connections && connection.connections.rule && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 8}
                  textAnchor="middle"
                  fontSize="13"
                  fill={color}
                  fontWeight="bold"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {connection.connections.rule === 'all_to_all'
                    ? 'n:n'
                    : connection.connections.rule === 'one_to_one'
                    ? '1:1'
                    : connection.connections.rule}
                </text>
              )}
            </React.Fragment>
          );
        })}
        {stimulusMonitorConnections.map((connection, index) => {
          const origenItem = items.find(item => item.id === connection.origen);
          const destinoItem = items.find(item => item.id === connection.destino);

          if (!origenItem || !destinoItem) {
            return null; 
          }

          const x1 = origenItem.x + 50;
          const y1 = origenItem.y + 25;
          const x2 = destinoItem.x + 50;
          const y2 = destinoItem.y + 25;

          return (
            <React.Fragment key={index}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="black"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                pointerEvents="none"
              />
            </React.Fragment>
          );
        })}
      </svg>
      <div className="items" >
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`dropped-item ${getShapeClass(item.type)} ${isConnecting ? 'connecting-mode' : ''}`}
            draggable
            onDragStart={(event) => setDraggedItemIndex(index)}
            onDragEnd={(event) => handleDragEnd(event, index)}
            onContextMenu={(e) => {
              if (item.type === 'Población neuronal') {
                handleNeuronContextMenu(e, item);
              }
            }}
            onClick={(event) => handlePopulationClick(item, event)}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              position: 'absolute',
              zIndex: 1, // Asegurar que los elementos estén bajo el sidebar
            }}
          >
            <div className="item-name">{item.type === 'Población neuronal' ? 'Population' : item.type}</div>
            <div>{item.name}</div>
            {item.hasMonitor && (
              <div className="monitor-icon">📊</div> // Mostrar icono si hay un monitor asignado
            )}
          </div>
        ))}
      </div>

      {showGestionador && selectedNeuron && (
        <div className="gestionador-container" onClick={handleCloseGestionador}>
          <div className="gestionador-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowGestionador(false)}>&times;</span>
            <ConfigPanelNeuron
              neuron={selectedNeuron}
              onSave={handleSaveNeuron}
              monitors={monitors}
              setMonitors={setMonitors} // Pasar setMonitors como prop
              onMonitorVariableChange={handleMonitorVariableChange} // Pasar la función
              graphics={graphics} // Pasar graphics
              graphicMonitors={graphicMonitors} // Pasar graphicMonitors
              nextMonitorId={nextMonitorId} // Pasar NextMonitorId
              setNextMonitorId={setNextMonitorId} // Pasar setNextMonitorId como prop
              variablesData={variablesData} // Pasar variablesData
              lastSimTime={lastSimTime} // Pasar lastSimTime
            />
          </div>
        </div>
      )}
      
      {showSynapseGestionador && selectedSynapseItem && (
        <div className="gestionador-container" onClick={() => setShowSynapseGestionador(false)}>
          <div className="gestionador-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowSynapseGestionador(false)}>&times;</span>
            <ConfigPanelSynapse synapse={selectedSynapseItem} onSave={handleSaveSynapse} onDelete={handleDeleteConnection} setShowSynapseGestionador={setShowSynapseGestionador} />
          </div>
        </div>
      )}
      
    </div>
    
    
  );
}

export default Lienzo;
