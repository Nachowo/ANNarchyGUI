import React, { useState, useEffect } from "react";
import { generateSpikeGraph, generateVariableGraph, generateRasterPlot } from '../SubModulos/GraphGenerator';
import TimeRangeSlider from './Slider';
import "./../css/Gestionador.css";

/**
 * Panel de configuración para editar una población neuronal y sus monitores.
 * Permite modificar parámetros, ecuaciones, tipo, cantidad y gestionar la monitorización y visualización de gráficos.
 */
function ConfigPanelNeuron({ neuron, onSave, monitors, setMonitors, graphics, graphicMonitors, nextMonitorId, setNextMonitorId, variablesData, lastSimTime }) {
  const [activeTab, setActiveTab] = useState('neuron'); 
  const [name, setName] = useState(neuron.name || '');
  const [tipo, setTipo] = useState(neuron.attributes.tipo || '');
  const [equations, setEquations] = useState(neuron.attributes.equations || '');
  const [parameters, setParameters] = useState(Object.entries(neuron.attributes.parameters || {}).map(([name, value]) => ({ name, value })));
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

  /**
   * Actualiza el rango de tiempo seleccionado para los gráficos.
   */
  const handleTimeRangeChange = ([start, end]) => {
    setStartTime(start);
    setEndTime(end);
  };

  /**
   * Sincroniza los campos del formulario con los datos de la neurona seleccionada.
   */
  useEffect(() => {
    setName(neuron.name || '');
    setTipo(neuron.attributes.tipo || 'Spiking neuron');
    setEquations(neuron.attributes.equations || '');
    setParameters(Object.entries(neuron.attributes.parameters || {}).map(([name, value]) => ({ name, value })));
    setSpike(neuron.attributes.spike || '');
    setAxonSpike(neuron.attributes.axon_spike || '');
    setReset(neuron.attributes.reset || '');
    setAxonReset(neuron.attributes.axon_reset || '');
    setRefractory(neuron.attributes.refractory || '');
    setFiringRate(neuron.attributes.firingRate || '');
    setQuantity(neuron.id !== undefined ? neuron.quantity : 1);
  }, [neuron.id]);

  /**
   * Sincroniza los monitores asociados a la neurona seleccionada.
   */
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

  /**
   * Renderiza la imagen del gráfico legacy si corresponde.
   */
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

  /**
   * (Legacy) Llama a generateSpikeGraph si hay datos de spikes y la pestaña monitor está activa.
   */
  useEffect(() => {
    if (activeTab === 'monitor' && neuron.hasMonitor) {
      const spikeData = monitorAttributes.find(attr => attr.variables.includes('spike'))?.data;
      if (spikeData) {
        //generateSpikeGraph('spikeGraphCanvas', spikeData);
      }
    }
  }, [activeTab, neuron, monitorAttributes]);

  /**
   * Genera y actualiza los gráficos de monitorización según la variable seleccionada y el rango de tiempo.
   */
  useEffect(() => {
    if (activeTab === 'monitor' && neuron.hasMonitor && variablesData.length > 0) {
      const monitorId = monitorAttributes[0]?.id;
      const variable = selectedOptions[0]; 
      if (monitorId && variable) {
        let monitorDatum = null;
        if (variable === 'raster_plot') {
          // Si hay spikes, usar spikes; si no, buscar raster_plot
          monitorDatum = variablesData.find(
            data => data.monitorId === monitorId && data.variable === 'spike'
          );
          if (!monitorDatum) {
            monitorDatum = variablesData.find(
              data => data.monitorId === monitorId && data.variable === 'raster_plot'
            );
          }
        } else {
          monitorDatum = variablesData.find(
            data => data.monitorId === monitorId && data.variable === variable
          );
        }
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

  /**
   * Actualiza el tiempo final del slider cuando se activa la pestaña monitor.
   */
  useEffect(() => {
    if (activeTab === 'monitor') {
      setEndTime(lastSimTime); // Actualizar endTime con el valor de lastSimTime cuando se muestre el gráfico
    }
  }, [activeTab, lastSimTime]); // Ejecutar este efecto cuando activeTab o lastSimTime cambien

  /**
   * Limpia los gráficos cuando cambia la variable seleccionada o la pestaña activa.
   */
  useEffect(() => {
    if (activeTab === 'monitor') {
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

  /** Maneja el cambio del nombre de la población neuronal. */
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  /** Maneja el cambio del tipo de neurona. */
  const handleTipoChange = (e) => {
    setTipo(e.target.value);
  };

  /** Maneja el cambio de la ecuación de la neurona. */
  const handleEquationChange = (e) => {
    setEquations(e.target.value);
  };

  /** Maneja el cambio de los parámetros de la neurona. */
  const handleParameterChange = (index, field, value) => {
    const newParameters = [...parameters];
    newParameters[index][field] = value;
    setParameters(newParameters);
  };

  // Eliminado handleFunctionChange

  /** Maneja el cambio del campo spike. */
  const handleSpikeChange = (e) => {
    setSpike(e.target.value);
  };

  /** Maneja el cambio del campo axon_spike. */
  const handleAxonSpikeChange = (e) => {
    setAxonSpike(e.target.value);
  };

  /** Maneja el cambio del campo reset. */
  const handleResetChange = (e) => {
    setReset(e.target.value);
  };

  /** Maneja el cambio del campo axon_reset. */
  const handleAxonResetChange = (e) => {
    setAxonReset(e.target.value);
  };

  /** Maneja el cambio del campo refractory. */
  const handleRefractoryChange = (e) => {
    setRefractory(e.target.value);
  };

  /** Maneja el cambio del campo firingRate. */
  const handleFiringRateChange = (e) => {
    setFiringRate(e.target.value);
  };

  /** Maneja el cambio de la cantidad de neuronas. */
  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  /** Maneja el cambio de los atributos de los monitores. */
  const handleMonitorAttributeChange = (index, field, value) => {
    const newMonitorAttributes = [...monitorAttributes];
    newMonitorAttributes[index] = {
      ...newMonitorAttributes[index],
      [field]: value
    };
    setMonitorAttributes(newMonitorAttributes);
  };

  /** Maneja el cambio del rango inicial de neuronas para el gráfico. */
  const handleRangeStartChange = (e) => {
    setRangeStart(e.target.value);
  };

  /** Maneja el cambio del rango final de neuronas para el gráfico. */
  const handleRangeEndChange = (e) => {
    setRangeEnd(e.target.value);
  };

  /** Maneja el cambio de la(s) variable(s) seleccionada(s) para monitorización. */
  const handleOptionChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedOptions(selectedValues); // Actualizar el estado con las opciones seleccionadas

    const updatedMonitorAttributes = monitorAttributes.map((monitor, index) => {
      if (index === 0) { 
        return {
          ...monitor,
          variables: selectedValues,
        };
      }
      return monitor;
    });
    setMonitorAttributes(updatedMonitorAttributes);
  };

  /** Agrega un nuevo parámetro a la lista de parámetros. */
  const addParameter = () => {
    setParameters([...parameters, { name: '', value: '' }]);
  };

  /** Elimina un parámetro de la lista de parámetros. */
  const removeParameter = (index) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };


  /**
   * Guarda los cambios realizados en la población neuronal y sus monitores.
   * Filtra parámetros vacíos y actualiza el estado global.
   */
  const handleSave = () => {
    
    // Filtrar parámetros vacíos antes de guardar
    const filteredParameters = parameters.filter(param => param.name && param.name.trim() !== "");
    const updatedNeuron = {
      ...neuron,
      name: name || neuron.name,
      quantity,
      attributes: {
        ...neuron.attributes,
        tipo,
        equations,
        parameters: filteredParameters.reduce((acc, param) => {
          acc[param.name] = param.value;
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
    setParameters(filteredParameters); 
    
    const updatedMonitors = monitorAttributes.map(monitor => ({
      id: monitor.id,
      populationId: neuron.id,
      target: monitor.target,
      variables: monitor.variables
    }));

    onSave(updatedNeuron, updatedMonitors);
  };

  /**
   * Activa o desactiva el monitor para la población neuronal.
   * Si se activa, crea un monitor; si se desactiva, lo elimina.
   */
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
        {neuron.id !== undefined && (
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
        )}
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
            {neuron.id !== undefined && (
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
            )}
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
                    size={neuron.variablesMonitor.length > 4 ? neuron.variablesMonitor.length : 4}
                    style={{ minHeight: '80px', maxHeight: '200px', width: '220px' }}
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
            {/* Mostrar las casillas de rango solo si hay gráfico visible y datos*/}
            {monitorAttributes.some((monitor) => {
              const variable = selectedOptions[0];
              return selectedOptions.length === 1 && monitor.variables.includes(variable) && variablesData.some(data => data.monitorId === monitor.id && data.variable === variable);
            }) && (
              <div className="input-group">
                <label htmlFor="rangeStart">Range Start:</label>
                <input
                  type="number"
                  id="rangeStart"
                  value={rangeStart}
                  onChange={handleRangeStartChange}
                  style={{ width: '80px' }}
                />
                <label htmlFor="rangeEnd">Range End:</label>
                <input
                  type="number"
                  id="rangeEnd"
                  value={rangeEnd}
                  onChange={handleRangeEndChange}
                  style={{ width: '80px' }}
                />
              </div>
            )}
          </div>

          <div className="monitor-graphics">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              {/* Mostrar el botón de show labels solo si hay gráfico visible y datos*/}
              {monitorAttributes.some((monitor) => {
                const variable = selectedOptions[0];
                return selectedOptions.length === 1 && monitor.variables.includes(variable) && variablesData.some(data => data.monitorId === monitor.id && data.variable === variable);
              }) && (
                <button
                  className="toggle-labels"
                  onClick={() => setShowLabels((prev) => !prev)}
                >
                  {showLabels ? 'Hide labels' : 'Show labels'}
                </button>
              )}
              {/* Botón de descarga , solo si hay un gráfico visible y datos */}
              {monitorAttributes.some((monitor) => {
                const variable = selectedOptions[0];
                return selectedOptions.length === 1 && monitor.variables.includes(variable) && variablesData.some(data => data.monitorId === monitor.id && data.variable === variable);
              }) && (
                <button
                  onClick={() => {
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
                            const margin = 32; // margen en píxeles
                            const tempCanvas = document.createElement('canvas');
                            tempCanvas.width = canvas.width + margin * 2;
                            tempCanvas.height = canvas.height + margin * 2;
                            const ctx = tempCanvas.getContext('2d');
                            ctx.fillStyle = '#fff';
                            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
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

export default ConfigPanelNeuron;
