import React, { useState, useEffect } from "react";
import { generateSpikeGraph, generateVariableGraph, generateRasterPlot } from './GraphGenerator';
import TimeRangeSlider from './Slider';
import "./../css/Gestionador.css";

function Gestionador({ neuron, onSave, monitors, setMonitors, graphics, graphicMonitors, nextMonitorId, setNextMonitorId, variablesData, lastSimTime }) {
  const [activeTab, setActiveTab] = useState('neuron'); 
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
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0); // Valor inicial arbitrario
  const [rangeStart, setRangeStart] = useState(1); // Estado para el rango de inicio
  const [rangeEnd, setRangeEnd] = useState(1); // Estado para el rango de fin
  const [selectedOptions, setSelectedOptions] = useState([]); // Estado para las opciones seleccionadas
  const [showLabels, setShowLabels] = useState(false); // Por defecto oculto

  const handleTimeRangeChange = ([start, end]) => {
    setStartTime(start);
    setEndTime(end);
  };

  // Solo reinicializa los valores del formulario cuando cambia el id de la neurona
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
  }, [neuron.id]);

  // Sincroniza solo los monitores cuando cambian
  useEffect(() => {
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
  }, [neuron.id, monitors]);

  useEffect(() => {
    if (activeTab === 'monitor' && Array.isArray(graphicMonitors)) {
      const monitorIndex = graphicMonitors.indexOf(monitorAttributes[0]?.id); // Usar el ID del monitor
      if (monitorIndex !== -1 && graphics[monitorIndex]) {
        const graphicElement = graphics[monitorIndex];
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Dibujar la imagen en el canvas
          };
          img.src = graphicElement.src; // Usar la fuente del gráfico
        }
      }
    }
  }, [activeTab, monitorAttributes, graphicMonitors, graphics]);

  useEffect(() => {
    if (activeTab === 'monitor' && neuron.hasMonitor) {
      const spikeData = monitorAttributes.find(attr => attr.variables.includes('spike'))?.data;
      if (spikeData) {
        //generateSpikeGraph('spikeGraphCanvas', spikeData);
      }
    }
  }, [activeTab, neuron, monitorAttributes]);

  useEffect(() => {
    if (activeTab === 'monitor' && neuron.hasMonitor && variablesData.length > 0) {
      const monitorId = monitorAttributes[0]?.id;
      const variable = selectedOptions[0]; // la variable seleccionada en el select

      if (monitorId && variable) {
        const monitorDatum = variablesData.find(
          data => data.monitorId === monitorId && data.variable === variable
        );
        if (monitorDatum) {
          if (variable === 'spike') {
            generateSpikeGraph('spikeGraphCanvas', monitorDatum.data, startTime, endTime, 1, showLabels);
          } else if (variable === 'raster_plot') {
            generateRasterPlot('rasterPlotCanvas', monitorDatum.data, startTime, endTime, showLabels);
          } else {
            generateVariableGraph(
              `variableGraphCanvas-${variable}`,
              monitorDatum.data,
              variable,
              [Number(rangeStart), Number(rangeEnd)],
              startTime,
              endTime,
              showLabels
            );
          }
        }
      }
    }
  }, [activeTab, neuron, variablesData, startTime, endTime, rangeStart, rangeEnd, selectedOptions, showLabels, monitorAttributes]);

  useEffect(() => {
    if (activeTab === 'monitor') {
      setEndTime(lastSimTime); // Actualizar endTime con el valor de lastSimTime cuando se muestre el gráfico
    }
  }, [activeTab, lastSimTime]); // Ejecutar este efecto cuando activeTab o lastSimTime cambien

  // Limpiar gráficos cuando cambia la variable seleccionada
  useEffect(() => {
    if (activeTab === 'monitor') {
      // Limpiar todos los canvas de gráficos
      const canvasIds = ['spikeGraphCanvas', 'rasterPlotCanvas'];
      if (neuron.variablesMonitor) {
        neuron.variablesMonitor.forEach(variable => {
          const canvas = document.getElementById(`variableGraphCanvas-${variable}`);
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        });
      }
      canvasIds.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      });
    }
  }, [selectedOptions, activeTab, neuron.variablesMonitor]);

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

  const handleRangeStartChange = (e) => {
    setRangeStart(e.target.value);
  };

  const handleRangeEndChange = (e) => {
    setRangeEnd(e.target.value);
  };

  const handleOptionChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
    console.log('Selected values:', selectedValues); // Verificar los valores seleccionados
    setSelectedOptions(selectedValues); // Actualizar el estado con las opciones seleccionadas

    // Actualizar las variables del monitor correspondiente
    const updatedMonitorAttributes = monitorAttributes.map((monitor, index) => {
      if (index === 0) { // Suponiendo que el primer monitor es el relevante
        return {
          ...monitor,
          variables: selectedValues,
        };
      }
      return monitor;
    });
    setMonitorAttributes(updatedMonitorAttributes);
  };

  const addParameter = () => {
    setParameters([...parameters, { name: '', value: '' }]);
  };

  const removeParameter = (index) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const removeFunction = (index) => {
    setFunctions(functions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    /** 
    if (tipo === 'Spiking neuron' && (!parameters.length || !equations || !spike)) {
      alert('Los campos Parámetros, Ecuaciones y Spike son requeridos para neuronas Spiking.');
      return;
    }

    if (tipo === 'Rate-Coded neuron' && (!parameters.length || !equations || !firingRate)) {
      alert('Los campos Parámetros, Ecuaciones y Firing Rate son requeridos para neuronas Rate-Coded.');
      return;
    }
*/
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
          id: nextMonitorId,
          target: neuron.name,
          variables: neuron.variablesMonitor.length > 0 ? [neuron.variablesMonitor[0]] : [],
          populationId: neuron.id,
          populationName: neuron.name,
        };
        setMonitors([...monitors, newMonitor]);
        neuron.hasMonitor = true;
        setNextMonitorId(nextMonitorId + 1); // Incrementar el ID del siguiente monitor
      }
    } else {
      // Eliminar monitor asociado
      setMonitors(monitors.filter((monitor) => monitor.populationId !== neuron.id));
      neuron.hasMonitor = false;
    }

    setMonitorAttributes([]); // Actualizar el estado local si es necesario
  };

  useEffect(() => {
    if (activeTab === 'monitor' && neuron.hasMonitor) {
      // Si hay una selección previa de variables para este monitor, restaurarla
      if (monitorAttributes.length > 0 && monitorAttributes[0].variables && monitorAttributes[0].variables.length > 0) {
        setSelectedOptions(monitorAttributes[0].variables);
      }
    }
  }, [activeTab, neuron, monitorAttributes]);

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
        <div className="monitor-container">
          <div className="monitor-inputs">

            {monitorAttributes.map((monitor, index) => (
              <div key={index} className="input-group">
                <label htmlFor={`monitor-target-${index}`}>Target:</label>
                <input
                  type="text"
                  id={`monitor-target-${index}`}
                  value={monitor.target || ''}
                  disabled
                />

                <label htmlFor={`monitor-variables-${index}`}>Variables:</label>
                {neuron.variablesMonitor?.length > 0 ? (
                  <select
                    multiple
                    id={`monitor-variables-${index}`}
                    value={selectedOptions}
                    onChange={handleOptionChange}

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
            ))}

            <div className="input-group">
              <label htmlFor="rangeStart">Rango Inicio:</label>
              <input
                type="number"
                id="rangeStart"
                value={rangeStart}
                onChange={handleRangeStartChange}
                style={{ width: '80px' }} // Aumentar el tamaño del input
              />


              <label htmlFor="rangeEnd">Rango Fin:</label>
              <input
                type="number"
                id="rangeEnd"
                value={rangeEnd}
                onChange={handleRangeEndChange}
                style={{ width: '80px' }} // Aumentar el tamaño del input
              />
            </div>


          </div>

          <div className="monitor-graphics">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button
                className="toggle-labels"
                onClick={() => setShowLabels((prev) => !prev)}
              >
                {showLabels ? 'Hide labels' : 'Show labels'}
              </button>
              {/* Botón de descarga global, solo si hay un gráfico visible y datos */}
              {monitorAttributes.some((monitor) => {
                const variable = selectedOptions[0];
                return selectedOptions.length === 1 && monitor.variables.includes(variable) && variablesData.some(data => data.monitorId === monitor.id && data.variable === variable);
              }) && (
                <button
                  onClick={() => {
                    // Buscar el primer canvas visible con datos
                    for (const monitor of monitorAttributes) {
                      const variable = selectedOptions[0];
                      if (selectedOptions.length === 1 && monitor.variables.includes(variable)) {
                        let canvasId = '';
                        if (variable === 'spike') {
                          canvasId = 'spikeGraphCanvas';
                        } else if (variable === 'raster_plot') {
                          canvasId = 'rasterPlotCanvas';
                        } else {
                          canvasId = `variableGraphCanvas-${variable}`;
                        }
                        const hasData = variablesData.some(data => data.monitorId === monitor.id && data.variable === variable);
                        if (hasData) {
                          const canvas = document.getElementById(canvasId);
                          if (canvas) {
                            // Crear un canvas temporal más grande con fondo blanco y margen
                            const margin = 32; // margen en píxeles
                            const tempCanvas = document.createElement('canvas');
                            tempCanvas.width = canvas.width + margin * 2;
                            tempCanvas.height = canvas.height + margin * 2;
                            const ctx = tempCanvas.getContext('2d');
                            ctx.fillStyle = '#fff';
                            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                            // Dibujar el gráfico original centrado con margen
                            ctx.drawImage(canvas, margin, margin);
                            const url = tempCanvas.toDataURL('image/png');
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${variable}_graph.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }
                          break;
                        }
                      }
                    }
                  }}
                >
                  Download graph
                </button>
              )}
            </div>
            {monitorAttributes.map((monitor, index) => {
              const variable = selectedOptions[0];
              const hasData = selectedOptions.length === 1 && monitor.variables.includes(variable) && variablesData.some(data => data.monitorId === monitor.id && data.variable === variable);
              let canvasId = '';
              if (variable === 'spike') {
                canvasId = 'spikeGraphCanvas';
              } else if (variable === 'raster_plot') {
                canvasId = 'rasterPlotCanvas';
              } else {
                canvasId = `variableGraphCanvas-${variable}`;
              }
              // Mostrar el recuadro aunque no haya variable seleccionada
              return (
                <div key={index} className="graph-block" style={{position: 'relative', width: 640, height: 480}}>
                  {selectedOptions.length === 1 && monitor.variables.includes(variable) ? (
                    (() => {
                      const hasData = variablesData.some(data => data.monitorId === monitor.id && data.variable === variable);
                      if (!hasData) {
                        return (
                          <div style={{
                            width: 640,
                            height: 480,
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            color: '#333',
                            border: '2px dashed #aaa',
                            zIndex: 2
                          }}>
                            Run a simulation first to see the graph
                          </div>
                        );
                      }
                      if (variable === 'spike') {
                        return <canvas key={variable} id="spikeGraphCanvas" width="640" height="480"></canvas>;
                      } else if (variable === 'raster_plot') {
                        return <canvas key={variable} id="rasterPlotCanvas" width="640" height="480"></canvas>;
                      } else {
                        return <canvas key={variable} id={`variableGraphCanvas-${variable}`} width="640" height="480"></canvas>;
                      }
                    })()
                  ) : (
                    <div style={{
                      width: 640,
                      height: 480,
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: '#333',
                      border: '2px dashed #aaa',
                      zIndex: 2
                    }}>
                      Select a variable to display its graph
                    </div>
                  )}
                </div>
              );
            })}
            <TimeRangeSlider
              min={0}
              max={lastSimTime}
              step={1}
              onChange={handleTimeRangeChange}
            />
            {/* El canvasRef y graphics legacy se mantienen por compatibilidad, pero no se usan para monitorización */}
            {graphics.length > 0 && (
              <div className="graph-block">
                <canvas ref={canvasRef} width="640" height="480"></canvas>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="actions">
        <button className="save" onClick={handleSave}>Save</button>
      </div>



    </div>
  );
}

export default Gestionador;
