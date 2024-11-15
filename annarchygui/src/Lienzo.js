import React, { useState, useEffect } from 'react';
import './Lienzo.css';
import ContextMenu from './ContextMenu';

function Lienzo({ isConnecting: [isConnecting, setIsConnecting] }) {
  const [items, setItems] = useState([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null, tipo:null});
  const [selectedItems, setSelectedItems] = useState([]);
  const [connections, setConnections] = useState([]);

  //Funcion para manejar el drag de un elemento NUEVO
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  //Funcion para manejar el drop de un elemento
  const handleDrop = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('application/json');

    const rect = event.currentTarget.getBoundingClientRect(); // Cambiar event.target a event.currentTarget
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

  //Funcion para mostrar el contextMenu
  const handleContextMenu = (event, item, tipo) => {
    event.preventDefault();
    console.log('Context Menu:', item);
    setContextMenu({ visible: true, x: event.clientX, y: event.clientY, itemId: item.id, tipo });
  };

  //Funcion para cerrar el contextMenu
  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  //Funcion para eliminar un elemento
  const handleDeleteItem = () => {
    setItems(items.filter(item => item.id !== contextMenu.itemId));
    closeContextMenu();
  };


  //Funcion para editar los atributos de un elemento
  const handleEditItem = (id, updatedAttributes) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, attributes: updatedAttributes, name: updatedAttributes.name } : item
    ));
    closeContextMenu();
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


  //Funcion para guardar la conexion entre elementos
  useEffect(() => {
    if (selectedItems.length === 2) {
      setConnections(prevConnections => [
        ...prevConnections,
        { id: prevConnections.length + 1, origen: selectedItems[0].id, destino: selectedItems[1].id, attributes: {direccion: "a", tipoProyeccion: "xd"} }
      ]);
      setIsConnecting(false);
      setSelectedItems([]);
      document.body.style.cursor = 'default';
    }
  }, [selectedItems]);

  //Cerrar el contextMenu si se hace click fuera de el
  useEffect(() => {
    const handleClickOutside = () => {
      closeContextMenu();
    };

    if (contextMenu.visible) {
      window.addEventListener('click', handleClickOutside);
    }

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.visible]);



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
    const x1 = items.find(item => item.id === connection.origen).x + 50;
    const y1 = items.find(item => item.id === connection.origen).y + 25;
    const x2 = items.find(item => item.id === connection.destino).x + 50;
    const y2 = items.find(item => item.id === connection.destino).y + 25;
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
            e.preventDefault();
            handleContextMenu(e, connection, 4);
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
</svg>
      <div className="items">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`dropped-item ${getShapeClass(item.type)} ${isConnecting ? 'connecting-mode' : ''}`}
            draggable
            onDragStart={(event) => setDraggedItemIndex(index)}
            onContextMenu={(e) => {
              if (item.type === 'Población neuronal') {
                handleContextMenu(e, item, 1);
              } else if (item.type === 'Monitor') {
                handleContextMenu(e, item, 2);
              } else if (item.type === 'Estimulo') {
                handleContextMenu(e, item, 3);
              }
            }}
            onClick={(event) => handleItemClick(item, event)}
            style={{ left: `${item.x}px`, top: `${item.y}px`, position: 'absolute' }}
          >
            <div className="item-name">{item.name}</div>
            <div>{item.type}</div> 
          </div>
        ))}
      </div>
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y - 50}
          onClose={closeContextMenu}
          onDelete={handleDeleteItem}
          item={items.find(item => item.id === contextMenu.itemId)}
          tipo={contextMenu.tipo}
          onEdit={handleEditItem}
        />
      )}
            <button onClick={debugear}>debug</button>

    </div>
    
  );
}

export default Lienzo;
