import { Chart } from 'chart.js';

/**
 * Genera un gráfico para una variable específica en el frontend.
 * @param {string} canvasId - ID del elemento canvas donde se renderizará el gráfico.
 * @param {Array} data - Datos de la variable obtenidos del monitor.
 * @param {string} variableName - Nombre de la variable.
 * @param {number} startTime - Tiempo inicial del intervalo a mostrar en el gráfico.
 * @param {number} endTime - Tiempo final del intervalo a mostrar en el gráfico.
 */
export function generateVariableGraph(canvasId, data, variableName, startTime = 0, endTime = data.length) {
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
    console.error(`Invalid or empty data provided for variable '${variableName}'.`);
    return;
  }

  // Filtrar los datos según el intervalo de tiempo especificado
  const filteredData = data.slice(startTime, endTime);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: filteredData.length }, (_, i) => startTime + i), // Etiquetas ajustadas al intervalo
      datasets: [
        {
          label: `Variable: ${variableName}`,
          data: filteredData.map(point => (Array.isArray(point) ? point[0] : point)), // Asegurar que los datos sean valores numéricos
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false,
          //tension: 0, // Asegurar que la línea sea recta
        },
      ],
    },
    options: {
      responsive: true, // Hacer que el gráfico sea dinámico
      maintainAspectRatio: true, // Permitir que el gráfico se ajuste al tamaño del canvas
      plugins: {
        title: {
          display: true,
          text: `Graph for Variable: ${variableName}`,
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