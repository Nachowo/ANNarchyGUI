import React, { useState, useEffect } from 'react';
import './ContextMenu.css';

function ContextMenu({ x, y, item, tipo, onEdit, onClose, onDelete }) {
  const [attributes, setAttributes] = useState({});
  const [neuron, setNeuron] = useState({});
  const [quantity, setQuantity] = useState('');
  const [monitorType, setMonitorType] = useState('');
  const [stimulusType, setStimulusType] = useState('');
  const [synapse, setSynapse] = useState({});
  const [regla, setRegla] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Actualiza los atributos cuando cambia el elemento seleccionado
  useEffect(() => {
    console.log('Item actualizado:', item); // Imprime el item en la consola para depurar
    if (item) {
      setAttributes(item.attributes || {});
      setNeuron(item.neuron || {});
      setQuantity(item.quantity || '');
      setMonitorType(item.attributes?.monitorType || '');
      setStimulusType(item.attributes?.stimulusType || '');
      setSynapse(item.synapse || {});
      setRegla(item.attributes?.regla || '');
    }
  }, [item]);

  // Maneja el cambio de atributos
  const handleEditChange = (e, attr) => {
    setAttributes({
      ...attributes,
      [attr]: e.target.value,
    });
  };

  // Maneja el cambio de los atributos del modelo de neurona
  const handleNeuronChange = (e, field) => {
    setNeuron({
      ...neuron,
      [field]: e.target.value,
    });
  };

  // Maneja el cambio de los parámetros y variables del modelo de neurona
  const handleNeuronParamChange = (e, field) => {
    setNeuron({
      ...neuron,
      parameters: {
        ...neuron.parameters,
        [field]: e.target.value,
      },
    });
  };

  const handleNeuronVarChange = (e, field) => {
    setNeuron({
      ...neuron,
      variables: {
        ...neuron.variables,
        [field]: e.target.value,
      },
    });
  };

  // Maneja el cambio de los atributos del modelo de sinapsis
  const handleSynapseChange = (e, field) => {
    setSynapse({
      ...synapse,
      [field]: e.target.value,
    });
  };

  // Maneja el cambio de los parámetros y variables del modelo de sinapsis
  const handleSynapseParamChange = (e, field) => {
    setSynapse({
      ...synapse,
      parameters: {
        ...synapse.parameters,
        [field]: e.target.value,
      },
    });
  };

  const handleSynapseVarChange = (e, field) => {
    setSynapse({
      ...synapse,
      variables: {
        ...synapse.variables,
        [field]: e.target.value,
      },
    });
  };

  // Guarda los cambios en los atributos
  const handleSave = (e) => {
    e.stopPropagation(); 
    onEdit(item.id, { ...attributes, name: synapse.name, quantity, neuron, synapse, regla }); 
  };

  // Renderiza el contenido del menú basado en el tipo
  const renderMenuContent = () => {
    switch (tipo) {
      case 1:
        return (
          <li>
            <div>
              <label>Nombre:</label>
              <input
                type="text"
                value={attributes.name || ''}
                onChange={(e) => handleEditChange(e, 'name')}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <label>Cantidad:</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <label>Ecuación:</label>
              <input
                type="text"
                value={neuron.equation || ''}
                onChange={(e) => handleNeuronChange(e, 'equation')}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <label>Parámetros:</label>
              <input
                type="text"
                value={neuron.parameters?.tau || ''}
                onChange={(e) => handleNeuronParamChange(e, 'tau')}
                onClick={(e) => e.stopPropagation()}
              />
              <input
                type="text"
                value={neuron.parameters?.I || ''}
                onChange={(e) => handleNeuronParamChange(e, 'I')}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <label>Variables:</label>
              <input
                type="text"
                value={neuron.variables?.v || ''}
                onChange={(e) => handleNeuronVarChange(e, 'v')}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {Object.keys(attributes).map((attr) => (
              attr !== 'name' && attr !== 'quantity' && (
                <div key={attr}>
                  <label>{attr}:</label>
                  <input
                    type="text"
                    value={attributes[attr]}
                    onChange={(e) => handleEditChange(e, attr)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )
            ))}
            <button onClick={handleSave}>Guardar</button>
          </li>
        );
      case 2:
        return (
          <li>
            <div>
              <label>Tipo de Monitor:</label>
              <select
                value={monitorType}
                onChange={(e) => setMonitorType(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="spikes">Spikes</option>
                <option value="firingRate">Firing Rate</option>
                <option value="membranePotential">Potencial de Membrana</option>
              </select>
            </div>
            {monitorType === 'membranePotential' && (
              <>
                <div>
                  <label>Intervalo:</label>
                  <input
                    type="number"
                    value={attributes.intervalo || ''}
                    onChange={(e) => handleEditChange(e, 'intervalo')}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div>
                  <label>Variable:</label>
                  <input
                    type="text"
                    value={attributes.variable || ''}
                    onChange={(e) => handleEditChange(e, 'variable')}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </>
            )}
            <button onClick={handleSave}>Guardar</button>
          </li>
        );
      case 3:
        return (
          <li>
            <div>
              <label>Tipo de Estímulo:</label>
              <select
                value={stimulusType}
                onChange={(e) => setStimulusType(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="constant">Constante</option>
                <option value="sinusoidal">Sinuoidal</option>
                <option value="noise">Ruido</option>
              </select>
            </div>
            {stimulusType === 'constant' && (
              <>
                <div>
                  <label>Amplitud:</label>
                  <input
                    type="number"
                    value={attributes.amplitud || ''}
                    onChange={(e) => handleEditChange(e, 'amplitud')}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div>
                  <label>Duración:</label>
                  <input
                    type="number"
                    value={attributes.duracion || ''}
                    onChange={(e) => handleEditChange(e, 'duracion')}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </>
            )}
            {stimulusType === 'sinusoidal' && (
              <>
                <div>
                  <label>Amplitud:</label>
                  <input
                    type="number"
                    value={attributes.amplitud || ''}
                    onChange={(e) => handleEditChange(e, 'amplitud')}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div>
                  <label>Frecuencia:</label>
                  <input
                    type="number"
                    value={attributes.frecuencia || ''}
                    onChange={(e) => handleEditChange(e, 'frecuencia')}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div>
                  <label>Duración:</label>
                  <input
                    type="number"
                    value={attributes.duracion || ''}
                    onChange={(e) => handleEditChange(e, 'duracion')}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </>
            )}
            {stimulusType === 'noise' && (
              <>
                <div>
                  <label>Media:</label>
                  <input
                    type="number"
                    value={attributes.media || ''}
                    onChange={(e) => handleEditChange(e, 'media')}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div>
                  <label>Desviación Estándar:</label>
                  <input
                    type="number"
                    value={attributes.desviacionEstandar || ''}
                    onChange={(e) => handleEditChange(e, 'desviacionEstandar')}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div>
                  <label>Duración:</label>
                  <input
                    type="number"
                    value={attributes.duracion || ''}
                    onChange={(e) => handleEditChange(e, 'duracion')}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </>
            )}
            <button onClick={handleSave}>Guardar</button>
          </li>
        );
      case 4:
        return (
          <div className="context-menu-content">
            {/* Sección 1: Origen, Destino y Tipo de Conexión */}
            <div>
              <label>Origen:</label>
              <input
                type="text"
                value={attributes.origen || ''}
                onChange={(e) => handleEditChange(e, 'origen')}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <label>Destino:</label>
              <input
                type="text"
                value={attributes.destino || ''}
                onChange={(e) => handleEditChange(e, 'destino')}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <label>Tipo de Conexión:</label>
              <select
                value={attributes.tipoConexion || ''}
                onChange={(e) => handleEditChange(e, 'tipoConexion')}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="Excitatoria">Excitatoria</option>
                <option value="Inhibitoria">Inhibitoria</option>
              </select>
            </div>

            {/* Sección 2: Peso, Delay y Regla */}
            <div>
              <label>Peso:</label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.01"
                value={attributes.weight || 0}
                onChange={(e) => handleEditChange(e, 'weight')}
                onClick={(e) => e.stopPropagation()}
              />
              <span>{attributes.weight || 0}</span>
            </div>
            <div>
              <label>Delay:</label>
              <input
                type="number"
                value={attributes.delay || ''}
                onChange={(e) => handleEditChange(e, 'delay')}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <label>Regla:</label>
              <select
                value={regla}
                onChange={(e) => setRegla(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="oneToOne">One to One</option>
                <option value="allToAll">All to All</option>
                <option value="fixedProbability">Probabilidad Arreglada</option>
                <option value="random">Random</option>
              </select>
            </div>
            {regla === 'fixedProbability' && (
              <div>
                <label>Probabilidad (p):</label>
                <input
                  type="number"
                  value={attributes.probabilidad || ''}
                  onChange={(e) => handleEditChange(e, 'probabilidad')}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Sección 3: Avanzada */}
            <div>
              <button onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? 'Ocultar Avanzado' : 'Mostrar Avanzado'}
              </button>
              {showAdvanced && (
                <>
                  <div>
                    <label>Ecuación:</label>
                    <input
                      type="text"
                      value={synapse.equation || ''}
                      onChange={(e) => handleSynapseChange(e, 'equation')}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div>
                    <label>Tipo de Plasticidad:</label>
                    <input
                      type="text"
                      value={synapse.plasticity || ''}
                      onChange={(e) => handleSynapseChange(e, 'plasticity')}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </>
              )}
            </div>
            <button onClick={handleSave}>Guardar</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="context-menu-container">
      <div className="context-menu-header">
        <span className="close" onClick={onClose}>&times;</span>
      </div>
      <div className="context-menu-body">
        {renderMenuContent()}
      </div>
      <div className="context-menu-footer">
        <button onClick={onDelete}>Eliminar</button>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

export default ContextMenu;