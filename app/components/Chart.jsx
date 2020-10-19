import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {Chart as ChartJS} from 'chart.js';
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

export default function Chart({ contaminant, exposureHistory }) {
  const chartCanvas = useRef();
  const chart = useRef();

  useEffect(() => {
    chart.current = new ChartJS(chartCanvas.current, {
      type: 'line',
      data: exposuresToChartJSDataset(contaminant, exposureHistory),
      options: {
        elements: {
          point: {
            radius: 0,
          },
        },
        legend: {
          display: Object.keys(exposureHistory).length > 1,
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
            scaleLabel: {
              display: true,
              labelString: 'μg/m³',
            },
          }],
        },
        tooltips: {
          callbacks: {
            beforeBody: ([{ label }]) => label,
            label: ({ value }) => ` ${value} μg/m³`,
          },
          mode: 'index',
          intersect: false,
          position: 'average',
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

Chart.propTypes = {
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
