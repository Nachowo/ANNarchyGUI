import React, { useState, useEffect } from "react";
import "./Gestionador.css";

function MonitorGestionador({ monitor, onSave }) {
  const [name, setName] = useState(monitor.name || '');
  const [target, setTarget] = useState(monitor.attributes.target || '');
  const [variables, setVariables] = useState(monitor.attributes.variables || []);

  useEffect(() => {
    setName(monitor.name || '');
    setTarget(monitor.attributes.target || '');
    setVariables(monitor.attributes.variables || []);
  }, [monitor]);

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
      }
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
      <button type="button" onClick={handleSave}>Save</button>
    </div>
  );
}

export default MonitorGestionador;
