import React, { useState } from 'react';

let lienzoRef = null;
let code = '';

/**
 * Establece la referencia al componente Lienzo.
 * @param {Object} ref - Referencia al componente Lienzo.
 */
export function setLienzoRef(ref) {
  lienzoRef = ref;
}

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
export function getSynapses(connections, items) {
  return connections.map(connection => {
    const origen = items.find(item => item.id === connection.origen);
    const destino = items.find(item => item.id === connection.destino);
    return {
      id: connection.id,
      origen: origen ? origen.name : null,
      destino: destino ? destino.name : null,
      attributes: connection.attributes
    };
  });
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
 * Asegura que no haya espacios en los nombres y los reemplace con un guion.
 * @param {string} name - Nombre a procesar.
 * @returns {string} - Nombre procesado.
 */
export function formatName(name) {
  return name.replace(/\s+/g, '-');
}

/**
 * Traduce el listado de items en neuronas estilo ANNarchy y lo pone en code.
 * @param {Array} items - Lista de elementos en el lienzo.
 */
export function generateANNarchyCode(items) {
  const neurons = getNeurons(items);
  code = neurons.map(neuron => {
    const formattedName = formatName(neuron.name);
    const params = Object.entries(neuron.parameters).map(([key, value]) => `\t\t${key}=${value}`).join(',\n');
    const vars = Object.entries(neuron.variables).map(([key, value]) => `\t\t${key}=${value}`).join(',\n');
    return `${formattedName} = Neuron(\n\tequations='${neuron.equation}',\n\tparameters={\n${params}\n\t},\n\tvariables={\n${vars}\n\t}\n)`;
  }).join('\n\n');
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

const CodeGenerator = ({ items }) => {
  const handleTestGetItems = () => {
    const itemsList = getItemsFromLienzo(items);
    console.log('Items:', itemsList);
    generateANNarchyCode(itemsList);
    console.log('Código tipo ANNarchy:', code);
    downloadCodeAsFile(code);
  };

  return (
    <button onClick={handleTestGetItems}>Probar Obtener Items</button>
  );
};

export default CodeGenerator;