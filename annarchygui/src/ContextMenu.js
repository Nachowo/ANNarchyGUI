import React from 'react';
import './ContextMenu.css';

function ContextMenu({ x, y, onClose, onDelete }) {
  return (
    <div className="context-menu" style={{ top: `${y}px`, left: `${x}px` }}>
      <ul>
        <li onClick={onDelete}>Eliminar Elemento</li> {/* Opción para eliminar */}
        <li onClick={onClose}>Cerrar</li>
      </ul>
    </div>
  );
}

export default ContextMenu;
