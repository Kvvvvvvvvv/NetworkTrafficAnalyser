import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BytesChart = ({ packetHistory }) => {
  // Group packets by second and calculate bytes per second
  const bytesPerSecond = {};
  
  packetHistory.forEach(packet => {
    const second = Math.floor(packet.timestamp);
    if (!bytesPerSecond[second]) {
      bytesPerSecond[second] = 0;
    }
    bytesPerSecond[second] += packet.size;
  });
  
  // Convert to array and sort by timestamp
  const sortedData = Object.entries(bytesPerSecond)
    .map(([timestamp, bytes]) => ({ timestamp: parseInt(timestamp), bytes }))
    .sort((a, b) => a.timestamp - b.timestamp);
  
  // Take the last 30 data points for the chart
  const recentData = sortedData.slice(-30);
  
  // Prepare chart data
  const chartData = {
    labels: recentData.map(data => 
      new Date(data.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    ),
    datasets: [
      {
        label: 'Bytes per Second',
        data: recentData.map(data => data.bytes),
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)',
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.3
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(51, 65, 85, 0.5)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const value = context.raw || 0;
            return `Traffic: ${value.toLocaleString()} bytes`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(71, 85, 105, 0.3)'
        },
        ticks: {
          color: '#94a3b8',
          callback: function(value) {
            if (value === 0) return '0';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB'];
            const i = Math.floor(Math.log(value) / Math.log(k));
            return parseFloat((value / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
          }
        },
        title: {
          display: true,
          text: 'Bytes',
          color: '#cbd5e1',
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.3)'
        },
        ticks: {
          color: '#94a3b8',
          maxRotation: 45,
          minRotation: 45
        },
        title: {
          display: true,
          text: 'Time',
          color: '#cbd5e1',
          font: {
            size: 12
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: 500
    }
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default BytesChart;