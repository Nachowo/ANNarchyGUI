import { Chart } from 'chart.js';

/**
 * Genera un gráfico de líneas para visualizar variables de un rango de neuronas.
 * Utiliza Chart.js para renderizar los datos en el canvas especificado.
 * @param {string} canvasId - ID del elemento canvas donde se renderizará el gráfico.
 * @param {Array} data - Datos de las variables obtenidos del monitor.
 * @param {Array|string} variableNames - Nombres de las variables o prefijo para generarlos.
 * @param {Array} neuronRange - Rango de neuronas a graficar [startNeuron, endNeuron].
 * @param {number} startTime - Tiempo inicial del intervalo a mostrar en el gráfico.
 * @param {number} endTime - Tiempo final del intervalo a mostrar en el gráfico.
 * @param {boolean} showLabels - Si se muestran etiquetas y leyenda.
 */
export function generateVariableGraph(canvasId, data, variableNames, neuronRange, startTime = 0, endTime = data.length, showLabels = true) {

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy(); // Destruir el gráfico existente antes de crear uno nuevo
  }

  if (!Array.isArray(data) || data.length === 0) {
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
    return;
  }

  // Asegurarse de que neuronRange sea un arreglo de números
  if (typeof neuronRange === 'string') {
    neuronRange = neuronRange.split(',').map(Number);
  }

  const [startNeuron, endNeuron] = neuronRange;
  

  if (startNeuron < 1 || Number(startNeuron) > Number(endNeuron) || endNeuron > data.length) {
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
      pointRadius: 0,
      label: showLabels ? `Neuron ${startNeuron + i}` : undefined,
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
      responsive: true, 
      maintainAspectRatio: false, // Permitir que el gráfico se ajuste al tamaño del canvas
      
      plugins: {
        title: {
          display: true,
          text: showLabels ? `${variableName} graph for neurons ${startNeuron} to ${endNeuron}` : '',
        },
        legend: {
          display: showLabels,
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
 * Genera un gráfico de tasa de spikes (spike rate) para un rango de tiempo y datos de spikes.
 * Utiliza Chart.js para mostrar la cantidad de spikes por bin temporal.
 * @param {string} canvasId - ID del elemento canvas donde se renderizará el gráfico.
 * @param {Array} spikeData - Datos de los spikes de las neuronas.
 * @param {number} startTime - Tiempo inicial del intervalo a mostrar en el gráfico.
 * @param {number} endTime - Tiempo final del intervalo a mostrar en el gráfico.
 * @param {number} binSize - Tamaño del bin temporal para agrupar spikes.
 * @param {boolean} showLabels - Si se muestran etiquetas y leyenda.
 */
export function generateSpikeGraph(canvasId, spikeData, startTime = 0, endTime = 1000, binSize = 1, showLabels = true) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy(); 
  }

  if (!Array.isArray(spikeData)) {
    spikeData = Object.values(spikeData);
  }

  const allSpikes = Array.isArray(spikeData[0]) ? spikeData.flat() : Object.values(spikeData).flat();

  const filteredSpikes = allSpikes.filter(spike => spike >= startTime && spike <= endTime);

  if (startTime >= endTime) {
    return;
  }

  if (binSize <= 0) {
    return;
  }

  const bins = Math.ceil((endTime - startTime) / binSize);
  if (bins <= 0) {
    return;
  }

  const counts = new Array(bins).fill(0);

  filteredSpikes.forEach(spike => {
    const index = Math.floor((spike - startTime) / binSize);
    if (index >= 0 && index < bins) {
      counts[index]++;
    }
  });

  const labels = Array.from({ length: bins }, (_, i) => startTime + i * binSize + binSize / 2);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: showLabels ? 'Spike Rate' : undefined,
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
          text: showLabels ? 'Spike Rate Over Time' : '',
        },
        legend: {
          display: showLabels,
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
 * Genera un gráfico tipo raster plot para visualizar los spikes de múltiples neuronas en el tiempo.
 * Cada punto representa un spike de una neurona en un instante dado.
 * Utiliza Chart.js en modo scatter.
 * @param {string} canvasId - ID del elemento canvas donde se renderizará el gráfico.
 * @param {Array} spikeData - Datos de los spikes de las neuronas.
 * @param {number} startTime - Tiempo inicial del intervalo a mostrar en el gráfico.
 * @param {number} endTime - Tiempo final del intervalo a mostrar en el gráfico.
 * @param {boolean} showLabels - Si se muestran etiquetas y leyenda.
 */
export function generateRasterPlot(canvasId, spikeData, startTime = 0, endTime = 1000, showLabels = true) {

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy(); // Destruir el gráfico existente
  }

  if (!Array.isArray(spikeData)) {
    spikeData = Object.values(spikeData);
  }

  const allSpikes = Array.isArray(spikeData[0]) ? spikeData : Object.values(spikeData);

  const filteredSpikes = allSpikes.map((spikes, neuronIndex) => 
    spikes.filter(spikeTime => spikeTime >= startTime && spikeTime <= endTime)
  );

  const datasets = filteredSpikes.map((spikes, neuronIndex) => {
    return {
      label: showLabels ? `Neuron ${neuronIndex + 1}` : undefined,
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
          text: showLabels ? 'Raster Plot' : '',
        },
        legend: {
          display: showLabels,
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

