import React from 'react';

let lienzoRef = null;

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

const CodeGenerator = ({ items }) => {
  const handleTestGetItems = () => {
    const itemsList = getItemsFromLienzo(items);
    console.log('Items from Lienzo:', itemsList);
  };

  return (
    <button onClick={handleTestGetItems}>Probar Obtener Items</button>
  );
};

export default CodeGenerator;