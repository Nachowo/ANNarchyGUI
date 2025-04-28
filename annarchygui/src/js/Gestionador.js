import React, { useState, useEffect } from "react";
import { Chart } from 'chart.js';  // <-- Agregado para solucionar el error "Chart is not defined"
import "./../css/Gestionador.css";

function Gestionador({ neuron, onSave, monitors, setMonitors }) { // Añadir setMonitors como prop
  const [activeTab, setActiveTab] = useState('neuron'); // Pestaña predeterminada
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
  const [monitorAttributes, setMonitorAttributes] = useState([]);
  const canvasRef = React.useRef(null);

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
    
    if (neuron.id !== undefined) {
      const neuronMonitors = monitors.filter(m => m.populationId === neuron.id);
      setMonitorAttributes(neuronMonitors.map(monitor => ({
        id: monitor.id,
        target: neuron.name, 
        variables: monitor.variables || []
      })));
    } else {
      setMonitorAttributes([]);
    }
  }, [neuron, monitors]);

  useEffect(() => {
    if (activeTab === 'monitor' && window.monitorVoltages && canvasRef.current) {
      // Inicializa el gráfico usando los datos globales
      const ctx = canvasRef.current.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: window.monitorVoltages.map((_, index) => index),
          datasets: [
            {
              label: 'Voltajes',
              data: window.monitorVoltages.map(value => value[0]),
              borderColor: 'blue',
              borderWidth: 2,
              fill: false,
            }
          ]
        },
        options: {
          scales: {
            x: { title: { display: true, text: 'Muestra' } },
            y: { title: { display: true, text: 'Voltaje (mV)' } }
          }
        }
      });
    }
  }, [activeTab]);

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

  const handleMonitorAttributeChange = (index, field, value) => {
    const newMonitorAttributes = [...monitorAttributes];
    newMonitorAttributes[index] = {
      ...newMonitorAttributes[index],
      [field]: value
    };
    setMonitorAttributes(newMonitorAttributes);
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
      alert('Los campos Parámetros, Ecuaciones y Spike son requeridos para neuronas Spiking.');
      return;
    }
  
    if (tipo === 'Rate-Coded neuron' && (!parameters.length || !equations || !firingRate)) {
      alert('Los campos Parámetros, Ecuaciones y Firing Rate son requeridos para neuronas Rate-Coded.');
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
        firingRate,
      }
    };
  
    const updatedMonitors = monitorAttributes.map(monitor => ({
      id: monitor.id,
      populationId: neuron.id,
      target: monitor.target,
      variables: monitor.variables
    }));
  
    onSave(updatedNeuron, updatedMonitors);
  };

  const handleMonitorToggle = (e) => {
    const isChecked = e.target.checked;    

    if (isChecked) {
      // Crear monitor si no existe
      if (!neuron.hasMonitor) {
        const newMonitor = {
          id: monitors.length + 1,
          target: neuron.name,
          variables: neuron.variablesMonitor.length > 0 ? [neuron.variablesMonitor[0]] : [],
          populationId: neuron.id,
          populationName: neuron.name,
        };
        setMonitors([...monitors, newMonitor]);
        neuron.hasMonitor = true;
      }
    } else {
      // Eliminar monitor asociado
      setMonitors(monitors.filter((monitor) => monitor.populationId !== neuron.id));
      neuron.hasMonitor = false;
    }

    setMonitorAttributes([]); // Actualizar el estado local si es necesario
  };

  return (
    <div className="neuron-form">
      <div className="tabs">
        <button 
          className={activeTab === 'neuron' ? 'active' : ''} 
          onClick={() => setActiveTab('neuron')}
        >
          Neuron
        </button>
        <button 
          style={{
            backgroundColor: !neuron.hasMonitor ? '#ccc' : '',
            cursor: !neuron.hasMonitor ? 'not-allowed' : 'pointer'
          }}
          className={activeTab === 'monitor' ? 'active' : ''} 
          onClick={() => neuron.hasMonitor && setActiveTab('monitor')} 
          disabled={!neuron.hasMonitor}
        >
          Monitor
        </button>

      </div>
      {activeTab === 'neuron' && (
        <>
          <div className="fields-container">
            <div className="column">
              <div className="row">
                <label htmlFor="neuron-name">Name:</label>
                <input type="text" id="neuron-name" value={name} onChange={handleNameChange} />
              </div>
            </div>
            <div className="column">
          <div className="row" style={{ display: 'flex', alignItems: 'left' }}>
              <label htmlFor="has-monitor">Enable Monitor:</label>
              <input
                type="checkbox"
                id="has-monitor"
                checked={neuron.hasMonitor}
                onChange={handleMonitorToggle}
              />
            </div>
            </div>
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
                    <textarea id="spike" value={spike} onChange={handleSpikeChange} />
                  </div>
                  <div className="row">
                    <label htmlFor="axon-spike">Axon Spike:</label>
                    <textarea id="axon-spike" value={axonSpike} onChange={handleAxonSpikeChange} />
                  </div>
                  <div className="row">
                    <label htmlFor="reset">Reset:</label>
                    <textarea id="reset" value={reset} onChange={handleResetChange} />
                  </div>
                </>
              )}
            </div>
            <div className="column">
              {tipo === 'Spiking neuron' && (
                <>
                  <div className="row">
                    <label htmlFor="axon-reset">Axon Reset:</label>
                    <textarea id="axon-reset" value={axonReset} onChange={handleAxonResetChange} />
                  </div>
                  <div className="row">
                    <label htmlFor="refractory">Refractory:</label>
                    <textarea id="refractory" value={refractory} onChange={handleRefractoryChange} />
                  </div>
                </>
              )}
            </div>
          </div>
          {tipo === 'Rate-Coded neuron' && (
            <div className="row">
              <label htmlFor="firing-rate">Firing rate:</label>
              <textarea id="firing-rate" value={firingRate} onChange={handleFiringRateChange} />
            </div>
          )}
          
          <div className="row">
            <label htmlFor="functions">Functions:</label>
            <textarea id="functions" value={functions} onChange={handleFunctionChange} />
          </div>
        </>
      )}
      {activeTab === 'monitor' && (
        <div>
          {monitorAttributes.map((monitor, index) => (
            <div key={index}>
              <div className="row">
                <label htmlFor={`monitor-target-${index}`}>Target:</label>
                <input 
                  type="text" 
                  id={`monitor-target-${index}`} 
                  value={monitor.target || ''} 
                  disabled // Campo no editable
                />
              </div>
              <div className="row">
                <label htmlFor={`monitor-variables-${index}`}>Variables:</label>
                {neuron.variablesMonitor && neuron.variablesMonitor.length > 0 ? (
                  <select
                    id={`monitor-variables-${index}`}
                    multiple
                    value={monitor.variables || []}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                      handleMonitorAttributeChange(index, 'variables', selectedOptions);
                    }}
                  >
                    {neuron.variablesMonitor.map((varName) => (
                      <option key={varName} value={varName}>{varName}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id={`monitor-variables-${index}`}
                    value={(monitor.variables || []).join(', ')}
                    onChange={(e) => {
                      const valueArray = e.target.value.split(',').map(v => v.trim());
                      handleMonitorAttributeChange(index, 'variables', valueArray);
                    }}
                  />
                )}
              </div>
            </div>
          ))}
          {/* Mostrar gráfico si existen datos en la variable global */}
          {window.monitorVoltages && window.monitorVoltages.length > 0 && (
            <div>
              <h4>Monitor Chart:</h4>
              <canvas ref={canvasRef} width="600" height="400"></canvas>
            </div>
          )}
        </div>
      )}

      <div className="actions">
        <button className="save" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}

export default Gestionador;
