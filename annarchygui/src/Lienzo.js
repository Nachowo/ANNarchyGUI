import React, { useState } from 'react';
import './Lienzo.css';

function Lienzo() {
  const [items, setItems] = useState([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [elementCounts, setElementCounts] = useState({}); // Objeto para llevar el conteo de elementos

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragStartExisting = (event, index) => {
    setDraggedItemIndex(index);
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
      // Actualiza la posición centrada
      updatedItems[draggedItemIndex] = { ...updatedItems[draggedItemIndex], x: x - elementWidth / 2, y: y - elementHeight / 2 };
      setItems(updatedItems);
      setDraggedItemIndex(null);
      console.log(updatedItems);  // Imprimir el listado de items actualizado
    } else {
      // Añadir un nuevo elemento centrado
      // Incrementar el conteo de este tipo de elemento
      const newCount = (elementCounts[itemType] || 0) + 1;
      const newName = `${itemType}.${newCount}`;  // Generar el nombre del nuevo elemento
      
      const newItems = [
        ...items,
        { type: newName, x: x - elementWidth / 2, y: y - elementHeight / 2 }
      ];
      
      setItems(newItems);
      setElementCounts({ ...elementCounts, [itemType]: newCount }); // Actualizar el conteo
      console.log(newItems);  // Imprimir el listado de items actualizado
    }
  };

  return (
    <div className="Lienzo" onDragOver={handleDragOver} onDrop={handleDrop}>
      <h2>Área de trabajo (Lienzo)</h2>
      <div className="items">
        {items.map((item, index) => (
          <div
            key={index}
            className="dropped-item"
            draggable
            onDragStart={(event) => handleDragStartExisting(event, index)}  // Permitir arrastrar de nuevo
            style={{ left: `${item.x}px`, top: `${item.y}px`, position: 'absolute' }}
          >
            {item.type} {/* Mostrar el nombre del elemento */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Lienzo;
