import React from 'react';
import './ContextMenu.css'; // Asegúrate de tener estilos para el menú

function ContextMenu({ x, y, onClose }) {
  return (
    <div className="context-menu" style={{ top: y, left: x }}>
      <ul>
        <li onClick={() => { console.log('Opción 1 seleccionada'); onClose(); }}>Opción 1</li>
        <li onClick={() => { console.log('Opción 2 seleccionada'); onClose(); }}>Opción 2</li>
        <li onClick={() => { console.log('Opción 3 seleccionada'); onClose(); }}>Opción 3</li>
      </ul>
    </div>
  );
}

export default ContextMenu;
