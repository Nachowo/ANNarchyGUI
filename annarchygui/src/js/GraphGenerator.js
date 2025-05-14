import { Chart } from 'chart.js';

/**
 * Genera un gráfico para un rango de neuronas específicas en el frontend.
 * @param {string} canvasId - ID del elemento canvas donde se renderizará el gráfico.
 * @param {Array} data - Datos de las variables obtenidos del monitor.
 * @param {Array|string} variableNames - Nombres de las variables o prefijo para generarlos.
 * @param {Array} neuronRange - Rango de neuronas a graficar [startNeuron, endNeuron].
 * @param {number} startTime - Tiempo inicial del intervalo a mostrar en el gráfico.
 * @param {number} endTime - Tiempo final del intervalo a mostrar en el gráfico.
 */
export function generateVariableGraph(canvasId, data, variableNames, neuronRange, startTime = 0, endTime = data.length) {

    console.log(`Variable names: ${variableNames}`);
    console.log(`Neuron range: ${neuronRange}`);
    console.log(`Start time: ${startTime}`);
    console.log(`End time: ${endTime}`);

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas with ID '${canvasId}' not found.`);
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error(`Unable to get 2D context for canvas with ID '${canvasId}'.`);
    return;
  }

  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy(); // Destruir el gráfico existente antes de crear uno nuevo
  }

  if (!Array.isArray(data) || data.length === 0) {
    console.error(`Invalid or empty data provided.`);
    return;
  }


  // Generar nombres de variables si variableNames es un string
  if (typeof variableNames === 'string') {
    const [startNeuron, endNeuron] = neuronRange;
    console.log('neuronRange:', neuronRange);
    variableNames = Array.from(
      { length: endNeuron - startNeuron + 1 },
      (_, i) => `${variableNames}_${startNeuron + i}`
    );
  } else if (!Array.isArray(variableNames)) {
    console.error(`Invalid variableNames. Expected an array or string but got:`, variableNames);
    return;
  }

  // Asegurarse de que neuronRange sea un arreglo de números
  if (typeof neuronRange === 'string') {
    neuronRange = neuronRange.split(',').map(Number);
  }

  const [startNeuron, endNeuron] = neuronRange;
  console.log(`Neuron range: [${startNeuron}, ${endNeuron}]`);
  

  if (startNeuron < 1 || Number(startNeuron) > Number(endNeuron) || endNeuron > data.length) {

    console.log(data);
    console.error(`Invalid neuron range: [${startNeuron}, ${endNeuron}].`);
    return;
  }

  // Filtrar los datos según el intervalo de tiempo especificado
  const filteredData = data.slice(startTime, endTime);

  // Crear datasets para cada neurona en el rango
  console.log(variableNames)
  const datasets = variableNames.map((variableName, i) => {
    const neuronIndex = startNeuron - 1 + i; // Índice real en los datos
  
    const r = Math.floor(255 - (i * 120) % 255);
    const g = Math.floor((i * 40) % 255);
    const b = Math.floor((i * 60) % 255);
  
    return {
      label: `Neuron ${startNeuron + i}`,
      data: filteredData.map(point => point[neuronIndex]),
      borderColor: `rgba(${r}, ${g}, ${b}, 1)`,
      borderWidth: 2,
      fill: false,
      tension: 0,
    };
  });
  

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: filteredData.length }, (_, i) => startTime + i), // Etiquetas ajustadas al intervalo
      datasets: datasets,
    },
    options: {
      responsive: true, // Hacer que el gráfico sea dinámico
      maintainAspectRatio: true, // Permitir que el gráfico se ajuste al tamaño del canvas
      plugins: {
        title: {
          display: true,
          text: `Graph for Neurons: ${startNeuron} to ${endNeuron}`,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Value',
          },
        },
      },
    },
  });
}