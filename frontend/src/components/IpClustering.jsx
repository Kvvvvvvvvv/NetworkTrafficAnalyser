import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const IpClustering = () => {
  const [subnetClusters, setSubnetClusters] = useState([]);
  const [networkClusters, setNetworkClusters] = useState([]);
  const [activityGrouping, setActivityGrouping] = useState([]);
  const [suspiciousClusters, setSuspiciousClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('subnets');

  // Mock data for demonstration
  const mockSubnetClusters = [
    { subnet: '192.168.1.0/24', ips: ['192.168.1.1', '192.168.1.5', '192.168.1.10'], packets: 125000, bytes: 125000000, unique_ips: 45 },
    { subnet: '10.0.0.0/24', ips: ['10.0.0.1', '10.0.0.15', '10.0.0.20'], packets: 98000, bytes: 98000000, unique_ips: 32 },
    { subnet: '172.16.0.0/24', ips: ['172.16.0.1', '172.16.0.8', '172.16.0.12'], packets: 75000, bytes: 75000000, unique_ips: 28 },
    { subnet: '203.0.113.0/24', ips: ['203.0.113.5', '203.0.113.10'], packets: 62000, bytes: 62000000, unique_ips: 21 },
    { subnet: '198.51.100.0/24', ips: ['198.51.100.23', '198.51.100.45'], packets: 48000, bytes: 48000000, unique_ips: 18 }
  ];

  const mockNetworkClusters = [
    { network: '192.168.0.0/16', subnets: ['192.168.1.0/24', '192.168.2.0/24'], ips: ['192.168.1.1', '192.168.1.5', '192.168.2.10'], packets: 250000, bytes: 250000000, unique_ips: 85 },
    { network: '10.0.0.0/16', subnets: ['10.0.0.0/24', '10.0.1.0/24'], ips: ['10.0.0.1', '10.0.0.15', '10.0.1.20'], packets: 180000, bytes: 180000000, unique_ips: 65 },
    { network: '172.16.0.0/16', subnets: ['172.16.0.0/24', '172.16.1.0/24'], ips: ['172.16.0.1', '172.16.0.8', '172.16.1.12'], packets: 145000, bytes: 145000000, unique_ips: 58 }
  ];

  const mockActivityGrouping = [
    { level: 'High', ip_count: 15, total_packets: 500000, total_bytes: 500000000, ips: [
      { ip: '192.168.1.10', packets: 25000, bytes: 25000000 },
      { ip: '192.168.1.15', packets: 22000, bytes: 22000000 },
      { ip: '10.0.0.5', packets: 20000, bytes: 20000000 }
    ]},
    { level: 'Medium', ip_count: 45, total_packets: 150000, total_bytes: 150000000, ips: [
      { ip: '192.168.1.5', packets: 8000, bytes: 8000000 },
      { ip: '10.0.0.10', packets: 7500, bytes: 7500000 },
      { ip: '172.16.0.5', packets: 7000, bytes: 7000000 }
    ]},
    { level: 'Low', ip_count: 120, total_packets: 45000, total_bytes: 45000000, ips: [
      { ip: '192.168.1.1', packets: 800, bytes: 800000 },
      { ip: '10.0.0.1', packets: 750, bytes: 750000 },
      { ip: '172.16.0.1', packets: 700, bytes: 700000 }
    ]},
    { level: 'Very Low', ip_count: 320, total_packets: 8000, total_bytes: 8000000, ips: [
      { ip: '192.168.1.100', packets: 50, bytes: 50000 },
      { ip: '10.0.0.100', packets: 45, bytes: 45000 },
      { ip: '172.16.0.100', packets: 40, bytes: 40000 }
    ]}
  ];

  const mockSuspiciousClusters = [
    { subnet: '203.0.113.0/24', reason: 'Sudden appearance of new IP range', timestamp: '2023-05-15 14:30:22', risk: 'High' },
    { subnet: '198.51.100.0/24', reason: 'Unusual traffic pattern', timestamp: '2023-05-15 14:25:18', risk: 'Medium' }
  ];

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // In a real implementation, these would fetch from the backend API
      // const clusterResponse = await fetch('/api/get_ip_clustering');
      // const activityResponse = await fetch('/api/get_ip_grouping_by_activity');
      
      // For now, using mock data
      setSubnetClusters(mockSubnetClusters);
      setNetworkClusters(mockNetworkClusters);
      setActivityGrouping(mockActivityGrouping);
      setSuspiciousClusters(mockSuspiciousClusters);
    } catch (err) {
      setError('Failed to fetch IP clustering data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getActivityColor = (level) => {
    switch (level) {
      case 'High':
        return '#ff0000';
      case 'Medium':
        return '#ff8c00';
      case 'Low':
        return '#00ff00';
      case 'Very Low':
        return '#87ceeb';
      default:
        return '#8884d8';
    }
  };

  const getRiskClass = (risk) => {
    switch (risk) {
      case 'High':
        return 'anomaly-malicious';
      case 'Medium':
        return 'anomaly-suspicious';
      case 'Low':
        return 'cyber-badge-success';
      default:
        return 'cyber-badge-primary';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-neon-green"></div>
            <span className="ml-3 text-cyber-neon-green">Loading IP clustering data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="text-center py-8">
            <div className="text-cyber-neon-red">Error: {error}</div>
            <button 
              className="cyber-btn-primary mt-4"
              onClick={fetchData}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-cyber-neon-green">IP Clustering & Grouping</h2>
              <p className="text-cyber-neon-blue mt-1">
                Analysis of IP addresses grouped by subnets and activity levels
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                className="cyber-btn-primary"
                onClick={fetchData}
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Level Distribution */}
      <div className="cyber-card">
        <div className="cyber-card-header">
          <h3 className="text-lg font-bold text-cyber-neon-green">IP Activity Level Distribution</h3>
        </div>
        <div className="cyber-card-body h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activityGrouping}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="ip_count"
                nameKey="level"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {activityGrouping.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getActivityColor(entry.level)} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="cyber-card">
        <div className="border-b border-cyber-border">
          <nav className="flex -mb-px">
            {[
              { id: 'subnets', name: 'Subnet Clusters', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
              { id: 'networks', name: 'Network Clusters', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'activity', name: 'Activity Grouping', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
              { id: 'suspicious', name: 'Suspicious Clusters', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-6 text-sm font-medium font-mono flex items-center border-b-2 ${
                  activeTab === tab.id
                    ? 'border-cyber-neon-green text-cyber-neon-green'
                    : 'border-transparent text-cyber-neon-blue hover:text-cyber-neon-green hover:border-cyber-neon-green'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="cyber-card">
        <div className="cyber-card-body">
          {activeTab === 'subnets' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Top Subnet Clusters (/24)</h3>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={subnetClusters}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 50,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="subnet" stroke="#00eeff" angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke="#00eeff" tickFormatter={(value) => formatBytes(value)} />
                    <Tooltip 
                      formatter={(value, name) => name === 'bytes' ? formatBytes(value) : value.toLocaleString()}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Bar dataKey="bytes" name="Traffic (Bytes)" fill="#00eeff" />
                    <Bar dataKey="unique_ips" name="Unique IPs" fill="#bd00ff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr className="cyber-table-head">
                      <th scope="col" className="cyber-table-cell text-left">Subnet</th>
                      <th scope="col" className="cyber-table-cell text-left">Packets</th>
                      <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                      <th scope="col" className="cyber-table-cell text-left">Unique IPs</th>
                      <th scope="col" className="cyber-table-cell text-left">Sample IPs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {subnetClusters
                      .sort((a, b) => b.bytes - a.bytes)
                      .map((data, index) => (
                        <motion.tr 
                          key={index} 
                          className="cyber-table-row"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="cyber-table-cell font-medium text-cyber-neon-green">
                            <div className="flex items-center">
                              <div className="bg-cyber-gray-700 rounded-full p-1 mr-2">
                                <svg className="h-3 w-3 text-cyber-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                </svg>
                              </div>
                              {data.subnet}
                            </div>
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.packets.toLocaleString()}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {formatBytes(data.bytes)}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.unique_ips}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.ips.slice(0, 3).join(', ')}
                            {data.ips.length > 3 && ` +${data.ips.length - 3} more`}
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'networks' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Top Network Clusters (/16)</h3>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={networkClusters}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 50,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="network" stroke="#bd00ff" angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke="#bd00ff" tickFormatter={(value) => formatBytes(value)} />
                    <Tooltip 
                      formatter={(value, name) => name === 'bytes' ? formatBytes(value) : value.toLocaleString()}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Bar dataKey="bytes" name="Traffic (Bytes)" fill="#bd00ff" />
                    <Bar dataKey="unique_ips" name="Unique IPs" fill="#ff00c8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr className="cyber-table-head">
                      <th scope="col" className="cyber-table-cell text-left">Network</th>
                      <th scope="col" className="cyber-table-cell text-left">Subnets</th>
                      <th scope="col" className="cyber-table-cell text-left">Packets</th>
                      <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                      <th scope="col" className="cyber-table-cell text-left">Unique IPs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {networkClusters
                      .sort((a, b) => b.bytes - a.bytes)
                      .map((data, index) => (
                        <motion.tr 
                          key={index} 
                          className="cyber-table-row"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="cyber-table-cell font-medium text-cyber-neon-green">
                            <div className="flex items-center">
                              <div className="bg-cyber-gray-700 rounded-full p-1 mr-2">
                                <svg className="h-3 w-3 text-cyber-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              {data.network}
                            </div>
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.subnets.length}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.packets.toLocaleString()}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {formatBytes(data.bytes)}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.unique_ips}
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">IP Grouping by Activity Volume</h3>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityGrouping}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 50,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="level" stroke="#ff00c8" />
                    <YAxis stroke="#ff00c8" />
                    <Tooltip 
                      formatter={(value, name) => name === 'total_bytes' ? formatBytes(value) : value.toLocaleString()}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Bar dataKey="ip_count" name="IP Count" fill="#ff00c8" />
                    <Bar dataKey="total_packets" name="Total Packets" fill="#00eeff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {activityGrouping
                  .sort((a, b) => ['Very Low', 'Low', 'Medium', 'High'].indexOf(a.level) - ['Very Low', 'Low', 'Medium', 'High'].indexOf(b.level))
                  .map((group, index) => (
                    <motion.div
                      key={index}
                      className="cyber-card bg-cyber-gray-800"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="cyber-card-header">
                        <h4 className="text-lg font-bold text-cyber-neon-green">{group.level} Activity IPs</h4>
                        <p className="text-cyber-neon-blue">
                          {group.ip_count} IPs • {group.total_packets.toLocaleString()} packets • {formatBytes(group.total_bytes)}
                        </p>
                      </div>
                      <div className="cyber-card-body">
                        <div className="overflow-x-auto">
                          <table className="cyber-table">
                            <thead>
                              <tr className="cyber-table-head">
                                <th scope="col" className="cyber-table-cell text-left">IP Address</th>
                                <th scope="col" className="cyber-table-cell text-left">Packets</th>
                                <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-cyber-border">
                              {group.ips.map((ipData, ipIndex) => (
                                <tr key={ipIndex} className="cyber-table-row">
                                  <td className="cyber-table-cell font-medium text-cyber-neon-green">
                                    {ipData.ip}
                                  </td>
                                  <td className="cyber-table-cell text-cyber-neon-blue">
                                    {ipData.packets.toLocaleString()}
                                  </td>
                                  <td className="cyber-table-cell text-cyber-neon-blue">
                                    {formatBytes(ipData.bytes)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'suspicious' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Suspicious IP Clusters</h3>
              {suspiciousClusters.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-cyber-neon-green">No suspicious clusters detected</div>
                  <p className="text-cyber-neon-blue mt-2">Network clustering appears normal</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="cyber-table">
                    <thead>
                      <tr className="cyber-table-head">
                        <th scope="col" className="cyber-table-cell text-left">Subnet</th>
                        <th scope="col" className="cyber-table-cell text-left">Reason</th>
                        <th scope="col" className="cyber-table-cell text-left">Timestamp</th>
                        <th scope="col" className="cyber-table-cell text-left">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-border">
                      {suspiciousClusters.map((data, index) => (
                        <motion.tr 
                          key={index} 
                          className="cyber-table-row"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="cyber-table-cell font-medium text-cyber-neon-green">
                            <div className="flex items-center">
                              <div className="bg-cyber-gray-700 rounded-full p-1 mr-2">
                                <svg className="h-3 w-3 text-cyber-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                              {data.subnet}
                            </div>
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.reason}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.timestamp}
                          </td>
                          <td className="cyber-table-cell">
                            <span className={`cyber-badge ${getRiskClass(data.risk)}`}>
                              {data.risk}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IpClustering;