import React, { useState } from 'react';

let code = '';

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
    equation: neuron.neuron.equation,
    parameters: neuron.neuron.parameters,
    variables: neuron.neuron.variables,
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
 * Traduce el listado de items en neuronas y sinapsis estilo ANNarchy y lo pone en code.
 * @param {Array} items - Lista de elementos en el lienzo.
 * @param {Array} connections - Lista de conexiones en el lienzo.
 */
export function generateANNarchyCode(items, connections) {
  const neurons = getNeurons(items);
  const synapses = getSynapses(connections);

  const neuronCode = neurons.map(neuron => {
    const formattedName = formatName(neuron.name);
    const params = Object.entries(neuron.parameters).map(([key, value]) => `\t\t${key}=${value}`).join(',\n');
    const vars = Object.entries(neuron.variables).map(([key, value]) => `\t\t${key}=${value}`).join(',\n');
    return `${formattedName} = Neuron(\n\tequations='${neuron.equation}',\n\tparameters="""\n${params}\n\t""",\n\tvariables="""\n${vars}\n\t"""\n)`;
  }).join('\n\n');

  const synapseCode = synapses.map(synapse => {
    const formattedName = formatName(synapse.attributes.name);
    const params = `\t\tw=${synapse.attributes.weight},\n\t\tdelay=${synapse.attributes.delay}`;
    return `${formattedName} = Synapse(\n\tparameters="""\n${params}\n\t"""\n)`;
  }).join('\n\n');

  code = `${neuronCode}\n\n${synapseCode}`;
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