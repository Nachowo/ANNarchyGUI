import React, { useState, useEffect } from 'react';
import './Lienzo.css';
import ContextMenu from './ContextMenu'; // Importa el menú contextual

function Lienzo({ isConnecting: [isConnecting, hasConnectionBeenMade]}) {
  const [items, setItems] = useState([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [nextId, setNextId] = useState(1);  // Contador para los IDs
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, itemId: null });
  const [selectedItems, setSelectedItems] = useState([]); // Para almacenar elementos seleccionados
  const [connections, setConnections] = useState([]); // Para almacenar pares de conexiones
  const num = 0;

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDeleteItem = () => {
    setItems(items.filter(item => item.id !== contextMenu.itemId));
    closeContextMenu(); // Cierra el menú después de eliminar el elemento
  };

  const handleDragStartExisting = (event, index) => {
    setDraggedItemIndex(index); // Usa el índice del elemento
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const itemType = event.dataTransfer.getData('itemType');
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;  // Posición X relativa al lienzo
    const y = event.clientY - rect.top;   // Posición Y relativa al lienzo
    const elementWidth = 100;  // Ajusta al ancho del elemento
    const elementHeight = 50;   // Ajusta a la altura del elemento

    if (draggedItemIndex !== null) {
      // Mover un elemento existente
      const updatedItems = [...items];
      updatedItems[draggedItemIndex] = { ...updatedItems[draggedItemIndex], x: x - elementWidth / 2, y: y - elementHeight / 2 };
      setItems(updatedItems);
      setDraggedItemIndex(null);
    } else {
      // Añadir un nuevo elemento centrado con un ID único
      const newItem = { id: nextId, type: itemType, x: x - elementWidth / 2, y: y - elementHeight / 2 };
      setItems([...items, newItem]);
      setNextId(nextId + 1);  // Incrementa el ID para el próximo elemento
    }
  };

  const handleContextMenu = (event, itemId) => {
    event.preventDefault();
    setContextMenu({ visible: true, x: event.clientX, y: event.clientY, itemId });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  // Cierra el menú al hacer clic en otra parte de la pantalla
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

  const handleItemClick = (item) => {
    if (isConnecting) {
      setSelectedItems((prev) => {
        if (prev.length < 2) {
          // Si hay menos de 2 elementos seleccionados, añade el nuevo
          return [...prev, item];
        } else {
          // Si ya hay 2, resetea la selección y añade el nuevo
          return [item];
        }
      });
    }
  };

  useEffect(() => {
    if (selectedItems.length === 2 && !hasConnectionBeenMade) {
      // Guarda la conexión y resetea la selección
      setConnections((prevConnections) => [...prevConnections, selectedItems]);
      console.log(`Conexión de ${selectedItems[0].id} a ${selectedItems[1].id}`);
      hasConnectionBeenMade = true;
      setSelectedItems([]);
    }
  }, [selectedItems, hasConnectionBeenMade]);

  useEffect(() => {
    // Este efecto se ejecuta cuando cambia el estado connections
    console.log('Conexiones actuales:', connections);
  }, [connections]);

  return (
    <div className="Lienzo" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="items">
        
        {items.map((item, index) => (
          <div
            key={item.id}  // Usa el ID como clave
            className={`dropped-item ${isConnecting ? 'connecting' : ''}`} // Cambia el estilo si está en modo conexión
            draggable
            onDragStart={(event) => handleDragStartExisting(event, index)}  // Permitir arrastrar de nuevo usando el índice
            onContextMenu={(event) => handleContextMenu(event, item.id)}  // Manejar el clic derecho
            onClick={() => handleItemClick(item)} // Maneja el clic para seleccionar
            style={{ left: `${item.x}px`, top: `${item.y}px`, position: 'absolute' }}
          >
            {item.type} (ID: {item.id})  {/* Mostrar el tipo y el ID */}
          </div>
        ))}
        {
          connections.map((connection, index) => (
            console.log("coordenadas del primer punto x1: ", items.find(item => item.id === connection[0].id).x),
            console.log("coordenadas del primer punto y1: ", items.find(item => item.id === connection[0].id).y),
            <svg key={index} className="connection">
              <line

                x1={items.find(item => item.id === connection[0].id).x + 50}  // X del primer elemento
                y1={items.find(item => item.id === connection[0].id).y + 25}  // Y del primer elemento
                x2={items.find(item => item.id === connection[1].id).x + 50}  // X del segundo elemento
                y2={items.find(item => item.id === connection[1].id).y + 25}  // Y del segundo elemento
                stroke='black'
                strokeWidth='2'
                
              />

            </svg>
          ))
        }
      </div>
      {contextMenu.visible && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={closeContextMenu} 
          onDelete={handleDeleteItem} // Pasa la función de eliminación
        />
      )}
    </div>
  );
}

export default Lienzo;
