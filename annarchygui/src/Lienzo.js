import React, { useState, useEffect } from 'react';
import './Lienzo.css';
import ContextMenu from './ContextMenu';

function Lienzo({ isConnecting: [isConnecting, setIsConnecting] }) {
  const [items, setItems] = useState([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, itemId: null });
  const [selectedItems, setSelectedItems] = useState([]);
  const [connections, setConnections] = useState([]);

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragStartExisting = (event, index) => {
    setDraggedItemIndex(index);
  };

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

  const handleContextMenu = (event, itemId) => {
    event.preventDefault();
    setContextMenu({ visible: true, x: event.clientX, y: event.clientY, itemId });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleDeleteItem = () => {
    setItems(items.filter(item => item.id !== contextMenu.itemId));
    closeContextMenu();
  };

  const handleEditItem = (id, updatedAttributes) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, attributes: updatedAttributes } : item
    ));
    closeContextMenu();
  };

  const handleItemClick = (item) => {
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

  useEffect(() => {
    if (selectedItems.length === 2) {
      setConnections((prevConnections) => [...prevConnections, selectedItems]);
      setIsConnecting(false);
      setSelectedItems([]);
      document.body.style.cursor = 'default';
    }
  }, [selectedItems]);

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

  useEffect(() => {
    console.log('Conexiones actuales:', connections);
  }, [connections]);

  return (
    <div
      className="Lienzo"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="items">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`dropped-item ${isConnecting ? 'connecting-mode' : ''}`}
            draggable
            onDragStart={(event) => handleDragStartExisting(event, index)}
            onContextMenu={(event) => handleContextMenu(event, item.id)}
            onClick={() => handleItemClick(item)}
            style={{ left: `${item.x}px`, top: `${item.y}px`, position: 'absolute' }}
          >
            {item.type} (ID: {item.id})
          </div>
        ))}
        {connections.map((connection, index) => (
          <svg key={index} className="connection">
            <line
              x1={items.find(item => item.id === connection[0].id).x + 50}
              y1={items.find(item => item.id === connection[0].id).y + 25}
              x2={items.find(item => item.id === connection[1].id).x + 50}
              y2={items.find(item => item.id === connection[1].id).y + 25}
              stroke="black"
              strokeWidth="2"
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
          onEdit={handleEditItem}
        />
      )}
    </div>
  );
}

export default Lienzo;
