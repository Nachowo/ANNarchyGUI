import React, { useState, useEffect } from "react";
import "./Gestionador.css";

function Gestionador({ neuron, onSave }) {
  const [name, setName] = useState(neuron.name || '');
  const [tipo, setTipo] = useState(neuron.attributes.tipo || '');
  const [equations, setEquations] = useState(Object.entries(neuron.attributes.equations || {}).map(([name, value]) => ({ name, value })));
  const [parameters, setParameters] = useState(Object.entries(neuron.attributes.parameters || {}).map(([name, value]) => ({ name, value })));
  const [variables, setVariables] = useState(Object.entries(neuron.attributes.variables || {}).map(([name, value]) => ({ name, value })));
  const [functions, setFunctions] = useState(Object.entries(neuron.attributes.functions || {}).map(([name, value]) => ({ name, value })));
  const [spike, setSpike] = useState(neuron.attributes.spike || '');
  const [axonSpike, setAxonSpike] = useState(neuron.attributes.axon_spike || '');
  const [reset, setReset] = useState(neuron.attributes.reset || '');
  const [axonReset, setAxonReset] = useState(neuron.attributes.axon_reset || '');
  const [refractory, setRefractory] = useState(neuron.attributes.refractory || '');
  const [firingRate, setFiringRate] = useState(neuron.attributes.firingRate || '');
  const [quantity, setQuantity] = useState(neuron.quantity || '');

  useEffect(() => {
    setName(neuron.name || '');
    setTipo(neuron.attributes.tipo || '');
    console.log(neuron);
    setEquations(Object.entries(neuron.attributes.equations || {}).map(([name, value]) => ({ name, value })));
    setParameters(Object.entries(neuron.attributes.parameters || {}).map(([name, value]) => ({ name, value })));
    setVariables(Object.entries(neuron.attributes.variables || {}).map(([name, value]) => ({ name, value })));
    setFunctions(Object.entries(neuron.attributes.functions || {}).map(([name, value]) => ({ name, value })));
    setSpike(neuron.attributes.spike || '');
    setAxonSpike(neuron.attributes.axon_spike || '');
    setReset(neuron.attributes.reset || '');
    setAxonReset(neuron.attributes.axon_reset || '');
    setRefractory(neuron.attributes.refractory || '');
    setFiringRate(neuron.attributes.firingRate || '');
    setQuantity(neuron.quantity || '');
  }, [neuron]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEquationChange = (index, field, value) => {
    const newEquations = [...equations];
    newEquations[index][field] = value;
    setEquations(newEquations);
  };

  const handleParameterChange = (index, field, value) => {
    const newParameters = [...parameters];
    newParameters[index][field] = value;
    setParameters(newParameters);
  };

  const handleVariableChange = (index, field, value) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);
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

  const addEquation = () => {
    setEquations([...equations, { name: '', value: '' }]);
  };

  const removeEquation = (index) => {
    setEquations(equations.filter((_, i) => i !== index));
  };

  const addParameter = () => {
    setParameters([...parameters, { name: '', value: '' }]);
  };

  const removeParameter = (index) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const addVariable = () => {
    setVariables([...variables, { name: '', value: '' }]);
  };

  const removeVariable = (index) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const addFunction = () => {
    setFunctions([...functions, { name: '', value: '' }]);
  };

  const removeFunction = (index) => {
    setFunctions(functions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedNeuron = {
      ...neuron,
      name,
      quantity,
      attributes: {
        ...neuron.attributes,
        tipo,
        equations: equations.reduce((acc, eq) => {
          acc[eq.name] = eq.value;
          return acc;
        }, {}),
        parameters: parameters.reduce((acc, param) => {
          acc[param.name] = param.value;
          return acc;
        }, {}),
        variables: variables.reduce((acc, variable) => {
          acc[variable.name] = variable.value;
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
    <div className="container">
      {/* Encabezado */}
      <div className="header">
        <label htmlFor="nombre">Name:</label>
        <input type="text" id="nombre" value={name} onChange={handleNameChange} />
      </div>

      {/* Tamaño de la Población */}
      <div className="population-size">
        <label htmlFor="quantity">Population Size:</label>
        <input
          type="text"
          id="quantity"
          value={quantity}
          onChange={handleQuantityChange}
        />
      </div>

      {/* Ecuaciones */}
      <div className="equations">
        <h3>Equations</h3>
        {equations.map((equation, index) => (
          <div key={index} className="equation">
            <input
              type="text"
              value={equation.name}
              onChange={(e) => handleEquationChange(index, 'name', e.target.value)}
            />
            <input
              type="text"
              value={equation.value}
              onChange={(e) => handleEquationChange(index, 'value', e.target.value)}
            />
            <button onClick={() => removeEquation(index)}>Eliminar</button>
          </div>
        ))}
        <button onClick={addEquation}>Add Equation</button>
      </div>

      {/* Parámetros */}
      <div className="parameters">
        <h3>Parameters</h3>
        {parameters.map((param, index) => (
          <div key={index} className="parameter">
            <input
              type="text"
              value={param.name}
              onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
            />
            <input
              type="text"
              value={param.value}
              onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
            />
            <button onClick={() => removeParameter(index)}>Eliminar</button>
          </div>
        ))}
        <button onClick={addParameter}>Add Parameter</button>
      </div>

      {/* Variables */}
      {tipo === 'Spiking neuron' && (
        <div className="variables">
          <h3>Variables</h3>
          {variables.map((variable, index) => (
            <div key={index} className="variable">
              <input
                type="text"
                value={variable.name}
                onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                value={variable.value}
                onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
              />
              <button onClick={() => removeVariable(index)}>Eliminar</button>
            </div>
          ))}
          <button onClick={addVariable}>Add Variable</button>
        </div>
      )}

      {/* Funciones */}
      {(tipo === 'Spiking neuron' || tipo === 'Rate-Coded neuron') && (
        <div className="functions">
          <h3>Functions</h3>
          {functions.map((func, index) => (
            <div key={index} className="function">
              <input
                type="text"
                value={func.name}
                onChange={(e) => handleFunctionChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                value={func.value}
                onChange={(e) => handleFunctionChange(index, 'value', e.target.value)}
              />
              <button onClick={() => removeFunction(index)}>Eliminar</button>
            </div>
          ))}
          <button onClick={addFunction}>Add Function</button>
        </div>
      )}

      {/* Spike */}
      {tipo === 'Spiking neuron' && (
        <div className="spike">
          <label htmlFor="spike">Spike:</label>
          <input
            type="text"
            id="spike"
            value={spike}
            onChange={handleSpikeChange}
          />
        </div>
      )}

      {/* Axon Spike */}
      {tipo === 'Spiking neuron' && (
        <div className="axon-spike">
          <label htmlFor="axon-spike">Axon Spike:</label>
          <input
            type="text"
            id="axon-spike"
            value={axonSpike}
            onChange={handleAxonSpikeChange}
          />
        </div>
      )}

      {/* Reset */}
      {tipo === 'Spiking neuron' && (
        <div className="reset">
          <label htmlFor="reset">Reset:</label>
          <input
            type="text"
            id="reset"
            value={reset}
            onChange={handleResetChange}
          />
        </div>
      )}

      {/* Axon Reset */}
      {tipo === 'Spiking neuron' && (
        <div className="axon-reset">
          <label htmlFor="axon-reset">Axon Reset:</label>
          <input
            type="text"
            id="axon-reset"
            value={axonReset}
            onChange={handleAxonResetChange}
          />
        </div>
      )}

      {/* Refractory */}
      {tipo === 'Spiking neuron' && (
        <div className="refractory">
          <label htmlFor="refractory">Refractory:</label>
          <input
            type="text"
            id="refractory"
            value={refractory}
            onChange={handleRefractoryChange}
          />
        </div>
      )}

      {/* Firing Rate */}
      {tipo === 'Rate-Coded neuron' && (
        <div className="firing-rate">
          <label htmlFor="firing-rate">Firing Rate:</label>
          <input
            type="text"
            id="firing-rate"
            value={firingRate}
            onChange={handleFiringRateChange}
          />
        </div>
      )}

      {/* Botón para guardar */}
      <button onClick={handleSave}>Guardar</button>
    </div>
  );
}

export default Gestionador;
