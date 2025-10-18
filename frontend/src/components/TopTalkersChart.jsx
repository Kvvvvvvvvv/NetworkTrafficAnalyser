import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopTalkersChart = ({ topTalkers }) => {
  // Prepare data for the chart
  const labels = topTalkers.map(talker => talker[0]); // IP addresses
  const bytesData = topTalkers.map(talker => talker[1].bytes); // Bytes sent/received

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Traffic (Bytes)',
        data: bytesData,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',    // blue-500
          'rgba(16, 185, 129, 0.8)',    // green-500
          'rgba(245, 158, 11, 0.8)',    // amber-500
          'rgba(139, 92, 246, 0.8)',    // violet-500
          'rgba(236, 72, 153, 0.8)',    // pink-500
          'rgba(100, 116, 139, 0.8)',   // slate-500
          'rgba(249, 115, 22, 0.8)',    // orange-500
          'rgba(14, 165, 233, 0.8)',    // sky-500
          'rgba(34, 197, 94, 0.8)',     // green-500
          'rgba(234, 179, 8, 0.8)'      // yellow-500
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(100, 116, 139, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)'
        ],
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(100, 116, 139, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)'
        ]
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
        displayColors: true,
        callbacks: {
          label: function(context) {
            const value = context.raw || 0;
            if (value === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(value) / Math.log(k));
            return `${context.dataset.label}: ${parseFloat((value / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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
          text: 'Traffic (Bytes)',
          color: '#cbd5e1',
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8',
          maxRotation: 45,
          minRotation: 45
        },
        title: {
          display: true,
          text: 'IP Addresses',
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
      duration: 1000
    }
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default TopTalkersChart;