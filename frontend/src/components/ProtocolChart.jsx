import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ProtocolChart = ({ protocols }) => {
  // Prepare data for the chart
  const protocolNames = {
    1: 'ICMP',
    6: 'TCP',
    17: 'UDP',
    2: 'IGMP',
    89: 'OSPF',
    132: 'SCTP'
  };

  const protocolCounts = Object.entries(protocols).map(([protocol, count]) => ({
    name: protocolNames[protocol] || `Protocol ${protocol}`,
    count: count
  }));

  // Sort by count descending and take top 5
  protocolCounts.sort((a, b) => b.count - a.count);
  const topProtocols = protocolCounts.slice(0, 5);
  
  // If we have more than 5 protocols, group the rest as "Others"
  const othersCount = protocolCounts.slice(5).reduce((sum, p) => sum + p.count, 0);
  
  const chartData = {
    labels: [...topProtocols.map(p => p.name), ...(othersCount > 0 ? ['Others'] : [])],
    datasets: [
      {
        data: [...topProtocols.map(p => p.count), ...(othersCount > 0 ? [othersCount] : [])],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',    // blue-500
          'rgba(16, 185, 129, 0.8)',    // green-500
          'rgba(245, 158, 11, 0.8)',    // amber-500
          'rgba(139, 92, 246, 0.8)',    // violet-500
          'rgba(236, 72, 153, 0.8)',    // pink-500
          'rgba(100, 116, 139, 0.8)'    // slate-500
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(100, 116, 139, 1)'
        ],
        borderWidth: 1,
        hoverOffset: 15
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f1f5f9',
          font: {
            size: 12
          },
          padding: 20
        }
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
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    }
  };

  return (
    <div className="h-80">
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
};

export default ProtocolChart;