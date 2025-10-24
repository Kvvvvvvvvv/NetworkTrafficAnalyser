import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const PortProtocolIntelligence = () => {
  const [portData, setPortData] = useState([]);
  const [protocolData, setProtocolData] = useState([]);
  const [unusualPorts, setUnusualPorts] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ports');

  // Mock data for demonstration
  const mockPortData = [
    { port: 80, name: 'HTTP', description: 'Hypertext Transfer Protocol', risk: 'Low', packets: 125000, bytes: 125000000 },
    { port: 443, name: 'HTTPS', description: 'Hypertext Transfer Protocol Secure', risk: 'Low', packets: 98000, bytes: 98000000 },
    { port: 22, name: 'SSH', description: 'Secure Shell', risk: 'Low', packets: 75000, bytes: 75000000 },
    { port: 53, name: 'DNS', description: 'Domain Name System', risk: 'Low', packets: 62000, bytes: 62000000 },
    { port: 25, name: 'SMTP', description: 'Simple Mail Transfer Protocol', risk: 'Low', packets: 48000, bytes: 48000000 },
    { port: 110, name: 'POP3', description: 'Post Office Protocol v3', risk: 'Low', packets: 35000, bytes: 35000000 },
    { port: 3389, name: 'RDP', description: 'Remote Desktop Protocol', risk: 'High', packets: 29000, bytes: 29000000 },
    { port: 445, name: 'SMB', description: 'Server Message Block', risk: 'High', packets: 18000, bytes: 18000000 },
    { port: 8080, name: 'HTTP Proxy', description: 'HTTP Proxy/Alternative HTTP', risk: 'Medium', packets: 15000, bytes: 15000000 },
    { port: 21, name: 'FTP Control', description: 'File Transfer Protocol (Control)', risk: 'Medium', packets: 12000, bytes: 12000000 }
  ];

  const mockProtocolData = [
    { protocol: 6, name: 'TCP', packets: 350000, bytes: 350000000 },
    { protocol: 17, name: 'UDP', packets: 120000, bytes: 120000000 },
    { protocol: 1, name: 'ICMP', packets: 45000, bytes: 45000000 },
    { protocol: 2, name: 'IGMP', packets: 8000, bytes: 8000000 },
    { protocol: 89, name: 'OSPF', packets: 2000, bytes: 2000000 }
  ];

  const mockUnusualPorts = [
    { port: 8080, name: 'HTTP Proxy', packets: 15000, bytes: 15000000, direction: 'source' },
    { port: 445, name: 'SMB', packets: 18000, bytes: 18000000, direction: 'destination' },
    { port: 3389, name: 'RDP', packets: 29000, bytes: 29000000, direction: 'source' },
    { port: 21, name: 'FTP Control', packets: 12000, bytes: 12000000, direction: 'destination' }
  ];

  const mockCorrelationData = [
    { port: 80, port_name: 'HTTP', country: 'United States', packets: 45000, bytes: 45000000 },
    { port: 443, port_name: 'HTTPS', country: 'Germany', packets: 32000, bytes: 32000000 },
    { port: 22, port_name: 'SSH', country: 'Japan', packets: 28000, bytes: 28000000 },
    { port: 53, port_name: 'DNS', country: 'United Kingdom', packets: 21000, bytes: 21000000 },
    { port: 3389, port_name: 'RDP', country: 'China', packets: 19000, bytes: 19000000 },
    { port: 445, port_name: 'SMB', country: 'Russia', packets: 15000, bytes: 15000000 },
    { port: 8080, port_name: 'HTTP Proxy', country: 'India', packets: 12000, bytes: 12000000 },
    { port: 25, port_name: 'SMTP', country: 'Canada', packets: 10000, bytes: 10000000 }
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
      // const response = await fetch('/api/get_port_protocol_intelligence');
      // const correlationResponse = await fetch('/api/get_port_country_correlation');
      
      // For now, using mock data
      setPortData(mockPortData);
      setProtocolData(mockProtocolData);
      setUnusualPorts(mockUnusualPorts);
      setCorrelationData(mockCorrelationData);
    } catch (err) {
      setError('Failed to fetch port/protocol intelligence data');
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
    return (
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-neon-green"></div>
            <span className="ml-3 text-cyber-neon-green">Loading port/protocol intelligence...</span>
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
              <h2 className="text-xl font-bold text-cyber-neon-green">Port & Protocol Intelligence</h2>
              <p className="text-cyber-neon-blue mt-1">
                Analysis of network ports and protocols with risk assessment
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

      {/* Top Protocols Chart */}
      <div className="cyber-card">
        <div className="cyber-card-header">
          <h3 className="text-lg font-bold text-cyber-neon-green">Protocol Distribution</h3>
        </div>
        <div className="cyber-card-body h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={protocolData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="packets"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {protocolData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              { id: 'ports', name: 'Top Ports', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
              { id: 'protocols', name: 'Protocol Data', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z' },
              { id: 'unusual', name: 'Unusual Ports', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
              { id: 'correlation', name: 'Port-Country Correlation', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
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
          {activeTab === 'ports' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Most Used Ports</h3>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={portData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 50,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="port" stroke="#00eeff" />
                    <YAxis stroke="#00eeff" />
                    <Tooltip 
                      formatter={(value, name) => name === 'bytes' ? formatBytes(value) : value.toLocaleString()}
                      labelStyle={{ color: '#000' }}
                      labelFormatter={(value, payload) => {
                        const port = payload[0]?.payload;
                        return port ? `${port.port} (${port.name})` : value;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="packets" name="Packets" fill="#00eeff" />
                    <Bar dataKey="bytes" name="Traffic (Bytes)" fill="#bd00ff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr className="cyber-table-head">
                      <th scope="col" className="cyber-table-cell text-left">Port</th>
                      <th scope="col" className="cyber-table-cell text-left">Service</th>
                      <th scope="col" className="cyber-table-cell text-left">Description</th>
                      <th scope="col" className="cyber-table-cell text-left">Packets</th>
                      <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                      <th scope="col" className="cyber-table-cell text-left">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {portData
                      .sort((a, b) => b.packets - a.packets)
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
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              {data.port}
                            </div>
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.name}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.description}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.packets.toLocaleString()}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {formatBytes(data.bytes)}
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
            </div>
          )}

          {activeTab === 'protocols' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Protocol Analytics</h3>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={protocolData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 50,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#bd00ff" />
                    <YAxis stroke="#bd00ff" />
                    <Tooltip 
                      formatter={(value, name) => name === 'bytes' ? formatBytes(value) : value.toLocaleString()}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Bar dataKey="packets" name="Packets" fill="#bd00ff" />
                    <Bar dataKey="bytes" name="Traffic (Bytes)" fill="#ff00c8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr className="cyber-table-head">
                      <th scope="col" className="cyber-table-cell text-left">Protocol</th>
                      <th scope="col" className="cyber-table-cell text-left">Name</th>
                      <th scope="col" className="cyber-table-cell text-left">Packets</th>
                      <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {protocolData
                      .sort((a, b) => b.packets - a.packets)
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
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              {data.protocol}
                            </div>
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.name}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.packets.toLocaleString()}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {formatBytes(data.bytes)}
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'unusual' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Unusual Port Activity</h3>
              {unusualPorts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-cyber-neon-green">No unusual port activity detected</div>
                  <p className="text-cyber-neon-blue mt-2">Network port usage appears normal</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="cyber-table">
                    <thead>
                      <tr className="cyber-table-head">
                        <th scope="col" className="cyber-table-cell text-left">Port</th>
                        <th scope="col" className="cyber-table-cell text-left">Service</th>
                        <th scope="col" className="cyber-table-cell text-left">Direction</th>
                        <th scope="col" className="cyber-table-cell text-left">Packets</th>
                        <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                        <th scope="col" className="cyber-table-cell text-left">Alert</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-border">
                      {unusualPorts
                        .sort((a, b) => b.packets - a.packets)
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
                                  <svg className="h-3 w-3 text-cyber-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                </div>
                                {data.port}
                              </div>
                            </td>
                            <td className="cyber-table-cell text-cyber-neon-blue">
                              {data.name}
                            </td>
                            <td className="cyber-table-cell text-cyber-neon-blue">
                              <span className="cyber-badge cyber-badge-primary">
                                {data.direction}
                              </span>
                            </td>
                            <td className="cyber-table-cell text-cyber-neon-blue">
                              {data.packets.toLocaleString()}
                            </td>
                            <td className="cyber-table-cell text-cyber-neon-blue">
                              {formatBytes(data.bytes)}
                            </td>
                            <td className="cyber-table-cell">
                              <span className="cyber-badge anomaly-suspicious">
                                REVIEW
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

          {activeTab === 'correlation' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Port-Country Correlation</h3>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={correlationData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 70,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="port_name" 
                      stroke="#ff00c8" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tickFormatter={(value, index) => {
                        const item = correlationData[index];
                        return item ? `${item.port_name} (${item.country})` : value;
                      }}
                    />
                    <YAxis stroke="#ff00c8" />
                    <Tooltip 
                      formatter={(value, name) => name === 'bytes' ? formatBytes(value) : value.toLocaleString()}
                      labelStyle={{ color: '#000' }}
                      labelFormatter={(value, payload) => {
                        const item = payload[0]?.payload;
                        return item ? `${item.port_name} - ${item.country}` : value;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="packets" name="Packets" fill="#ff00c8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr className="cyber-table-head">
                      <th scope="col" className="cyber-table-cell text-left">Port</th>
                      <th scope="col" className="cyber-table-cell text-left">Service</th>
                      <th scope="col" className="cyber-table-cell text-left">Country</th>
                      <th scope="col" className="cyber-table-cell text-left">Packets</th>
                      <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {correlationData
                      .sort((a, b) => b.packets - a.packets)
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
                              {data.port}
                            </div>
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.port_name}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.country}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.packets.toLocaleString()}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {formatBytes(data.bytes)}
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortProtocolIntelligence;