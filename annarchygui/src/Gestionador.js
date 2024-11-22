import React, { useState, useEffect } from "react";
import "./Gestionador.css";

function Gestionador({ neuron }) {
  const [equation, setEquation] = useState(neuron.neuron.equation);
  const [parameters, setParameters] = useState(Object.entries(neuron.neuron.parameters).map(([name, value]) => ({ name, value })));
  const [variables, setVariables] = useState(Object.entries(neuron.neuron.variables).map(([name, value]) => ({ name, value })));
  const [attributes, setAttributes] = useState(Object.entries(neuron.attributes).map(([name, value]) => ({ name, value })));

  useEffect(() => {
    setEquation(neuron.neuron.equation);
    setParameters(Object.entries(neuron.neuron.parameters).map(([name, value]) => ({ name, value })));
    setVariables(Object.entries(neuron.neuron.variables).map(([name, value]) => ({ name, value })));
    setAttributes(Object.entries(neuron.attributes).map(([name, value]) => ({ name, value })));
  }, [neuron]);

  const handleEquationChange = (e) => {
    setEquation(e.target.value);
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

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
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

  return (
    <div className="container">
      {/* Encabezado */}
      <div className="header">
        <label htmlFor="nombre">Nombre:</label>
        <input type="text" id="nombre" defaultValue={neuron.name} />
      </div>

      {/* Ecuación */}
      <div className="equation">
        <label htmlFor="equation">Ecuación:</label>
        <input
          type="text"
          id="equation"
          value={equation}
          onChange={handleEquationChange}
        />
      </div>

      {/* Tablas */}
      <div className="tables-container">
        {/* Tabla de Parámetros */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Parámetros</th>
                <th>Valor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {parameters.map((param, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={param.name}
                      onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => removeParameter(index)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="3">
                  <button onClick={addParameter}>Añadir Parámetro</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabla de Variables */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Valor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {variables.map((variable, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={variable.name}
                      onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={variable.value}
                      onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => removeVariable(index)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="3">
                  <button onClick={addVariable}>Añadir Variable</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Atributos */}
      <div className="attributes">
        <h3>Atributos</h3>
        {attributes.map((attribute, index) => (
          <div key={index} className="attribute">
            <label>{attribute.name}:</label>
            <input
              type="text"
              value={attribute.value}
              onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gestionador;
