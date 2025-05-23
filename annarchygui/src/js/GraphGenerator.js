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

  const variableName = variableNames;
  // Generar nombres de variables si variableNames es un string
  if (typeof variableNames === 'string') {

    const [startNeuron, endNeuron] = neuronRange;
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
  

  if (startNeuron < 1 || Number(startNeuron) > Number(endNeuron) || endNeuron > data.length) {
    console.error(`Invalid neuron range: [${startNeuron}, ${endNeuron}].`);
    return;
  }

  // Filtrar los datos según el intervalo de tiempo especificado
  const filteredData = data.slice(startTime, endTime);

  // Crear datasets para cada neurona en el rango
  const datasets = variableNames.map((variableName, i) => {
    const neuronIndex = startNeuron - 1 + i; // Índice real en los datos
  
    const r = Math.floor(255 - (i * 120) % 255);
    const g = Math.floor((i * 40) % 255);
    const b = Math.floor((i * 60) % 255);
  
    return {
      //pointHoverRadius: 5,
      pointRadius: 0,
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
      maintainAspectRatio: false, // Permitir que el gráfico se ajuste al tamaño del canvas
      
      plugins: {
        title: {
          display: true,
          text: `${variableName} graph for neurons ${startNeuron} to ${endNeuron}`,
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

/**
 * Genera un gráfico de dispersión para visualizar los spikes de un rango de neuronas.
 * @param {string} canvasId - ID del elemento canvas donde se renderizará el gráfico.
 * @param {Array} spikeData - Datos de los spikes de las neuronas.
 * @param {Array} neuronRange - Rango de neuronas a graficar [startNeuron, endNeuron].
 * @param {number} startTime - Tiempo inicial del intervalo a mostrar en el gráfico.
 * @param {number} endTime - Tiempo final del intervalo a mostrar en el gráfico.
 */
export function generateSpikeGraph(canvasId, spikeData, startTime = 0, endTime = 1000, binSize = 1) {
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
    existingChart.destroy(); // Destruir el gráfico existente
  }

  if (!Array.isArray(spikeData)) {
    console.warn('spikeData no es un arreglo. Intentando convertirlo con Object.values.');
    spikeData = Object.values(spikeData);
  }

  // Aplanar todos los spikes
  const allSpikes = Array.isArray(spikeData[0]) ? spikeData.flat() : Object.values(spikeData).flat();

  // Filtrar dentro del intervalo
  const filteredSpikes = allSpikes.filter(spike => spike >= startTime && spike <= endTime);

  if (startTime >= endTime) {
    console.error(`Invalid time range: startTime (${startTime}) must be less than endTime (${endTime}).`);
    return;
  }

  if (binSize <= 0) {
    console.error(`Invalid bin size: binSize (${binSize}) must be greater than 0.`);
    return;
  }

  const bins = Math.ceil((endTime - startTime) / binSize);
  if (bins <= 0) {
    console.error(`Invalid number of bins: ${bins}. Check startTime, endTime, and binSize.`);
    return;
  }

  // Crear los bins
  const counts = new Array(bins).fill(0);

  filteredSpikes.forEach(spike => {
    const index = Math.floor((spike - startTime) / binSize);
    if (index >= 0 && index < bins) {
      counts[index]++;
    }
  });

  // Eje X: centro de cada bin
  const labels = Array.from({ length: bins }, (_, i) => startTime + i * binSize + binSize / 2);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Spike Rate',
          data: counts,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Spike Rate Over Time',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time (ms)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Spike Count',
          },
        },
      },
    },
  });
}

/**
 * Genera un gráfico de tipo raster plot para visualizar los spikes de múltiples neuronas.
 * @param {string} canvasId - ID del elemento canvas donde se renderizará el gráfico.
 * @param {Array} spikeData - Datos de los spikes de las neuronas.
 * @param {number} startTime - Tiempo inicial del intervalo a mostrar en el gráfico.
 * @param {number} endTime - Tiempo final del intervalo a mostrar en el gráfico.
 */
export function generateRasterPlot(canvasId, spikeData, startTime = 0, endTime = 1000) {
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
    existingChart.destroy(); // Destruir el gráfico existente
  }

  if (!Array.isArray(spikeData)) {
    console.warn('spikeData no es un arreglo. Intentando convertirlo con Object.values.');
    spikeData = Object.values(spikeData);
  }

  // Asegurarse de que spikeData sea un arreglo de arreglos
  const allSpikes = Array.isArray(spikeData[0]) ? spikeData : Object.values(spikeData);

  // Filtrar los spikes dentro del rango de tiempo especificado
  const filteredSpikes = allSpikes.map((spikes, neuronIndex) => 
    spikes.filter(spikeTime => spikeTime >= startTime && spikeTime <= endTime)
  );

  // Crear datasets para cada neurona dentro del rango de tiempo
  const datasets = filteredSpikes.map((spikes, neuronIndex) => {
    return {
      label: `Neuron ${neuronIndex + 1}`,
      data: spikes.map(spikeTime => ({ x: spikeTime, y: neuronIndex + 1 })),
      pointBackgroundColor: 'rgba(0, 0, 255, 1)',
      pointRadius: 2,
      showLine: false,
    };
  });

  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Raster Plot',
        },
        legend: {
          display: false, // Ocultar los nombres de las neuronas en la leyenda
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
            text: 'Neuron ID',
          },
        },
      },
    },
  });
}

