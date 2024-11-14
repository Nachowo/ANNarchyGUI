import React, { useState, useEffect } from 'react';
import './ContextMenu.css';

function ContextMenu({ x, y, item, tipo, onEdit, onClose, onDelete }) {
  const [attributes, setAttributes] = useState({});

  // Actualiza los atributos cuando cambia el elemento seleccionado
  useEffect(() => {
    console.log('Item actualizado:', item); // Imprime el item en la consola para depurar
    if (item) {
      setAttributes(item.attributes || {});
    }
  }, [item]);

  // Maneja el cambio de atributos
  const handleEditChange = (e, attr) => {
    setAttributes({
      ...attributes,
      [attr]: e.target.value,
    });
  };

  // Guarda los cambios en los atributos
  const handleSave = (e) => {
    e.stopPropagation(); 
    onEdit(item.id, attributes); 
  };

  // Renderiza el contenido del menú basado en el tipo
  const renderMenuContent = () => {
    switch (tipo) {
      case 1:
        return (
          <li>
            <h4>Editar Atributos de Neurona</h4>
            {Object.keys(attributes).map((attr) => (
              <div key={attr}>
                <label>{attr}:</label>
                <input
                  type="text"
                  value={attributes[attr]}
                  onChange={(e) => handleEditChange(e, attr)}
                  onClick={(e) => e.stopPropagation()} 
                />
              </div>
            ))}
            <button onClick={handleSave}>Guardar</button>
          </li>
        );
      case 2:
        return (
          <li>
            <h4>Editar Atributos de Tipo 2</h4>
            {/* Añade aquí el contenido específico para el tipo 2 */}
          </li>
        );
      case 3:
        return (
          <li>
            <h4>Editar Atributos de Tipo 3</h4>
            {/* Añade aquí el contenido específico para el tipo 3 */}
          </li>
        );
      case 4:
        return (
          <li>
            <h4>Editar Atributos de Conexión</h4>
            {Object.keys(attributes).map((attr) => (
              <div key={attr}>
                <label>{attr}:</label>
                <input
                  type="text"
                  value={attributes[attr]}
                  onChange={(e) => handleEditChange(e, attr)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ))}
            <button onClick={handleSave}>Guardar</button>
          </li>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="context-menu"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()} 
    >
      <ul>
        <li
          onClick={(e) => {
            e.stopPropagation(); 
            onDelete();
          }}
        >
          Eliminar
        </li>
        {renderMenuContent()}
        <li onClick={(e) => { e.stopPropagation(); onClose(); }}>Cerrar</li>
      </ul>
    </div>
  );
}

export default ContextMenu;