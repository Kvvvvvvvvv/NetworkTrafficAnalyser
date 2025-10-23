import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="cyber-card bg-cyber-gray-800 p-4 border border-cyber-neon-green">
        <p className="font-bold text-cyber-neon-green">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-cyber-neon-blue">
            {entry.name}: <span className="text-cyber-neon-green">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom legend component
const CustomLegend = (props) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 mr-2 rounded-full" 
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-cyber-neon-blue text-sm">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

// Protocol Distribution Chart
export const ProtocolDistributionChart = ({ protocols }) => {
  const protocolNames = {
    1: 'ICMP',
    6: 'TCP',
    17: 'UDP',
    2: 'IGMP',
    89: 'OSPF',
    132: 'SCTP'
  };

  const chartData = Object.entries(protocols)
    .map(([protocol, count]) => ({
      name: protocolNames[protocol] || `Protocol ${protocol}`,
      value: count,
      color: `hsl(${parseInt(protocol) * 10 % 360}, 70%, 60%)`
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Traffic Over Time Chart
export const TrafficOverTimeChart = ({ packetHistory }) => {
  // Group packets by time intervals (5-second intervals)
  const groupedData = packetHistory.reduce((acc, packet) => {
    const timeKey = Math.floor(packet.timestamp / 5) * 5;
    if (!acc[timeKey]) {
      acc[timeKey] = { time: timeKey, packets: 0, bytes: 0 };
    }
    acc[timeKey].packets += 1;
    acc[timeKey].bytes += packet.size;
    return acc;
  }, {});

  const chartData = Object.values(groupedData)
    .sort((a, b) => a.time - b.time)
    .slice(-30) // Last 30 data points
    .map(item => ({
      time: new Date(item.time * 1000).toLocaleTimeString(),
      packets: item.packets,
      bytes: item.bytes
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="time" 
            stroke="#00eeff"
            tick={{ fill: '#00eeff' }}
          />
          <YAxis 
            stroke="#00eeff"
            tick={{ fill: '#00eeff' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="packets" 
            stroke="#00ff9d" 
            fill="url(#colorPackets)" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="bytes" 
            stroke="#bd00ff" 
            fill="url(#colorBytes)" 
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00ff9d" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorBytes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#bd00ff" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#bd00ff" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Top Talkers Chart
export const TopTalkersChart = ({ topTalkers }) => {
  const chartData = topTalkers.map(([ip, data]) => ({
    name: ip,
    bytes: data.bytes,
    packets: data.sent + data.received
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="name" 
            stroke="#00eeff"
            tick={{ fill: '#00eeff', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#00eeff"
            tick={{ fill: '#00eeff' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="bytes" 
            name="Traffic (Bytes)"
            fill="#00ff9d" 
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <motion.rect
                key={`bar-${index}`}
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Protocol Traffic Chart
export const ProtocolTrafficChart = ({ protocols }) => {
  const protocolNames = {
    1: 'ICMP',
    6: 'TCP',
    17: 'UDP',
    2: 'IGMP',
    89: 'OSPF',
    132: 'SCTP'
  };

  const chartData = Object.entries(protocols)
    .map(([protocol, count]) => ({
      name: protocolNames[protocol] || `Protocol ${protocol}`,
      packets: count,
      color: `hsl(${parseInt(protocol) * 10 % 360}, 70%, 60%)`
    }))
    .sort((a, b) => b.packets - a.packets)
    .slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            type="number" 
            stroke="#00eeff"
            tick={{ fill: '#00eeff' }}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke="#00eeff"
            tick={{ fill: '#00eeff' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="packets" 
            name="Packets"
            fill="#00eeff" 
            radius={[0, 4, 4, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};