import React, { useState, useEffect } from "react";
import "./../css/Gestionador.css";

function SynapseGestionador({ synapse, onSave, onDelete, setShowSynapseGestionador }) {
  const [activeTab, setActiveTab] = useState(synapse.id ? 'connection' : 'synapse'); // Mostrar pestaña correcta según si se está creando o editando
  const [name, setName] = useState(synapse.attributes?.name || synapse.name || '');
  const [tipo, setTipo] = useState(synapse.attributes.tipo || 'spiking');
  const [parameters, setParameters] = useState(Object.entries(synapse.attributes.parameters || {}).map(([name, value]) => ({ name, value })));
  const [equations, setEquations] = useState(synapse.attributes.equations || '');
  const [psp, setPsp] = useState(synapse.attributes.psp || '');
  const [operation, setOperation] = useState(synapse.attributes.operation || 'sum');
  const [preSpike, setPreSpike] = useState(synapse.attributes.pre_spike || '');
  const [postSpike, setPostSpike] = useState(synapse.attributes.post_spike || '');
  const [preAxonSpike, setPreAxonSpike] = useState(synapse.attributes.pre_axon_spike || '');
  const [functions, setFunctions] = useState(synapse.attributes.functions || '');
  const [variables, setVariables] = useState(Object.entries(synapse.attributes.variables || {}).map(([name, value]) => ({ name, value })));
  const [target, setTarget] = useState(synapse.connections?.target || 'exc');
  const [rule, setRule] = useState(synapse.connections?.rule || 'all_to_all');
  const [weights, setWeights] = useState(synapse.connections?.weights || '');
  const [delays, setDelays] = useState(synapse.connections?.delays || '');

  useEffect(() => {
    setName(synapse.attributes?.name || synapse.name || '');
    setTipo(synapse.attributes?.tipo || 'spiking');
    setParameters(Object.entries(synapse.attributes?.parameters || {}).map(([name, value]) => ({ name, value })));
    setEquations(synapse.attributes?.equations || '');
    setPsp(synapse.attributes?.psp || '');
    setOperation(synapse.attributes?.operation || 'sum');
    setPreSpike(synapse.attributes?.pre_spike || '');
    setPostSpike(synapse.attributes?.post_spike || '');
    setPreAxonSpike(synapse.attributes?.pre_axon_spike || '');
    setFunctions(synapse.attributes?.functions || '');
    setVariables(Object.entries(synapse.attributes?.variables || {}).map(([name, value]) => ({ name, value })));
    setTarget(synapse.connections?.target || 'exc');
    setRule(synapse.connections?.rule || 'all_to_all');
    setWeights(synapse.connections?.weights || '');
    setDelays(synapse.connections?.delays || '');
  }, [synapse]);

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

  const handleSave = () => {
    // Construir el objeto attributes asegurando que el nombre se guarda correctamente
    const updatedAttributes = {
      ...synapse.attributes,
      name: name,
      tipo,
      parameters: parameters.reduce((acc, param) => {
        if (param.name) acc[param.name] = param.value;
        return acc;
      }, {}),
      equations,
      psp,
      operation,
      pre_spike: preSpike,
      post_spike: postSpike,
      pre_axon_spike: preAxonSpike,
      functions,
      variables: variables.reduce((acc, variable) => {
        if (variable.name) acc[variable.name] = variable.value;
        return acc;
      }, {})
    };
    const updatedSynapse = {
      ...synapse,
      name: name,
      attributes: updatedAttributes,
      connections: {
        ...synapse.connections,
        target,
        rule,
        weights,
        delays
      }
    };
    onSave(updatedSynapse);
  };

  const handleDelete = () => {
    onDelete(synapse.id);
    setShowSynapseGestionador(false); // Close the manager after deleting the synapse
  };

  return (
    <div className="neuron-form">
      {synapse.id && (<div className="tabs">
        <button className={activeTab === 'connection' ? 'active' : ''} onClick={() => setActiveTab('connection')}>Connection</button>
        <button className={activeTab === 'synapse' ? 'active' : ''} onClick={() => setActiveTab('synapse')}>Synapse</button>
      </div>
      )}
      {activeTab === 'synapse' && (
        <>
          <div className="row">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Synapse name" />
          </div>
          <div className="row">
            <label htmlFor="tipo">Type:</label>
            <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="spiking">Spiking</option>
              <option value="rate-coded">Rate-Coded</option>
            </select>
          </div>
          <div className="row">
            <label htmlFor="equations">Equations:</label>
            <input type="text" id="equations" value={equations} onChange={(e) => setEquations(e.target.value)} placeholder="Synapse equations" />
          </div>
          <div className="tables-container">
            <div className="group">
              <h3>Parameters</h3>
              <div className="table">
                {parameters.map((param, index) => (
                  <div className="row" key={index}>
                    <input
                      type="text"
                      placeholder="Parameter name"
                      value={param.name}
                      onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Parameter value"
                      value={param.value}
                      onChange={(e) => handleParameterChange(index, "value", e.target.value)}
                    />
                    <button className="delete" onClick={() => removeParameter(index)}>Delete</button>
                  </div>
                ))}
                <button className="add" onClick={addParameter}>Add parameter</button>
              </div>
            </div>

            <div className="group variables">
              <h3>Variables</h3>
              <div className="table">
                {variables.map((variable, index) => (
                  <div className="row" key={index}>
                    <input
                      type="text"
                      placeholder="Variable name"
                      value={variable.name}
                      onChange={(e) => handleVariableChange(index, "name", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Variable value"
                      value={variable.value}
                      onChange={(e) => handleVariableChange(index, "value", e.target.value)}
                    />
                    <button className="delete" onClick={() => removeVariable(index)}>Delete</button>
                  </div>
                ))}
                <button className="add" onClick={addVariable}>Add variable</button>
              </div>
            </div>
          </div>
          
          {tipo === 'spiking' && (
            <>
              <div className="row">
                <label htmlFor="psp">PSP:</label>
                <input type="text" id="psp" value={psp} onChange={(e) => setPsp(e.target.value)} placeholder="PSP" />
              </div>
              <div className="row">
                <label htmlFor="preSpike">Pre-Spike:</label>
                <input type="text" id="preSpike" value={preSpike} onChange={(e) => setPreSpike(e.target.value)} placeholder="Pre-Spike" />
              </div>
              <div className="row">
                <label htmlFor="postSpike">Post-Spike:</label>
                <input type="text" id="postSpike" value={postSpike} onChange={(e) => setPostSpike(e.target.value)} placeholder="Post-Spike" />
              </div>
              <div className="row">
                <label htmlFor="preAxonSpike">Pre-Axon-Spike:</label>
                <input type="text" id="preAxonSpike" value={preAxonSpike} onChange={(e) => setPreAxonSpike(e.target.value)} placeholder="Pre-Axon-Spike" />
              </div>
            </>
          )}
          <div className="row">
            <label htmlFor="operation">Operation:</label>
            <select id="operation" value={operation} onChange={(e) => setOperation(e.target.value)}>
              <option value="sum">sum</option>
              <option value="mean">mean</option>
              <option value="max">max</option>
              <option value="min">min</option>
            </select>
          </div>
          {tipo === 'rate-coded' && (
            <div className="row">
              <label htmlFor="functions">Functions:</label>
              <input type="text" id="functions" value={functions} onChange={(e) => setFunctions(e.target.value)} placeholder="Functions" />
            </div>
          )}
        </>
      )}
      {activeTab === 'connection' && synapse.id && (
        <div className="connection-form">
          <h3>Projection Configuration</h3>
          <div className="row">
            <label htmlFor="target">Target:</label>
            <select id="target" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="exc">Excitatory</option>
              <option value="inh">Inhibitory</option>
              {/* Other options */}
            </select>
          </div>
          <h3>Connection Configuration</h3>
          <div className="row">
            <label htmlFor="rule">Rule:</label>
            <select id="rule" value={rule} onChange={(e) => setRule(e.target.value)}>
              <option value="all_to_all">all_to_all</option>
              <option value="one_to_one">one_to_one</option>
              {/* Other options */}
            </select>
          </div>
          <div className="row">
            <label htmlFor="weights">Weights:</label>
            <input type="text" id="weights" value={weights} onChange={(e) => setWeights(e.target.value)} placeholder="Numeric field or custom function" />
          </div>
          <div className="row">
            <label htmlFor="delays">Delays:</label>
            <input type="text" id="delays" value={delays} onChange={(e) => setDelays(e.target.value)} placeholder="Numeric field or custom function" />
          </div>
        </div>
      )}
      <div className="actions">
        {synapse.id && <button className="delete" onClick={handleDelete}>Delete</button>}
        <button className="save" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}

export default SynapseGestionador;