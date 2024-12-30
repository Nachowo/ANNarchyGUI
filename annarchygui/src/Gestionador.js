import React, { useState, useEffect } from "react";
import "./Gestionador.css";

function Gestionador({ neuron, onSave }) {
  const [name, setName] = useState(neuron.name || '');
  const [tipo, setTipo] = useState(neuron.attributes.tipo || '');
  const [equations, setEquations] = useState(neuron.attributes.equations || '');
  const [parameters, setParameters] = useState(Object.entries(neuron.attributes.parameters || {}).map(([name, value]) => ({ name, value })));
  const [functions, setFunctions] = useState(Object.entries(neuron.attributes.functions || {}).map(([name, value]) => ({ name, value })));
  const [spike, setSpike] = useState(neuron.attributes.spike || '');
  const [axonSpike, setAxonSpike] = useState(neuron.attributes.axon_spike || '');
  const [reset, setReset] = useState(neuron.attributes.reset || '');
  const [axonReset, setAxonReset] = useState(neuron.attributes.axon_reset || '');
  const [refractory, setRefractory] = useState(neuron.attributes.refractory || '');
  const [firingRate, setFiringRate] = useState(neuron.attributes.firingRate || '');
  const [quantity, setQuantity] = useState(neuron.id !== undefined ? neuron.quantity : 1);

  useEffect(() => {
    setName(neuron.name || '');
    setTipo(neuron.attributes.tipo || 'Spiking neuron');
    setEquations(neuron.attributes.equations || '');
    setParameters(Object.entries(neuron.attributes.parameters || {}).map(([name, value]) => ({ name, value })));
    setFunctions(Object.entries(neuron.attributes.functions || {}).map(([name, value]) => ({ name, value })));
    setSpike(neuron.attributes.spike || '');
    setAxonSpike(neuron.attributes.axon_spike || '');
    setReset(neuron.attributes.reset || '');
    setAxonReset(neuron.attributes.axon_reset || '');
    setRefractory(neuron.attributes.refractory || '');
    setFiringRate(neuron.attributes.firingRate || '');
    setQuantity(neuron.id !== undefined ? neuron.quantity : 1);
  }, [neuron]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleTipoChange = (e) => {
    setTipo(e.target.value);
  };

  const handleEquationChange = (e) => {
    setEquations(e.target.value);
  };

  const handleParameterChange = (index, field, value) => {
    const newParameters = [...parameters];
    newParameters[index][field] = value;
    setParameters(newParameters);
  };

  const handleFunctionChange = (index, field, value) => {
    const newFunctions = [...functions];
    newFunctions[index][field] = value;
    setFunctions(newFunctions);
  };

  const handleSpikeChange = (e) => {
    setSpike(e.target.value);
  };

  const handleAxonSpikeChange = (e) => {
    setAxonSpike(e.target.value);
  };

  const handleResetChange = (e) => {
    setReset(e.target.value);
  };

  const handleAxonResetChange = (e) => {
    setAxonReset(e.target.value);
  };

  const handleRefractoryChange = (e) => {
    setRefractory(e.target.value);
  };

  const handleFiringRateChange = (e) => {
    setFiringRate(e.target.value);
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const addParameter = () => {
    setParameters([...parameters, { name: '', value: '' }]);
  };

  const removeParameter = (index) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const addFunction = () => {
    setFunctions([...functions, { name: '', value: '' }]);
  };

  const removeFunction = (index) => {
    setFunctions(functions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (tipo === 'Spiking neuron' && (!parameters.length || !equations || !spike)) {
      alert('The fields Parameters, Equations, and Spike are required for Spiking neurons.');
      return;
    }

    if (tipo === 'Rate-Coded neuron' && (!parameters.length || !equations || !firingRate)) {
      alert('The fields Parameters, Equations, and Firing Rate are required for Rate-Coded neurons.');
      return;
    }

    const updatedNeuron = {
      ...neuron,
      name: name || neuron.name,
      quantity,
      attributes: {
        ...neuron.attributes,
        tipo,
        equations,
        parameters: parameters.reduce((acc, param) => {
          acc[param.name] = param.value;
          return acc;
        }, {}),
        functions: functions.reduce((acc, func) => {
          acc[func.name] = func.value;
          return acc;
        }, {}),
        spike,
        axon_spike: axonSpike,
        reset,
        axon_reset: axonReset,
        refractory,
        firingRate
      }
    };
    onSave(updatedNeuron);
  };

  return (
    <div className="neuron-form">
      <div className="row">
        <label htmlFor="neuron-name">Name:</label>
        <input type="text" id="neuron-name" value={name} onChange={handleNameChange} />
      </div>

      <div className="row">
        <label htmlFor="neuron-type">Neuron Type:</label>
        <select id="neuron-type" value={tipo} onChange={handleTipoChange} disabled={neuron.id !== undefined}>
          <option value="Spiking neuron">Spiking neuron</option>
          <option value="Rate-Coded neuron">Rate-Coded neuron</option>
        </select>
      </div>

      <div className="row">
        <label htmlFor="equation">Equation:</label>
        <textarea id="equation" value={equations} onChange={handleEquationChange} disabled={neuron.id !== undefined} />
      </div>

      {neuron.id !== undefined && (
        <div className="row">
          <label htmlFor="quantity">Quantity:</label>
          <input type="number" id="quantity" value={quantity} onChange={handleQuantityChange} />
        </div>
      )}

      <div className="tables-container">
        <div className="group">
          <h3>Parameters</h3>
          <div className="table">
            {parameters.map((param, index) => (
              <div className="row" key={index}>
                <input
                  type="text"
                  placeholder="Name"
                  value={param.name}
                  onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => handleParameterChange(index, "value", e.target.value)}
                />
                <button className="delete" onClick={() => removeParameter(index)}>Delete</button>
              </div>
            ))}
            <button className="add" onClick={addParameter}>Add parameter</button>
          </div>
        </div>
      </div>

      <div className="fields-container">
        <div className="column">
          {tipo === 'Spiking neuron' && (
            <>
              <div className="row">
                <label htmlFor="spike">Spike:</label>
                <input type="text" id="spike" value={spike} onChange={handleSpikeChange} />
              </div>
              <div className="row">
                <label htmlFor="axon-spike">Axon Spike:</label>
                <input type="text" id="axon-spike" value={axonSpike} onChange={handleAxonSpikeChange} />
              </div>
              <div className="row">
                <label htmlFor="reset">Reset:</label>
                <input type="text" id="reset" value={reset} onChange={handleResetChange} />
              </div>
            </>
          )}
        </div>
        <div className="column">
          {tipo === 'Spiking neuron' && (
            <>
              <div className="row">
                <label htmlFor="axon-reset">Axon Reset:</label>
                <input type="text" id="axon-reset" value={axonReset} onChange={handleAxonResetChange} />
              </div>
              <div className="row">
                <label htmlFor="refractory">Refractory:</label>
                <input type="text" id="refractory" value={refractory} onChange={handleRefractoryChange} />
              </div>
            </>
          )}
        </div>
      </div>
      {tipo === 'Rate-Coded neuron' && (
        <div className="row">
          <label htmlFor="firing-rate">Firing rate:</label>
          <input type="text" id="firing-rate" value={firingRate} onChange={handleFiringRateChange} />
        </div>
      )}
      
      <div className="row">
        <label htmlFor="functions">Functions:</label>
        <input type="text" id="functions" value={functions} onChange={handleFunctionChange} />
      </div>

      <div className="actions">
        <button className="delete">Delete</button>
        <button className="save" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}

export default Gestionador;
