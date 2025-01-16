import React, { useState } from 'react';
import axios from 'axios';

let code = '';
let simulationTime = 1000; // Valor predeterminado

/**
 * Obtiene las neuronas del lienzo.
 * @param {Array} items - Lista de elementos en el lienzo.
 * @returns {Array} - Lista de neuronas.
 */
export function getNeurons(items) {
  return items.filter(item => item.type === 'Población neuronal').map(neuron => ({
    id: neuron.id,
    name: neuron.name,
    quantity: neuron.quantity,
    equation: neuron.attributes.equations,
    parameters: neuron.attributes.parameters,
    attributes: neuron.attributes
  }));
}

/**
 * Obtiene las sinapsis del lienzo.
 * @param {Array} connections - Lista de conexiones en el lienzo.
 * @param {Array} items - Lista de elementos en el lienzo.
 * @returns {Array} - Lista de sinapsis.
 */
export function getSynapses(connections) {
  return connections.map(connection => ({
    id: connection.id,
    origen: connection.origen,
    destino: connection.destino,
    attributes: connection.attributes
  }));
}

/**
 * Obtiene el listado de items desde el Lienzo.
 * @param {Array} items - Lista de elementos en el lienzo.
 * @returns {Array} - Listado de items.
 */
export function getItemsFromLienzo(items) {
  return items;
}

/**
 * Asegura que no haya espacios en los nombres y los reemplace con un guion bajo.
 * @param {string} name - Nombre a procesar.
 * @returns {string} - Nombre procesado.
 */
export function formatName(name) {
  return name ? name.replace(/\s+/g, '_') : ''; // Verificar que name no sea undefined o null
}

/**
 * Genera el código ANNarchy para las neuronas.
 * @param {Array} neurons - Lista de neuronas.
 * @returns {string} - Código ANNarchy para las neuronas.
 */
export function generateNeuronCode(neurons) {
  const uniqueNeurons = [];
  const uniqueNeuronNames = new Set();

  neurons.forEach(neuron => {
    if (!uniqueNeuronNames.has(neuron.name)) {
      uniqueNeurons.push(neuron);
      uniqueNeuronNames.add(neuron.name);
    }
  });

  return uniqueNeurons.map(neuron => {
    const formattedName = formatName(neuron.name);
    const params = Object.entries(neuron.parameters).map(([key, value]) => `\t\t${key}=${value}`).join(',\n');
    const equations = `\t\t${neuron.equation}`;
    const attributes = [
      { key: 'spike', value: neuron.attributes.spike },
      { key: 'axon_spike', value: neuron.attributes.axon_spike },
      { key: 'reset', value: neuron.attributes.reset },
      { key: 'axon_reset', value: neuron.attributes.axon_reset },
      { key: 'refractory', value: neuron.attributes.refractory }
    ].filter(attr => attr.value !== '').map(attr => `\t${attr.key}="""\n\t\t${attr.value.replace(/\n/g, '\n\t\t')}\n\t"""`).join(',\n');
    return `${formattedName} = Neuron(\n\tequations="""\n${equations}\n\t""",\n\tparameters="""\n${params}\n\t""",\n${attributes}\n)`;
  }).join('\n\n');
}

/**
 * Genera el código ANNarchy para las sinapsis.
 * @param {Array} synapses - Lista de sinapsis.
 * @returns {string} - Código ANNarchy para las sinapsis.
 */
export function generateSynapseCode(synapses) {
  const uniqueSynapses = [];
  const uniqueSynapseNames = new Set();

  synapses.forEach(synapse => {
    if (!uniqueSynapseNames.has(synapse.attributes.name)) {
      uniqueSynapses.push(synapse);
      uniqueSynapseNames.add(synapse.attributes.name);
    }
  });

  return uniqueSynapses.map(synapse => {
    const formattedName = formatName(synapse.attributes.name);
    const params = Object.entries(synapse.attributes.parameters).map(([key, value]) => `\t\t${key}=${value}`).join(',\n');
    const attributes = [
      { key: 'equations', value: synapse.attributes.equations },
      { key: 'psp', value: synapse.attributes.psp },
      //{ key: 'operation', value: synapse.attributes.operation },
      { key: 'pre_spike', value: synapse.attributes.pre_spike },
      { key: 'post_spike', value: synapse.attributes.post_spike },
      { key: 'pre_axon_spike', value: synapse.attributes.pre_axon_spike },
      { key: 'functions', value: synapse.attributes.functions }
    ].filter(attr => attr.value !== '').map(attr => `\t${attr.key}="""\n\t\t${attr.value}\n\t"""`).join(',\n');
    return `${formattedName} = Synapse(\n\tparameters="""\n${params}\n\t""",\n${attributes}\n)`;
  }).join('\n\n');
}

