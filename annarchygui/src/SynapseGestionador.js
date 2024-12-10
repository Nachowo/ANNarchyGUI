import React, { useState, useEffect } from "react";
import "./Gestionador.css";

function SynapseGestionador({ synapse, onSave }) {
  const [activeTab, setActiveTab] = useState('synapse');
  const [name, setName] = useState(synapse.name || '');
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
  const [prePopulation, setPrePopulation] = useState('');
  const [postPopulation, setPostPopulation] = useState('');
  const [target, setTarget] = useState('');
  const [synapseType, setSynapseType] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [disableOmp, setDisableOmp] = useState(true);
  const [rule, setRule] = useState('');
  const [weights, setWeights] = useState('');
  const [delays, setDelays] = useState('');

  useEffect(() => {
    setName(synapse.name || '');
    setTipo(synapse.attributes.tipo || 'spiking');
    setParameters(Object.entries(synapse.attributes.parameters || {}).map(([name, value]) => ({ name, value })));
    setEquations(synapse.attributes.equations || '');
    setPsp(synapse.attributes.psp || '');
    setOperation(synapse.attributes.operation || 'sum');
    setPreSpike(synapse.attributes.pre_spike || '');
    setPostSpike(synapse.attributes.post_spike || '');
    setPreAxonSpike(synapse.attributes.pre_axon_spike || '');
    setFunctions(synapse.attributes.functions || '');
    setVariables(Object.entries(synapse.attributes.variables || {}).map(([name, value]) => ({ name, value })));
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
    if (tipo === 'spiking' && (!equations || !operation)) {
      alert('Los campos Ecuaciones y Operación son obligatorios para Spiking synapses.');
      return;
    }

    if (tipo === 'rate-coded' && (!equations || !operation)) {
      alert('Los campos Ecuaciones y Operación son obligatorios para Rate-Coded synapses.');
      return;
    }

    const updatedSynapse = {
      ...synapse,
      name: name || synapse.name,
      attributes: {
        tipo,
        parameters: parameters.reduce((acc, param) => {
          acc[param.name] = param.value;
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
          acc[variable.name] = variable.value;
          return acc;
        }, {})
      }
    };
    onSave(updatedSynapse);
  };

  return (
    <div className="neuron-form">
      <div className="tabs">
        <button className={activeTab === 'synapse' ? 'active' : ''} onClick={() => setActiveTab('synapse')}>Sinapsis</button>
        <button className={activeTab === 'connection' ? 'active' : ''} onClick={() => setActiveTab('connection')}>Conexión</button>
      </div>
      
      {activeTab === 'synapse' && (
        <>
        
          <div className="row">
            <label htmlFor="name">Nombre:</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la sinapsis" />
          </div>
          <div className="row">
            <label htmlFor="tipo">Tipo:</label>
            <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="spiking">Spiking</option>
              <option value="rate-coded">Rate-Coded</option>
            </select>
          </div>
          <div className="row">
            <label htmlFor="equations">Ecuaciones:</label>
            <input type="text" id="equations" value={equations} onChange={(e) => setEquations(e.target.value)} placeholder="Ecuaciones de la sinapsis" />
          </div>
          <div className="tables-container">
            <div className="group">
              <h3>Parámetros</h3>
              <div className="table">
                {parameters.map((param, index) => (
                  <div className="row" key={index}>
                    <input
                      type="text"
                      placeholder="Nombre del parámetro"
                      value={param.name}
                      onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Valor del parámetro"
                      value={param.value}
                      onChange={(e) => handleParameterChange(index, "value", e.target.value)}
                    />
                    <button className="delete" onClick={() => removeParameter(index)}>Eliminar</button>
                  </div>
                ))}
                <button className="add" onClick={addParameter}>Añadir parámetro</button>
              </div>
            </div>

            <div className="group variables">
              <h3>Variables</h3>
              <div className="table">
                {variables.map((variable, index) => (
                  <div className="row" key={index}>
                    <input
                      type="text"
                      placeholder="Nombre de la variable"
                      value={variable.name}
                      onChange={(e) => handleVariableChange(index, "name", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Valor de la variable"
                      value={variable.value}
                      onChange={(e) => handleVariableChange(index, "value", e.target.value)}
                    />
                    <button className="delete" onClick={() => removeVariable(index)}>Eliminar</button>
                  </div>
                ))}
                <button className="add" onClick={addVariable}>Añadir variable</button>
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
            <label htmlFor="operation">Operación:</label>
            <input type="text" id="operation" value={operation} onChange={(e) => setOperation(e.target.value)} placeholder="Operación" />
          </div>
          {tipo === 'rate-coded' && (
            <div className="row">
              <label htmlFor="functions">Funciones:</label>
              <input type="text" id="functions" value={functions} onChange={(e) => setFunctions(e.target.value)} placeholder="Funciones" />
            </div>
          )}
        </>
      )}
      {activeTab === 'connection' && (
        <div className="connection-form">
          <h3>Configuración de la Proyección</h3>
          <div className="row">
            <label htmlFor="target">Target:</label>
            <select id="target" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="exc">Excitatoria</option>
              <option value="inh">Inhibitoria</option>
              {/* Otras opciones */}
            </select>
          </div>
          <div className="row">
            <label htmlFor="disableOmp">disable_omp:</label>
            <input type="checkbox" id="disableOmp" checked={disableOmp} onChange={(e) => setDisableOmp(e.target.checked)} />
          </div>
          <h3>Configuración de la Conexión</h3>
          <div className="row">
            <label htmlFor="rule">Rule:</label>
            <select id="rule" value={rule} onChange={(e) => setRule(e.target.value)}>
              <option value="all_to_all">all_to_all</option>
              <option value="one_to_one">one_to_one</option>
              {/* Otras opciones */}
            </select>
          </div>
          <div className="row">
            <label htmlFor="weights">Weights:</label>
            <input type="text" id="weights" value={weights} onChange={(e) => setWeights(e.target.value)} placeholder="Campo numérico o función personalizada" />
          </div>
          <div className="row">
            <label htmlFor="delays">Delays:</label>
            <input type="text" id="delays" value={delays} onChange={(e) => setDelays(e.target.value)} placeholder="Campo numérico o función personalizada" />
          </div>
        </div>
      )}
      <div className="actions">
        <button className="delete">Eliminar</button>
        <button className="save" onClick={handleSave}>Guardar</button>
      </div>
    </div>
  );
}

export default SynapseGestionador;