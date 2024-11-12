import React, { useState } from 'react';
import './ContextMenu.css';

function ContextMenu({ x, y, onClose, onDelete, item, onEdit }) {

  const [attributes, setAttributes] = useState(item.attributes || {});

  const handleEditChange = (e, attr) => {
    setAttributes({
      ...attributes,
      [attr]: e.target.value,
    });
  };

  const handleSave = (e) => {
    e.stopPropagation(); // Evita que el menú se cierre al hacer clic en el botón "Guardar"
    onEdit(item.id, attributes); // Guarda los cambios en los atributos
  };

  return (
    <div
      className="context-menu"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()} // Evita que el menú se cierre al hacer clic en cualquier lugar dentro de él
    >
      <ul>
        <li
          onClick={(e) => {
            e.stopPropagation(); // Evita el cierre del menú al hacer clic en "Eliminar"
            onDelete();
          }}
        >
          Eliminar
        </li>
        { item.attributes &&  <li>
          <h4>Editar Atributos</h4>
          {Object.keys(attributes).map((attr) => (
            <div key={attr}>
              <label>{attr}:</label>
              <input
                type="text"
                value={attributes[attr]}
                onChange={(e) => handleEditChange(e, attr)}
                onClick={(e) => e.stopPropagation()} // Evita el cierre al interactuar con el campo de edición
              />
            </div>
          ))}
          <button onClick={handleSave}>Guardar</button>
        </li>}
        <li onClick={(e) => { e.stopPropagation(); onClose(); }}>Cerrar</li>
      </ul>
    </div>
  );
}

export default ContextMenu;