/**
 * Genera el código ANNarchy para las poblaciones.
 * @param {Array} items - Lista de elementos en el lienzo.
 * @returns {string} - Código ANNarchy para las poblaciones.
 */
export function generatePopulationCode(items) {
  const populationNames = {};
  return items.map(item => {
    const baseName = formatName(item.name);
    const count = populationNames[baseName] || 0;
    populationNames[baseName] = count + 1;
    const populationName = `${baseName}${count + 1}`;
    return `${populationName} = Population(name='${populationName}', geometry=${item.quantity}, neuron=${baseName})`;
  }).join('\n\n');
}

/**
 * Genera el código ANNarchy para las proyecciones.
 * @param {Array} connections - Lista de conexiones en el lienzo.
 * @param {Array} items - Lista de elementos en el lienzo.
 * @returns {string} - Código ANNarchy para las proyecciones.
 */
export function generateProjectionCode(connections, items) {
  const populationNames = items.reduce((acc, item) => {
    const baseName = formatName(item.name);
    const count = acc[baseName] || 0;
    acc[baseName] = count + 1;
    const populationName = `${baseName}${count + 1}`;
    acc[item.id] = populationName;
    return acc;
  }, {});

  return connections.map((connection, index) => {
    const origenPopulation = populationNames[connection.origen];
    const destinoPopulation = populationNames[connection.destino];
    const projectionName = `proj${index + 1}`;
    const synapseModel = formatName(connection.attributes.name);
    const connectFunction = connection.connections.rule === 'one_to_one' ? 'connect_one_to_one' : 'connect_all_to_all';
    //return `${projectionName} = Projection(pre=${origenPopulation}, post=${destinoPopulation}, synapse=${synapseModel}, target='${connection.connections.target}')\n${projectionName}.${connectFunction}(weights=${connection.connections.weights}, delays=${connection.connections.delays})`;

    return `${projectionName} = Projection(pre=${origenPopulation}, post=${destinoPopulation}, target='${connection.connections.target}')\n${projectionName}.${connectFunction}(weights=${connection.connections.weights}, delays=${connection.connections.delays})`;
  }).join('\n\n');
}

/**
 * Obtiene los monitores del lienzo.
 * @param {Array} monitors - Lista de monitores.
 * @returns {Array} - Lista de monitores.
 */
export function getMonitorsFromLienzo(monitors) {
  return (monitors || []).map(monitor => ({
    id: monitor.id,
    populationId: monitor.populationId,
    target: monitor.target,
    variables: monitor.variables
  }));
}

/**
 * Genera el código ANNarchy para los monitores.
 * @param {Array} monitors - Lista de monitores.
 * @param {Array} items - Lista de elementos en el lienzo.
 * @returns {string} - Código ANNarchy para los monitores.
 */
export function generateMonitorCode(monitors, items) {
  const populationNames = items.reduce((acc, item) => {
    const baseName = formatName(item.name);
    const count = acc[baseName] || 0;
    acc[baseName] = count + 1;
    const populationName = `${baseName}${count + 1}`;
    acc[item.id] = populationName;
    return acc;
  }, {});

  return (monitors || []).map((monitor, index) => {
    const populationName = populationNames[monitor.populationId];
    const monitorName = `monitor${index + 1}`;
    const variables = monitor.variables.join(', ');
    return `${monitorName} = Monitor(${populationName}, ['${variables}'])`;
  }).join('\n\n');
}

/**
 * Traduce el listado de items en neuronas y sinapsis estilo ANNarchy y lo pone en code.
 * @param {Array} items - Lista de elementos en el lienzo.
 * @param {Array} connections - Lista de conexiones en el lienzo.
 * @param {Array} monitors - Lista de monitores en el lienzo.
 */
