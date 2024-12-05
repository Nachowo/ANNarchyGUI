import React, { useState, useEffect } from 'react';
import './ContextMenu.css';

function ContextMenu({ x, y, item, onEdit, onClose, onDelete }) {
  const [synapse, setSynapse] = useState({});

  // Actualiza los atributos cuando cambia el elemento seleccionado
  useEffect(() => {
    if (item) {
      console.log('Item:', item); // Verifica el contenido de item
      setSynapse(item);
      console.log('Synapse:', synapse); // Verifica el contenido de synapse
    } else {
      setSynapse({});
    }
  }, [item]);

  // Maneja el cambio de los atributos del modelo de sinapsis
  const handleSynapseChange = (e, field) => {
    setSynapse({
      ...synapse,
      [field]: e.target.value,
    });
  };

  // Guarda los cambios en los atributos
  const handleSave = (e) => {
    e.stopPropagation();
    onEdit(item.id, { ...item.attributes, synapse });
  };

  const handleResetPreSynaptic = () => {
    setSynapse({ ...synapse, preSynaptic: 'g_exc += w' });
  };

  const handleResetPostSynaptic = () => {
    setSynapse({ ...synapse, postSynaptic: 'g_inh -= w' });
  };

  return (
    <div className="context-menu-container" style={{ top: y, left: x }}>
      <div className="context-menu-header">
        <span className="close" onClick={onClose}>&times;</span>
      </div>
      <div className="context-menu-body">
        <div className="context-menu-content">
          {/* Parámetros básicos */}
          <h3>Parámetros básicos</h3>
          <div>
            <label>Peso inicial:</label>
            
            <input
              type="number"
              value={synapse || ''}
              onChange={(e) => handleSynapseChange(e, 'weight')}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label>Retraso:</label>
            <input
              type="number"
              value={synapse.delay || ''}
              onChange={(e) => handleSynapseChange(e, 'delay')}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Parámetros adicionales */}
          <h3>Parámetros adicionales</h3>
          <div>
            <label>Ecuación:</label>
            <textarea
              value={synapse.equation || ''}
              onChange={(e) => handleSynapseChange(e, 'equation')}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label>Clip:</label>
            <textarea
              value={synapse.clip || ''}
              onChange={(e) => handleSynapseChange(e, 'clip')}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label>Acción Pre-Sináptica:</label>
            <textarea
              value={synapse.preSynaptic || ''}
              onChange={(e) => handleSynapseChange(e, 'preSynaptic')}
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={handleResetPreSynaptic}>Restablecer predeterminado</button>
          </div>
          <div>
            <label>Acción Post-Sináptica:</label>
            <textarea
              value={synapse.postSynaptic || ''}
              onChange={(e) => handleSynapseChange(e, 'postSynaptic')}
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={handleResetPostSynaptic}>Restablecer predeterminado</button>
          </div>

          {/* Acciones */}
          <div className="buttons">
            <button onClick={handleSave}>Aplicar Cambios</button>
            <button onClick={onClose}>Resetear</button>
          </div>
        </div>
      </div>
      <div className="context-menu-footer">
        <button onClick={onDelete}>Eliminar</button>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

export default ContextMenu;