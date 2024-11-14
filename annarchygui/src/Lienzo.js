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

  //Funcion para manejar el drag de un elemento YA existente
  const handleDragStartExisting = (event, index) => {
    setDraggedItemIndex(index);
  };

  //Funcion para manejar el drop de un elemento
  const handleDrop = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('application/json');

    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const elementWidth = 100;
    const elementHeight = 50;

    if (data) {
      const newItem = JSON.parse(data);
      const itemToAdd = {
        id: nextId,
        type: newItem.name,
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
      item.id === id ? { ...item, attributes: updatedAttributes } : item
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

  return (
    <div
      className="Lienzo"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >

      <div className="items">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`dropped-item ${isConnecting ? 'connecting-mode' : ''}`}
            draggable
            onDragStart={(event) => handleDragStartExisting(event, index)}
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
            {item.type} (ID: {item.id})
          </div>
        ))}
        {connections.map((connection, index) => (
          <svg key={index} className="connection" >
            <line
              x1={items.find(item => item.id === connection.origen).x + 50}
              y1={items.find(item => item.id === connection.origen).y + 25}
              x2={items.find(item => item.id === connection.destino).x + 50}
              y2={items.find(item => item.id === connection.destino).y + 25}
              stroke="black"
              strokeWidth="2"
              pointerEvents="all"
              onClick={() => console.log(`Clicked on connection from ${connection.origen} to ${connection.destino}`)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleContextMenu(e, connection, 4);
              }}
              onMouseEnter={(e) => e.target.setAttribute('stroke', 'red')}
              onMouseLeave={(e) => e.target.setAttribute('stroke', 'black')}
            />
          </svg>
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
