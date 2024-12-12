import React, { useState } from 'react';

let code = '';

/**
 * Obtiene las neuronas del lienzo.
 * @param {Array} items - Lista de elementos en el lienzo.
 * @returns {Array} - Lista de neuronas.
 */
export function getNeurons(items) {
  console.log('Items:', items);
  return items.filter(item => item.type === 'Población neuronal').map(neuron => ({
    id: neuron.id,
    name: neuron.name,
    quantity: neuron.quantity,
    equation: neuron.attributes.equations,
    parameters: neuron.attributes.parameters,
    variables: neuron.attributes.variables,
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
  console.log('Connections:', connections);
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
 * Obtiene el listado de conexiones desde el Lienzo y lo imprime en consola.
 * @param {Array} connections - Lista de conexiones en el lienzo.
 */
export function printConnections(connections) {
  console.log('Connections:', connections);
}

/**
 * Asegura que no haya espacios en los nombres y los reemplace con un guion.
 * @param {string} name - Nombre a procesar.
 * @returns {string} - Nombre procesado.
 */
export function formatName(name) {
  return name.replace(/\s+/g, '-');
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
    const vars = Object.entries(neuron.variables).map(([key, value]) => `\t\t${key}=${value}`).join(',\n');
    return `${formattedName} = Neuron(\n\tequations='${neuron.equation}',\n\tparameters="""\n${params}\n\t""",\n\tvariables="""\n${vars}\n\t"""\n)`;
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
    console.log('Synapse:', synapse);
    const formattedName = formatName(synapse.attributes.name);
    const params = Object.entries(synapse.attributes.parameters).map(([key, value]) => `\t\t${key}=${value}`).join(',\n');
    const attributes = [
      { key: 'equations', value: synapse.attributes.equations },
      { key: 'psp', value: synapse.attributes.psp },
      { key: 'operation', value: synapse.attributes.operation },
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
    return `${projectionName} = Projection(pre=${origenPopulation}, post=${destinoPopulation}, synapse=${synapseModel}, target='${connection.connections.target}')\n${projectionName}.${connectFunction}(weights=${connection.connections.weights}, delays=${connection.connections.delays})`;
  }).join('\n\n');
}

/**
 * Traduce el listado de items en neuronas y sinapsis estilo ANNarchy y lo pone en code.
 * @param {Array} items - Lista de elementos en el lienzo.
 * @param {Array} connections - Lista de conexiones en el lienzo.
 */
export function generateANNarchyCode(items, connections) {
  const neurons = getNeurons(items);
  const synapses = getSynapses(connections);

  const neuronCode = generateNeuronCode(neurons);
  const synapseCode = generateSynapseCode(synapses);
  const populationCode = generatePopulationCode(items);
  const projectionCode = generateProjectionCode(connections, items);

  code = `${neuronCode}\n\n${populationCode}\n\n${synapseCode}\n\n${projectionCode}`;
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

const CodeGenerator = ({ items, connections }) => {
  const handleGenerateCode = () => {
    const itemsList = getItemsFromLienzo(items);
    generateANNarchyCode(itemsList, connections);
    downloadCodeAsFile(code);
  };

  const handlePrintConnections = () => {
    printConnections(connections);
  };

  return (
    <div>
      <button onClick={handleGenerateCode}>Generar Código</button>
      <button onClick={handlePrintConnections}>Imprimir Conexiones</button>
    </div>
  );
};

export default CodeGenerator;