export function generateANNarchyCode(items, connections, monitors, simTime = 1000) {
  simulationTime = simTime; // Actualizar el tiempo de simulación
  const neurons = getNeurons(items);
  const synapses = getSynapses(connections);
  const monitorList = getMonitorsFromLienzo(monitors);

  const neuronCode = generateNeuronCode(neurons);
  //const synapseCode = generateSynapseCode(synapses);
  const populationCode = generatePopulationCode(items);
  const projectionCode = generateProjectionCode(connections, items);
  const monitorCode = generateMonitorCode(monitorList, items);

  code = `from ANNarchy import *\n\n${neuronCode}\n\n${populationCode}\n\n${projectionCode}\n\n${monitorCode}\n\ncompile()\n\nsimulate(${simulationTime})`;
  return code;
}

/**
 * Envía el código al backend y recibe los resultados.
 * @param {string} code - Código a enviar al backend.
 * @returns {Promise<string>} - ID del trabajo (UUID).
 */
export async function sendCodeToBackend(code) {
  try {
    const response = await fetch('http://localhost:5000/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Respuesta del backend:', result);
    return result.job_id; // Ahora es una cadena UUID
  } catch (error) {
    console.error('Error al enviar el código al backend:', error);
    throw error;
  }
}

/**
 * Obtiene el estado del trabajo desde el backend.
 * @param {string} jobId - ID del trabajo (UUID).
 * @returns {Promise<object>} - Resultado del trabajo.
 */
export async function getJobStatus(jobId) {
  try {
    const response = await fetch(`http://localhost:5000/status/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();
    return result; // Ajustar según la estructura de la respuesta del backend
  } catch (error) {
    console.error('Error al obtener el estado del trabajo desde el backend:', error);
    throw error;
  }
}

/**
 * Procesa los resultados de los monitores para su visualización.
 * @param {object} monitors - Resultados de los monitores.
 * @returns {string} - Resultados formateados de los monitores.
 */
export function processMonitorResults(monitors) {
  let monitorData = 'Resultados de los Monitores:\n';
  for (const [monitorId, monitorResult] of Object.entries(monitors)) {
    monitorData += `${monitorId}: ${monitorResult}\n`;
  }
  return monitorData;
}

/**
 * Descarga el código generado como un archivo .py.
 * @param {string} code - Código a descargar.
 */
export function downloadCodeAsFile(code) {
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'generated_code.py';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Descarga los resultados de los monitores como un archivo .txt.
 * @param {object} monitors - Resultados de los monitores.
 */
export function downloadMonitorResults(monitors) {
  const monitorData = processMonitorResults(monitors);
  const blob = new Blob([monitorData], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'monitor_results.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const CodeGenerator = ({ items, connections, monitors, simulationTime }) => {
  const [simulationOutput, setSimulationOutput] = useState('');

  const handleGenerateCode = async () => {
    const itemsList = getItemsFromLienzo(items);
    const monitorsList = getMonitorsFromLienzo(monitors);

    const generatedCode = generateANNarchyCode(itemsList, connections, monitorsList, simulationTime);
    downloadCodeAsFile(generatedCode);

    try {
      const jobId = await sendCodeToBackend(generatedCode);
      console.log('ID del trabajo:', jobId);
      pollJobStatus(jobId);
    } catch (error) {
      console.error('Error al enviar el código al backend:', error);
      setSimulationOutput('Error al ejecutar la simulación.');
    }
  };

  const pollJobStatus = async (jobId) => {
    const pollInterval = 2000;
    const checkStatus = async () => {
      try {
        const result = await getJobStatus(jobId);
        const { status, error, output, monitors } = result;

        // Si está en progreso, en espera o hay error, seguir intentando
        console.log('Estado del trabajo:', result);
        if (status === 'En progreso' || status === 'En espera' || error) {
          setTimeout(checkStatus, pollInterval);
        } else if (status === '404 (NOT FOUND)') {
          setSimulationOutput('Error al ejecutar la simulación.');
        } else {
          // Mostrar resultado final
          let finalOutput = output || error || status || 'Simulación completada.';
          if (monitors) {
            finalOutput += '\n\n' + processMonitorResults(monitors);
            downloadMonitorResults(monitors); // Descargar resultados de los monitores
          }
          setSimulationOutput(finalOutput);
        }
      } catch (e) {
        if (e.message.includes('404')) {
          setSimulationOutput('Error 404 al ejecutar la simulación.');
          return;
        }
        // Si hubo error de conexión, seguir intentando
        setTimeout(checkStatus, pollInterval);
      }
    };
    checkStatus();
  };

  return (
    <div>
      <button onClick={handleGenerateCode}>Generar Código</button>
      {simulationOutput && (
        <div>
          <h3>Resultado de la Simulación:</h3>
          <pre>{simulationOutput}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeGenerator;