import React, { useState, useEffect } from 'react';
import './Lienzo.css';
import Gestionador from './Gestionador'; // Importar el componente Gestionador
import SynapseGestionador from './SynapseGestionador'; // Importar el componente SynapseGestionador

function Lienzo({ isConnecting: [isConnecting, setIsConnecting], items, setItems, selectedSynapse, connections, setConnections }) {
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [stimulusMonitorConnections, setStimulusMonitorConnections] = useState([]);
  const [showGestionador, setShowGestionador] = useState(false); // Estado para mostrar/ocultar el Gestionador
  const [selectedNeuron, setSelectedNeuron] = useState(null); // Estado para la neurona seleccionada
  const [showSynapseGestionador, setShowSynapseGestionador] = useState(false);
  const [selectedSynapseItem, setSelectedSynapseItem] = useState(null);

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
        neuron: newItem.neuron, // Añadir el modelo de neurona
        attributes: newItem.attributes,
        x: x - elementWidth / 2,
        y: y - elementHeight / 2,
      };
      setItems([...items, itemToAdd]);
      setNextId(nextId + 1);
    } else {
      if (draggedItemIndex !== null) {
        const updatedItems = [...items];
        updatedItems[draggedItemIndex] = {
          ...updatedItems[draggedItemIndex],
          x: x - elementWidth / 2,
          y: y - elementHeight / 2,
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

  //Funcion para mostrar el Gestionador al hacer clic derecho sobre una población neuronal
  const handleNeuronContextMenu = (event, item) => {
    event.preventDefault();
    setSelectedNeuron(item);
    setShowGestionador(true);
  };

  const handleSaveNeuron = (updatedNeuron) => {
    setItems(items.map(item => item.id === updatedNeuron.id ? { ...updatedNeuron, name: updatedNeuron.name } : item));
    setShowGestionador(false);
  };

  const handleCloseGestionador = () => {
    setShowGestionador(false);
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
          if (origen.attributes.tipo === destino.attributes.tipo && (!selectedSynapse || selectedSynapse.name === origen.attributes.tipo)) {
            setConnections(prevConnections => [
              ...prevConnections,
              { id: prevConnections.length + 1, origen: origen.id, destino: destino.id, attributes: selectedSynapse ? { ...selectedSynapse.attributes, name: selectedSynapse.name } : { name: selectedSynapse.name }, connections: { target: 'exc', disable_omp: true, rule: 'all_to_all', weights: '1', delays: '1' } }
            ]);
          } else {
            alert('Solo se pueden conectar neuronas del mismo tipo y usar sinapsis del mismo tipo.');
          }
        } else {
          if (origen.type === 'Monitor' || origen.type === 'Estimulo') {
            alert('Monitores y estímulos solo pueden conectar hacia una población neuronal.');
          } else if (destino.type !== 'Población neuronal') {
            alert('Las poblaciones neuronales siempre deben ir como destino.');
          }
        }
      } else {
        alert('No se puede conectar un elemento consigo mismo.');
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
    console.log('Conexiones actuales:', connections);
    console.log('Elementos actuales:', items);
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
    >
      <svg className="connections-svg">
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
      <div className="items">
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
            onClick={(event) => handleItemClick(item, event)}
            style={{ left: `${item.x}px`, top: `${item.y}px`, position: 'absolute' }}
          >
            <div className="item-name">{item.type}</div>
            <div>{item.name}</div> 
          </div>
        ))}
      </div>
      <button onClick={debugear}>debug</button>
      <button onClick={() => setShowGestionador(true)}>Abrir Gestionador</button>

      {showGestionador && selectedNeuron && (
        <div className="gestionador-container" onClick={handleCloseGestionador}>
          <div className="gestionador-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowGestionador(false)}>&times;</span>
            <Gestionador neuron={selectedNeuron} onSave={handleSaveNeuron} />
          </div>
        </div>
      )}
      {showSynapseGestionador && selectedSynapseItem && (
        <div className="gestionador-container" onClick={() => setShowSynapseGestionador(false)}>
          <div className="gestionador-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowSynapseGestionador(false)}>&times;</span>
            <SynapseGestionador synapse={selectedSynapseItem} onSave={handleSaveSynapse} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Lienzo;
