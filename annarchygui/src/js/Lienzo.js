import React, { useState, useEffect } from 'react';
import './../css/Lienzo.css';
import Gestionador from './Gestionador'; // Importar el componente Gestionador
import SynapseGestionador from './SynapseGestionador'; // Importar el componente SynapseGestionador

function Lienzo({ isConnecting: [isConnecting, setIsConnecting], items, setItems, selectedSynapse, connections, setConnections, isAssigningMonitor, setIsAssigningMonitor, monitors, setMonitors }) {
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [stimulusMonitorConnections, setStimulusMonitorConnections] = useState([]);
  const [showGestionador, setShowGestionador] = useState(false); // Estado para mostrar/ocultar el Gestionador
  const [selectedNeuron, setSelectedNeuron] = useState(null); // Estado para la neurona seleccionada
  const [showSynapseGestionador, setShowSynapseGestionador] = useState(false);
  const [selectedSynapseItem, setSelectedSynapseItem] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Recalcula las posiciones de los elementos cuando cambia el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      setItems((prevItems) =>
        prevItems.map((item) => {
          const adjustedX = Math.min(Math.max((item.x / canvasSize.width) * newWidth, 0), newWidth - 100); // Limitar dentro del lienzo
          const adjustedY = Math.min(Math.max((item.y / canvasSize.height) * newHeight, 0), newHeight - 50); // Limitar dentro del lienzo
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

  //Funcion para manejar el drag de un elemento NUEVO
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  //Funcion para manejar el drop de un elemento
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

  // Función para eliminar todas las conexiones que involucren un elemento
  const removeConnections = (itemId) => {
    setConnections(prevConnections => prevConnections.filter(connection => connection.origen !== itemId && connection.destino !== itemId));
    setStimulusMonitorConnections(prevConnections => prevConnections.filter(connection => connection.origen !== itemId && connection.destino !== itemId));
  };

  //Funcion para eliminar un elemento y sus conexiones
  const handleDeleteItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
    removeConnections(itemId);
  };

  //Funcion para editar los atributos de un elemento
  const handleEditItem = (id, updatedAttributes) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, attributes: updatedAttributes, name: updatedAttributes.name, quantity: updatedAttributes.quantity, neuron: updatedAttributes.neuron } : item
    ));
  };

  //Funcion para manejar las conexiones entre elementos
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

  // Función para manejar el clic en una población cuando está en modo de asignación
  const handlePopulationClick = (item, event) => {
    event.stopPropagation();
    if (isAssigningMonitor) {
      if (item.hasMonitor) {
        alert('Esta población ya tiene un monitor asignado.');
        return;
      }
      const newMonitor = {
        id: monitors.length + 1,
        target: '',
        variables: [],
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

  //Funcion para mostrar el Gestionador al hacer clic derecho sobre una población neuronal
  const handleNeuronContextMenu = (event, item) => {
    event.preventDefault();
    setSelectedNeuron(item);
    setShowGestionador(true);
  };

  const handleSaveNeuron = (updatedNeuron, updatedMonitors) => {
    setItems(items.map(item => item.id === updatedNeuron.id ? { ...updatedNeuron, name: updatedNeuron.name } : item));
    setMonitors(monitors.map(monitor => {
      const updatedMonitor = updatedMonitors.find(m => m.id === monitor.id);
      return updatedMonitor ? { ...monitor, ...updatedMonitor } : monitor;
    }));
    setShowGestionador(false);
  };

  const handleMonitorVariableChange = (monitorId, newVariables) => {
    setMonitors(monitors.map(monitor =>
      monitor.id === monitorId ? { ...monitor, variables: newVariables } : monitor
    ));
  };

  const handleCloseGestionador = () => {
    setShowGestionador(false);
  };

  const handleDeleteConnection = (connectionId) => {
    setConnections(connections.filter(connection => connection.id !== connectionId));
  };

  const handleSaveSynapse = (updatedSynapse) => {
    setConnections(connections.map(connection =>
      connection.id === updatedSynapse.id ? { ...connection, attributes: updatedSynapse.attributes, connections: updatedSynapse.connections } : connection
    ));
    setShowSynapseGestionador(false);
  };

  const handleSynapseClick = (event, connection) => {
    event.preventDefault();
    setSelectedSynapseItem(connection);
    setShowSynapseGestionador(true);
  };

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

  //Funcion para quitar el modo de conexion si se hace click en el lienzo
  const handleCanvasClick = () => {
    if (isConnecting) {
      setIsConnecting(false);
      setSelectedItems([]);
      document.body.style.cursor = 'default';
    }
  };

  const debugear = () => {
    console.log('Current connections:', connections);
    console.log('Current items:', items);
    console.log('Current monitors:', monitors);
  };

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

  const getShapeClass = (type) => {
    switch (type) {
      case 'Población neuronal':
        return 'oval-shape';
      default:
        return '';
    }
  };

  // Maneja el evento de arrastrar fuera del lienzo
  const handleDragEnd = (event, index) => {
    const sidebar = document.getElementById('sidebar');
    const rect = sidebar.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      const itemId = items[index].id;
      setItems(items.filter((_, i) => i !== index));
      removeConnections(itemId);
    }
  };

  return (
    <div
      className="Lienzo"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
      style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }} // Asegurar que el lienzo esté bajo el sidebar
    >
      <svg className="connections-svg" style={{ zIndex: 1 }}>
        <defs>
          {renderArrowMarker()}
        </defs>
        {connections.map((connection, index) => {
          const origenItem = items.find(item => item.id === connection.origen);
          const destinoItem = items.find(item => item.id === connection.destino);

          if (!origenItem || !destinoItem) {
            return null; // Si no se encuentra el elemento, no renderizar la conexión
          }

          const x1 = origenItem.x + 50;
          const y1 = origenItem.y + 25;
          const x2 = destinoItem.x + 50;
          const y2 = destinoItem.y + 25;

          const isNeuronConnection = origenItem.type === 'Población neuronal' && destinoItem.type === 'Población neuronal';

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
                stroke="black"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                pointerEvents="none"
                onMouseEnter={(e) => e.target.setAttribute('stroke', 'red')}
                onMouseLeave={(e) => e.target.setAttribute('stroke', 'black')}
              />
            </React.Fragment>
          );
        })}
        {stimulusMonitorConnections.map((connection, index) => {
          const origenItem = items.find(item => item.id === connection.origen);
          const destinoItem = items.find(item => item.id === connection.destino);

          if (!origenItem || !destinoItem) {
            return null; // Si no se encuentra el elemento, no renderizar la conexión
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
      <div className="items" style={{ zIndex: 1 }}>
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
            <Gestionador
              neuron={selectedNeuron}
              onSave={handleSaveNeuron}
              monitors={monitors}
              onMonitorVariableChange={handleMonitorVariableChange} // Pasar la función
            />
          </div>
        </div>
      )}
      {showSynapseGestionador && selectedSynapseItem && (
        <div className="gestionador-container" onClick={() => setShowSynapseGestionador(false)}>
          <div className="gestionador-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowSynapseGestionador(false)}>&times;</span>
            <SynapseGestionador synapse={selectedSynapseItem} onSave={handleSaveSynapse} onDelete={handleDeleteConnection} setShowSynapseGestionador={setShowSynapseGestionador} />
          </div>
        </div>
      )}
  
    </div>
    
  );
}

export default Lienzo;
