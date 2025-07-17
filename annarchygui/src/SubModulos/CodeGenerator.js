import React, { useState } from 'react';
import axios from 'axios';

let code = '';
let simulationTime = 100; // Valor predeterminado

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
  // Reemplaza espacios y guiones por guion bajo
  return name ? name.replace(/[\s-]+/g, '_') : ''; // Verificar que name no sea undefined o null
}

/**
 * Genera el código ANNarchy para las neuronas.
 * @param {Array} neurons - Lista de neuronas.
 * @returns {string} - Código ANNarchy para las neuronas.
 */
export function generateNeuronCode(neurons) {
  // Agrupar por tipo y parámetros/equations únicos
  const neuronDefs = [];
  const neuronHashes = new Set();

  neurons.forEach(neuron => {
    // Crear un hash único por tipo, equations, parámetros y funciones
    const hash = JSON.stringify({
      tipo: neuron.attributes.tipo,
      equations: neuron.equation,
      parameters: neuron.parameters,
      functions: neuron.attributes.functions,
      spike: neuron.attributes.spike,
      axon_spike: neuron.attributes.axon_spike,
      reset: neuron.attributes.reset,
      axon_reset: neuron.attributes.axon_reset,
      refractory: neuron.attributes.refractory,
      firingRate: neuron.attributes.firingRate
    });
    if (!neuronHashes.has(hash)) {
      neuronDefs.push({ ...neuron, hash });
      neuronHashes.add(hash);
    }
  });

  // Genera el string de definiciones de neuronas únicas
  return neuronDefs.map((neuron, idx) => {
    // Si es una neurona de Poisson, no generar modelo ANNarchy, solo retornar string vacío
    if (
      neuron.name.toLowerCase().includes('poisson') ||
      (neuron.attributes.tipo && neuron.attributes.tipo.toLowerCase().includes('poisson'))
    ) {
      return '';
    }
    let prevCode = '';
    if (Array.isArray(neuron.attributes.prev)) {
      prevCode = neuron.attributes.prev.join('\n') + '\n';
    } else if (neuron.attributes.extra && typeof neuron.attributes.extra === 'string') {
      prevCode = neuron.attributes.extra + '\n';
    }
    // Nombre único para cada definición
    const formattedName = formatName(neuron.name) + '_def' + (idx + 1);
    const params = Object.entries(neuron.parameters).map(([key, value]) => `\t\t${key}=${value}`).join(',\n');
    const equations = `\t\t${neuron.equation}`;
    const attributesArr = [
      { key: 'spike', value: neuron.attributes.spike },
      { key: 'axon_spike', value: neuron.attributes.axon_spike },
      { key: 'reset', value: neuron.attributes.reset },
    ].filter(attr => attr.value !== '');
    const attributes = attributesArr.map(attr => {
      if (attr.key === 'spike' || attr.key === 'axon_spike') {
        return `\t${attr.key} = \"${attr.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}\"`;
      } else {
        return `\t${attr.key} = \"\"\"\n\t\t${attr.value.replace(/\n/g, '\n\t\t')}\n\t\"\"\"`;
      }
    }).join(',\n');
    const extrasArr = [
      { key: 'refractory', value: neuron.attributes.refractory },
      { key: 'axon_reset', value: neuron.attributes.axon_reset },
    ].filter(extra => extra.value !== '');
    const extras = extrasArr.map(extra => `\t${extra.key}=${extra.value}`).join(',\n');

    let args = [];
    args.push(`equations=\"\"\"\n${equations}\n  \"\"\"`);
    args.push(`parameters=\"\"\"\n${params}\n  \"\"\"`);
    if (attributes) args.push(attributes);
    if (extras) args.push(extras);

    return `${prevCode}${formattedName} = Neuron(\n  ${args.join(',\n  ')}\n)`;
  }).filter(Boolean).join('\n\n');
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
  // Mapear poblaciones a la definición de neurona correspondiente
  const populationNames = {};
  // Crear hashes de definiciones de neurona
  const neuronDefs = [];
  const neuronHashes = [];
  items.forEach(item => {
    if (item.type === 'Población neuronal') {
      const hash = JSON.stringify({
        tipo: item.attributes.tipo,
        equations: item.attributes.equations,
        parameters: item.attributes.parameters,
        functions: item.attributes.functions,
        spike: item.attributes.spike,
        axon_spike: item.attributes.axon_spike,
        reset: item.attributes.reset,
        axon_reset: item.attributes.axon_reset,
        refractory: item.attributes.refractory,
        firingRate: item.attributes.firingRate
      });
      neuronHashes.push(hash);
      neuronDefs.push({ hash, name: item.name });
    }
  });
  return items.map((item, idx) => {
    const baseName = formatName(item.name);
    const count = populationNames[baseName] || 0;
    populationNames[baseName] = count + 1;
    const populationName = `${baseName}${count + 1}`;
    // Si es una población de Poisson, usar PoissonPopulation
    if (
      item.name.toLowerCase().includes('poisson') ||
      (item.attributes && item.attributes.tipo && item.attributes.tipo.toLowerCase().includes('poisson'))
    ) {
      const quantity = item.quantity || 100;
      const rate = (item.attributes && item.attributes.parameters && item.attributes.parameters.rate) ? item.attributes.parameters.rate : 30.0;
      return `${populationName} = PoissonPopulation(${quantity}, rates=${rate})`;
    }
    // Buscar el índice de la definición de neurona correspondiente
    const hash = JSON.stringify({
      tipo: item.attributes.tipo,
      equations: item.attributes.equations,
      parameters: item.attributes.parameters,
      functions: item.attributes.functions,
      spike: item.attributes.spike,
      axon_spike: item.attributes.axon_spike,
      reset: item.attributes.reset,
      axon_reset: item.attributes.axon_reset,
      refractory: item.attributes.refractory,
      firingRate: item.attributes.firingRate
    });
    const defIdx = neuronHashes.findIndex(h => h === hash);
    const neuronDefName = `${baseName}_def${defIdx + 1}`;
    return `${populationName} = Population(name='${populationName}', geometry=${item.quantity}, neuron=${neuronDefName})`;
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
    return `${projectionName} = Projection(pre=${origenPopulation}, post=${destinoPopulation}, synapse=${synapseModel}, target='${connection.connections.target}')\n${projectionName}.${connectFunction}(weights=${connection.connections.weights}, delays=${connection.connections.delays})`;

    //return `${projectionName} = Projection(pre=${origenPopulation}, post=${destinoPopulation}, target='${connection.connections.target}')\n${projectionName}.${connectFunction}(weights=${connection.connections.weights}, delays=${connection.connections.delays})`;
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
 * Genera un arreglo de monitores como estructuras para ANNarchy.
 * @param {Array} monitors - Lista de monitores.
 * @param {Array} items - Lista de elementos en el lienzo.
 * @returns {string} - Código ANNarchy que define un arreglo de monitores.
 */
export function writeMonitors(monitors, items) {
  const populationNames = items.reduce((acc, item) => {
    const baseName = formatName(item.name);
    const count = acc[baseName] || 0;
    acc[baseName] = count + 1;
    const populationName = `${baseName}${count + 1}`;
    acc[item.id] = populationName;
    return acc;
  }, {});

  const monitorsArray = (monitors || []).map((monitor, index) => {
    const populationName = populationNames[monitor.populationId];
    const variables = monitor.variables.map(v => `'${v}'`).join(', ');
    return `{
    'id': ${monitor.id},
    #'population': ${populationName},
    'populationId': '${monitor.populationId}',
    'variables': [${variables}]
  }`;
  }).join(',\n');

  return `monitorsArreglo = [\n${monitorsArray}\n]`;
}

function createMonitorsCode(monitors, items) {
  const populationNames = items.reduce((acc, item) => {
    const baseName = formatName(item.name);
    const count = acc[baseName] || 0;
    acc[baseName] = count + 1;
    const populationName = `${baseName}${count + 1}`;
    acc[item.id] = populationName;
    return acc;
  }, {});

  return `monitors = [
${(monitors || []).map((monitor, index) => {
  const populationName = populationNames[monitor.populationId];
  const variables = monitor.variables.map(v => v === 'raster_plot' ? 'spike' : v);
  return `  Monitor(${populationName}, ${variables.length > 1 ? `[${variables.map(v => `'${v}'`).join(', ')}]` : `'${variables[0]}'`})`;
}).join(',\n')}
]`;
}

/**
 * Genera el código ANNarchy para manejar los resultados de los monitores.
 * @param {Array} monitors - Lista de monitores.
 * @param {string} jobId - ID del trabajo para identificar los resultados.
 * @returns {string} - Código ANNarchy para manejar los resultados de los monitores y enviarlos a stdout.
 */
function generateMonitorHandlingCode(monitors, jobId) {
  return `
import json
monitor_results = {}

for i in range(len(monitorsArreglo)):
  monitor = monitorsArreglo[i]
  monitorId = monitor['id']
  populationId = monitor['populationId']
  variables = monitor['variables']
  results = {}
  for variable in variables:
    if variable == 'spike':
      data = monitors[i].get('spike')
      graf = monitors[i].histogram(data)
      results[variable] = {
        'data': data.tolist() if hasattr(data, 'tolist') else data,
        'histogram': graf.tolist() if hasattr(graf, 'tolist') else graf
      }
    elif variable == 'raster_plot':
      data = monitors[i].get('spike')
      t, n = monitors[i].raster_plot(data)
      results[variable] = {
        'data': data.tolist() if hasattr(data, 'tolist') else data,
        'raster': {
          't': t.tolist() if hasattr(t, 'tolist') else t,
          'n': n.tolist() if hasattr(n, 'tolist') else n
        }
      }
    else:
      data = monitors[i].get(variable)
      results[variable] = {
        'data': data.tolist() if hasattr(data, 'tolist') else data
      }
  monitor_results[populationId] = {
    'monitorId': monitorId,
    'results': results
  }

print(json.dumps(monitor_results, indent=2))
`;
}

/**
 * Traduce el listado de items en neuronas y sinapsis estilo ANNarchy y lo pone en code.
 * @param {Array} items - Lista de elementos en el lienzo.
 * @param {Array} connections - Lista de conexiones en el lienzo.
 * @param {Array} monitors - Lista de monitores en el lienzo.
 * @param {number} simTime - Tiempo de simulación.
 * @returns {string} - Código ANNarchy generado.
 */
export function generateANNarchyCode(items, connections, monitors, simTime, stepTime ) {
  simulationTime = simTime; // Actualizar el tiempo de simulación
  const neurons = getNeurons(items);
  const synapses = getSynapses(connections);
  const monitorList = getMonitorsFromLienzo(monitors);

  const neuronCode = generateNeuronCode(neurons);
  const synapseCode = generateSynapseCode(synapses);
  const populationCode = generatePopulationCode(items);
  const projectionCode = generateProjectionCode(connections, items);
  const monitorCode = writeMonitors(monitorList, items);
  const monitorsCreated  = createMonitorsCode(monitors, items);
  const monitorHandlingCode = generateMonitorHandlingCode(monitorList, '${job_id}'); // Añadir manejo de monitores

  code = `from ANNarchy import *

dt = ${stepTime} 
setup(dt=dt)

#Neuronal models
${neuronCode}

#Synaptic models
${synapseCode}

#Populations
${populationCode}

#Projections
${projectionCode}

#Monitors
${monitorCode}
${monitorsCreated}

compile()
simulate(${simulationTime})

${monitorHandlingCode}
`;
  return code;
}


export function generateANNarchyCodeUser(items, connections, monitors, simTime, stepTime ) {
  simulationTime = simTime; // Actualizar el tiempo de simulación
  const neurons = getNeurons(items);
  const synapses = getSynapses(connections);
  const monitorList = getMonitorsFromLienzo(monitors);

  const neuronCode = generateNeuronCode(neurons);
  const synapseCode = generateSynapseCode(synapses);
  const populationCode = generatePopulationCode(items);
  const projectionCode = generateProjectionCode(connections, items);
  const monitorCode = writeMonitors(monitorList, items);
  const monitorsCreated  = createMonitorsCode(monitors, items);

  code = `from ANNarchy import *

dt = ${stepTime}  
setup(dt=dt)

#Neuronal models
${neuronCode}

#Synaptic models
${synapseCode}

#Populations
${populationCode}

#Projections
${projectionCode}

#Monitors
${monitorCode}
${monitorsCreated}

compile()
simulate(${simulationTime})

`;
  return code;
}
/**
 * Envía el código al backend y recibe los resultados.
 * @param {string} code - Código a enviar al backend.
 * @returns {Promise<string>} - ID del trabajo (UUID).
 */
export async function sendCodeToBackend(code) {
  try {
    const backendHost = window.location.hostname;

    const response = await fetch(`http://${backendHost}:5000/simulate`, {
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
    const backendHost = window.location.hostname;
    const response = await fetch(`http://${backendHost}:5000/status/${jobId}`, {
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
  let monitorData = 'Resultados de los Monitores:\\n';
  for (const [monitorId, monitorResult] of Object.entries(monitors)) {
    monitorData += `${monitorId}: ${monitorResult}\\n`;
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

// Eliminado export default CodeGenerator y el componente, solo exportaciones nombradas