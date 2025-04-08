import React, { useState, useEffect } from "react";
import "./Gestionador.css";

function MonitorGestionador({ monitor, neurons, onSave, onDelete, setShowMonitorGestionador }) {
  const [name, setName] = useState(monitor.name || '');
  const [target, setTarget] = useState(monitor.attributes?.target || '');
  const [variables, setVariables] = useState(monitor.attributes?.variables || []);
  const [selectedVariables, setSelectedVariables] = useState([]);

  useEffect(() => {
    setName(monitor.name || '');
    setTarget(monitor.attributes?.target || '');
    setVariables(monitor.attributes?.variables || []);
  }, [monitor]);

  useEffect(() => {
    if (monitor.populationId) {
      const neurona = neurons.find(n => n.id === monitor.populationId);
      if (neurona) {
        setSelectedVariables(monitor.variables || []);
      }
    }
  }, [monitor, neurons]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleTargetChange = (e) => {
    setTarget(e.target.value);
  };

  const handleVariableChange = (index, value) => {
    const newVariables = [...variables];
    newVariables[index] = value;
    setVariables(newVariables);
  };

  const handleVariableSelectChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedVariables(selected);
  };

  const addVariable = () => {
    setVariables([...variables, '']);
  };

  const removeVariable = (index) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedMonitor = {
      ...monitor,
      name: name || monitor.name,
      attributes: {
        target,
        variables
      },
      variables: selectedVariables
    };
    onSave(updatedMonitor);
  };

  return (
    <div className="neuron-form">
      <div className="row">
        <label htmlFor="monitor-name">Name:</label>
        <input type="text" id="monitor-name" value={name} onChange={handleNameChange} />
      </div>
      <div className="row">
        <label htmlFor="monitor-target">Target:</label>
        <input type="text" id="monitor-target" value={target} onChange={handleTargetChange} />
      </div>
      <div className="row">
        <label>Variables:</label>
        {variables.map((variable, index) => (
          <div key={index} className="variable-row">
            <input
              type="text"
              value={variable}
              onChange={(e) => handleVariableChange(index, e.target.value)}
            />
            <button type="button" onClick={() => removeVariable(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addVariable}>Add Variable</button>
      </div>
      {monitor.populationId && (
        <div className="row">
          <label htmlFor="monitor-variables">Variables:</label>
          <select
            id="monitor-variables"
            multiple
            value={selectedVariables}
            onChange={handleVariableSelectChange}
          >
            {neurons.find(n => n.id === monitor.populationId)?.attributes.variables.map((variable, index) => (
              <option key={index} value={variable}>
                {variable}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="actions">
        <button className="delete" onClick={onDelete}>Eliminar</button>
        <button className="save" onClick={handleSave}>Guardar</button>
      </div>
    </div>
  );
}

export default MonitorGestionador;
