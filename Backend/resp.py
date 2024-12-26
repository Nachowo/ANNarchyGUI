from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)

# Ruta del volumen compartido
VOLUME_PATH = os.getenv('VOLUME_PATH', '/shared')

# Ruta para recibir el código y ejecutar la simulación
@app.route('/simulate', methods=['POST'])
def simulate():
    try:
        print("Solicitud recibida en /simulate",flush=True)
        
        # Obtener el código desde la solicitud
        data = request.get_json()
        code = data.get('code', '')
        print("Código recibido:", code)

        if not code:
            print("No se proporcionó ningún código.")
            return jsonify({'error': 'No se proporcionó ningún código.'}), 400

        # Asegurarse de que la ruta compartida exista
       
        if not os.path.exists(VOLUME_PATH):
            print(f"El directorio compartido {VOLUME_PATH} no existe.",flush=True)
            return jsonify({'error': f'El directorio compartido {VOLUME_PATH} no existe.'}), 500

        # Guardar el código en un archivo temporal dentro del volumen compartido
        temp_filename = os.path.join(VOLUME_PATH, 'simulation_code.py')
        with open(temp_filename, 'w') as temp_file:
            temp_file.write(code)
        print(f"Código guardado en {temp_filename}",flush=True)


        # Ejecutar el código con ANNarchy en Docker
        result = subprocess.run(
            [
                'docker', 'run', '--rm',
                '-v', f"{VOLUME_PATH}:/app",  # Montar el mismo volumen que usa el servidor padre
                '-w', '/app',
                'nachowo/ann', 'python', 'simulation_code.py'
            ],
            capture_output=True,
            text=True
        )
        print("Resultado de la ejecución:", result)

        # Verificar errores
        if result.returncode != 0:
            print("Error en la simulación:", result.stderr)
            return jsonify({'error': 'Error en la simulación', 'details': result.stderr}), 500

        # Leer resultados desde archivos generados por ANNarchy
        results = {}
        monitor_v_path = os.path.join(VOLUME_PATH, "monitor_v.csv")
        monitor_spikes_path = os.path.join(VOLUME_PATH, "monitor_spikes.csv")

        if os.path.exists(monitor_v_path):
            with open(monitor_v_path, "r") as f:
                results["monitor_v"] = f.read()  # Leer el contenido del archivo
            print("monitor_v.csv leído")
        if os.path.exists(monitor_spikes_path):
            with open(monitor_spikes_path, "r") as f:
                results["monitor_spikes"] = f.read()  # Leer el contenido del archivo
            print("monitor_spikes.csv leído")

        # Eliminar archivos temporales
        os.remove(temp_filename)
        print(f"Archivo temporal {temp_filename} eliminado")
        if os.path.exists(monitor_v_path):
            os.remove(monitor_v_path)
            print("monitor_v.csv eliminado")
        if os.path.exists(monitor_spikes_path):
            os.remove(monitor_spikes_path)
            print("monitor_spikes.csv eliminado")

        # Retornar los resultados como JSON
        print("Resultados retornados:", results)
        return jsonify({'output': result.stdout, 'results': results})

    except Exception as e:
        print("Error en el servidor:", str(e))
        return jsonify({'error': 'Error en el servidor', 'details': str(e)}), 500


if __name__ == '__main__':
    print("Iniciando servidor en el puerto 50000000000000000000000000\n\n\n")
    print(os.listdir())
    app.run(host='0.0.0.0', port=5000)
    print("Servidor finalizado")





##CODE GENERATOR
'''
import React, { useState } from 'react';
import axios from 'axios';

let code = '';
const simulationTime = 100; // Valor estático para propósitos de prueba

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
    //const vars = Object.entries(neuron.variables).map(([key, value]) => `${key}=${value},`).join('\n\t\t');
    const firstVarValue = Object.entries(neuron.variables)[0];
    const equations = `\t\t${neuron.equation} : init= ${firstVarValue[1]}`;
    const attributes = [
      { key: 'spike', value: neuron.attributes.spike },
      { key: 'axon_spike', value: neuron.attributes.axon_spike },
      { key: 'reset', value: neuron.attributes.reset },
      { key: 'axon_reset', value: neuron.attributes.axon_reset },
      { key: 'refractory', value: neuron.attributes.refractory }
    ].filter(attr => attr.value !== '').map(attr => `\t${attr.key}="${attr.value}"`).join(',\n');
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
    console.log('Synapse:', synapse);
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

  code = `from ANNarchy import *\n\n${neuronCode}\n\n${populationCode}\n\n${synapseCode}\n\n${projectionCode}\n\ncompile()\n\nsimulate(${simulationTime})`;
}

/**
 * Envía el código al backend y recibe los resultados.
 * @param {string} code - Código a enviar al backend.
 * @returns {Promise<string>} - Respuesta del backend.
 */
export async function sendCodeToBackend(code) {
  try {
    const response = await fetch('http://localhost:5000/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    }) 
      .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error('Error:', data.details);
      } else {
        console.log('Output:', data.output); // Mensajes de consola
        console.log('Monitor V Data:', data.results.monitor_v); // Datos de variables
        console.log('Spike Data:', data.results.monitor_spikes); // Datos de disparos
      }
    })
    .catch((error) => console.error('Error:', error));
      
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();
    return result.output; // Ajustar según la estructura de la respuesta del backend
  } catch (error) {
    console.error('Error al enviar el código al backend:', error);
    throw error;
  }
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
  const [simulationOutput, setSimulationOutput] = useState('');

  const handleGenerateCode = async () => {
    const itemsList = getItemsFromLienzo(items);
    generateANNarchyCode(itemsList, connections);
    downloadCodeAsFile(code);
    
    try {
      const output = await sendCodeToBackend(code);
      setSimulationOutput(output);
    } catch (error) {
      console.error('Error al enviar el código al backend:', error);
      setSimulationOutput('Error al ejecutar la simulación.');
    }
    
  };

  const handlePrintConnections = () => {
    printConnections(connections);
  };

  return (
    <div>
      <button onClick={handleGenerateCode}>Generar Código</button>
      <button onClick={handlePrintConnections}>Imprimir Conexiones</button>
      {simulationOutput && (
        <div>
          <h3>Resultado de la Simulación:</h3>
          <pre>{simulationOutput}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeGenerator;'''