/* ============================================
   Our Financial Planner - Chart Module
   ============================================ */

const AppChart = (() => {
  'use strict';

  let chartInstance = null;

  function initChart(canvasId, type, labels, data, label, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    // Destroy previous instance
    if (chartInstance) {
      chartInstance.destroy();
    }

    const defaultColors = [
      '#4A7CF7', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'
    ];

    chartInstance = new Chart(ctx, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: label || 'Nilai',
          data: data,
          backgroundColor: colors || defaultColors.slice(0, data.length),
          borderColor: colors ? colors.map(c => c) : defaultColors.slice(0, data.length),
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: type === 'pie' || type === 'doughnut',
            position: 'bottom',
            labels: { color: '#B0B0D0', padding: 16, font: { size: 11 } }
          },
          tooltip: {
            backgroundColor: '#252550',
            titleColor: '#FFFFFF',
            bodyColor: '#B0B0D0',
            borderColor: '#3D3D6E',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(ctx) {
                let val = ctx.parsed || 0;
                return 'Rp ' + Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              }
            }
          }
        },
        scales: type !== 'pie' && type !== 'doughnut' ? {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(61,61,110,0.3)', drawBorder: false },
            ticks: {
              color: '#6E6E9E',
              font: { size: 11 },
              callback: function(val) {
                if (val >= 1000000) return (val / 1000000).toFixed(1) + 'jt';
                if (val >= 1000) return (val / 1000).toFixed(0) + 'rb';
                return val;
              }
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#6E6E9E', font: { size: 10 }, maxRotation: 45 }
          }
        } : {}
      }
    });

    return chartInstance;
  }

  return { init: initChart };
})();
