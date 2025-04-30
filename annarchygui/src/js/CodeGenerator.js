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
  return `  Monitor(${populationName}, ${monitor.variables.length > 1 ? `[${monitor.variables.map(v => `'${v}'`).join(', ')}]` : `'${monitor.variables[0]}'`})`;
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
import base64
import matplotlib.pyplot as plt
from io import BytesIO

monitor_results = {}

for i in range(len(monitorsArreglo)):
  monitor = monitorsArreglo[i]
  monitorId = monitor['id']
  populationId = monitor['populationId']
  variables = monitor['variables']
  results = {}
  graphs = {}

  for variable in variables:
    # Extraer los resultados del monitor para cada variable
    try:
      print(f"Obteniendo resultados para monitor {monitorId} y variable {variable}")
      data = monitors[i].get(variable)  # Obtener los datos del monitor
      if variable == 'spike':
        graf = monitors[i].histogram(data)

        # Generar gráfico y codificarlo en base64
        plt.figure()
        plt.plot(graf)
        plt.title(f"Monitor {monitorId} - Variable {variable}")
        plt.xlabel("Tiempo")
        plt.ylabel("Frecuencia")
        buffer = BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        graphs[variable] = base64.b64encode(buffer.read()).decode('utf-8')
        buffer.close()
        plt.close()


      if hasattr(data, 'tolist'):  # Verificar si es un ndarray
        results[variable] = data.tolist()  # Convertir a lista si es necesario
      else:
        results[variable] = data  # Asignar directamente si no es ndarray

    except Exception as e:
      results[variable] = f"Error al obtener resultados: {str(e)}"

  # Guardar los resultados junto con el ID de la población
  monitor_results[populationId] = {
    'monitorId': monitorId,
    'results': results,
    'graphs': graphs  # Incluir gráficos en los resultados
  }

# Imprimir los resultados finales en pantalla
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
export function generateANNarchyCode(items, connections, monitors, simTime ) {
  simulationTime = simTime; // Actualizar el tiempo de simulación
  const neurons = getNeurons(items);
  const synapses = getSynapses(connections);
  const monitorList = getMonitorsFromLienzo(monitors);

  const neuronCode = generateNeuronCode(neurons);
  //const synapseCode = generateSynapseCode(synapses);
  const populationCode = generatePopulationCode(items);
  const projectionCode = generateProjectionCode(connections, items);
  const monitorCode = writeMonitors(monitorList, items);
  const monitorsCreated  = createMonitorsCode(monitors, items);
  const monitorHandlingCode = generateMonitorHandlingCode(monitorList, '${job_id}'); // Añadir manejo de monitores

  code = `from ANNarchy import *

#Neuronal models
${neuronCode}

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

const CodeGenerator = ({ items, connections, monitors, simulationTime }) => {
  const [simulationOutput, setSimulationOutput] = useState('');



  const pollJobStatus = async (jobId) => {
    const pollInterval = 2000;
    const checkStatus = async () => {
      try {
        const result = await getJobStatus(jobId);
        const { status, error, output, monitors } = result;

        // Si está en progreso, en espera o hay error, seguir intentando
        if (status === 'En progreso' || status === 'En espera' || error) {
          setTimeout(checkStatus, pollInterval);
        } else if (status === '404 (NOT FOUND)') {
          setSimulationOutput('Error al ejecutar la simulación.');
        } else {
          // Mostrar resultado final
          let finalOutput = output || error || status || 'Simulación completada.';
          if (monitors) {
            finalOutput += '\\n\\n' + processMonitorResults(monitors);
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

  return ;
};

export default CodeGenerator;