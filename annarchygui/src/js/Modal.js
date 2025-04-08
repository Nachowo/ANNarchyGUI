import React from 'react';
import './Modal.css';

function Modal({ children, onClose, newModel, setNewModel, handleSaveModel, handleModelChange, handleInputChange }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>X</button>
        {children}
        <h2>Crear Neurona</h2>
        {/* Globales de la Población */}
        <div className="modal-section">
          <h3>Población</h3>
          <label>Nombre:</label>
          <input
            type="text"
            value={newModel.name}
            onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
          />
          <label>Cantidad:</label>
          <input
            type="number"
            value={newModel.quantity}
            onChange={(e) => handleModelChange(e, 'quantity')}
          />
        </div>

        {/* Configuración del Modelo */}
        <div className="modal-section">
          <h3>Modelo de Neurona</h3>
          <label>Ecuación:</label>
          <textarea
            value={newModel.neuron.equation}
            onChange={(e) =>
              setNewModel({ ...newModel, neuron: { ...newModel.neuron, equation: e.target.value } })
            }
          />
          <div className="modal-subsection">
            <h4>Parámetros</h4>
            <label>τ (Tau):</label>
            <input
              type="text"
              value={newModel.neuron.parameters.tau}
              onChange={(e) =>
                setNewModel({
                  ...newModel,
                  neuron: {
                    ...newModel.neuron,
                    parameters: { ...newModel.neuron.parameters, tau: e.target.value },
                  },
                })
              }
            />
            <label>Corriente (I):</label>
            <input
              type="text"
              value={newModel.neuron.parameters.I}
              onChange={(e) =>
                setNewModel({
                  ...newModel,
                  neuron: {
                    ...newModel.neuron,
                    parameters: { ...newModel.neuron.parameters, I: e.target.value },
                  },
                })
              }
            />
          </div>
          <div className="modal-subsection">
            <h4>Variables</h4>
            <label>Potencial de Membrana (v):</label>
            <input
              type="text"
              value={newModel.neuron.variables.v}
              onChange={(e) =>
                setNewModel({
                  ...newModel,
                  neuron: {
                    ...newModel.neuron,
                    variables: { ...newModel.neuron.variables, v: e.target.value },
                  },
                })
              }
            />
          </div>
        </div>

        {/* Atributos adicionales */}
        <div className="modal-section">
          <h3>Atributos</h3>
          <label>Firing Rate:</label>
          <input
            type="number"
            value={newModel.attributes.firingRate}
            onChange={(e) => handleInputChange(e, 'firingRate')}
          />
          <label>Threshold:</label>
          <input
            type="number"
            value={newModel.attributes.threshold}
            onChange={(e) => handleInputChange(e, 'threshold')}
          />
        </div>

        {/* Botones */}
        <div className="modal-buttons">
          <button onClick={handleSaveModel}>Guardar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
