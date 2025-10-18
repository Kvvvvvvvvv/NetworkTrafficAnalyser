import React from 'react';
import { Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const TrafficHeatmap = ({ packetHistory }) => {
  // Group packets by protocol and calculate stats
  const protocolStats = {};
  
  packetHistory.forEach(packet => {
    const protocol = packet.protocol;
    if (!protocolStats[protocol]) {
      protocolStats[protocol] = {
        count: 0,
        totalSize: 0,
        packets: []
      };
    }
    protocolStats[protocol].count += 1;
    protocolStats[protocol].totalSize += packet.size;
    protocolStats[protocol].packets.push(packet);
  });
  
  // Prepare data for the heatmap
  const protocolNames = {
    1: 'ICMP',
    6: 'TCP',
    17: 'UDP',
    2: 'IGMP',
    89: 'OSPF',
    132: 'SCTP'
  };
  
  const bubbleData = {
    datasets: Object.entries(protocolStats).map(([protocol, stats], index) => {
      const avgSize = stats.count > 0 ? stats.totalSize / stats.count : 0;
      return {
        label: protocolNames[protocol] || `Protocol ${protocol}`,
        data: [{
          x: stats.count, // Packet count
          y: avgSize,     // Average packet size
          r: Math.sqrt(stats.totalSize) / 10 // Radius based on total size
        }],
        backgroundColor: `hsla(${index * 60}, 70%, 60%, 0.6)`,
        borderColor: `hsla(${index * 60}, 70%, 40%, 1)`,
        borderWidth: 1
      };
    })
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
          padding: 15
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
        callbacks: {
          label: function(context) {
            const dataset = context.dataset;
            const dataPoint = context.parsed;
            return [
              `${dataset.label}`,
              `Packets: ${dataPoint.x}`,
              `Avg Size: ${Math.round(dataPoint.y)} bytes`,
              `Total Size: ${Math.round(Math.pow(dataPoint.r * 10, 2))} bytes`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Packet Count',
          color: '#cbd5e1',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.3)'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Average Packet Size (bytes)',
          color: '#cbd5e1',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.3)'
        },
        ticks: {
          color: '#94a3b8',
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    },
    animation: {
      duration: 1000
    }
  };

  return (
    <div className="h-80">
      <Bubble data={bubbleData} options={chartOptions} />
    </div>
  );
};

export default TrafficHeatmap;