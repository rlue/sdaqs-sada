import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import 'chartjs-plugin-colorschemes';

function exposuresToChartJSDataset(contaminant, exposureHistory) {
  return {
    datasets: Object.keys(exposureHistory).map((baseName) => ({
      label: baseName,
      data: exposureHistory[baseName].map((record) => ({
        x: record.date,
        y: record[contaminant],
      })),
    })),
  };
}

export default function ExposureChart({ contaminant, exposureHistory }) {
  const chartCanvas = useRef();
  const chart = useRef();

  useEffect(() => {
    chart.current = new Chart(chartCanvas.current, {
      type: 'line',
      data: exposuresToChartJSDataset(contaminant, exposureHistory),
      options: {
        elements: {
          point: {
            radius: 0,
          },
        },
        plugins: {
          colorschemes: {
            scheme: 'brewer.Spectral11',
          },
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'month',
            },
          }],
          yAxes: [{
            stacked: true,
            labelString: 'ppm',
          }],
        },
        tooltips: {
          callbacks: {
            title: () => contaminant,
            beforeBody: ([{ label }]) => label,
            label: ({ value }) => ` ${value} μg/m³`,
          },
          intersect: false,
          mode: 'index',
          titleFontSize: 18,
          titleMarginBottom: 12,
          xPadding: 12,
          yPadding: 12,
        },
      },
    });
  }, []);

  useEffect(() => {
    chart.current.data = exposuresToChartJSDataset(contaminant, exposureHistory);
    chart.current.update();
  }, [exposureHistory]);

  return <canvas ref={chartCanvas} />;
}

ExposureChart.propTypes = {
  contaminant: PropTypes.string.isRequired,
  exposureHistory: PropTypes.objectOf( // key: <baseId> (e.g., VA0518)
    PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        pm25: PropTypes.string.isRequired,
      }).isRequired,
    ),
  ).isRequired,
};
