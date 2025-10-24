import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const AsnIspInsights = () => {
  const [asnData, setAsnData] = useState([]);
  const [ispData, setIspData] = useState([]);
  const [networkTypeData, setNetworkTypeData] = useState([]);
  const [suspiciousPatterns, setSuspiciousPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('asn');

  // Mock data for demonstration
  const mockAsnData = [
    { asn: 'AS15169', packets: 125000, bytes: 125000000, unique_ips: 450 },
    { asn: 'AS23456', packets: 98000, bytes: 98000000, unique_ips: 320 },
    { asn: 'AS34567', packets: 75000, bytes: 75000000, unique_ips: 280 },
    { asn: 'AS45678', packets: 62000, bytes: 62000000, unique_ips: 210 },
    { asn: 'AS56789', packets: 48000, bytes: 48000000, unique_ips: 180 },
    { asn: 'AS67890', packets: 35000, bytes: 35000000, unique_ips: 150 },
    { asn: 'AS78901', packets: 29000, bytes: 29000000, unique_ips: 120 },
    { asn: 'AS89012', packets: 18000, bytes: 18000000, unique_ips: 95 }
  ];

  const mockIspData = [
    { isp: 'Google LLC', packets: 125000, bytes: 125000000, unique_ips: 450 },
    { isp: 'Amazon Technologies Inc.', packets: 98000, bytes: 98000000, unique_ips: 320 },
    { isp: 'Microsoft Corporation', packets: 75000, bytes: 75000000, unique_ips: 280 },
    { isp: 'Cloudflare Inc.', packets: 62000, bytes: 62000000, unique_ips: 210 },
    { isp: 'AT&T Services Inc.', packets: 48000, bytes: 48000000, unique_ips: 180 },
    { isp: 'Verizon Communications Inc.', packets: 35000, bytes: 35000000, unique_ips: 150 },
    { isp: 'Comcast Cable Communications LLC', packets: 29000, bytes: 29000000, unique_ips: 120 },
    { isp: 'NordVPN', packets: 18000, bytes: 18000000, unique_ips: 95 }
  ];

  const mockNetworkTypeData = [
    { type: 'Residential', packets: 250000, bytes: 250000000, unique_ips: 850 },
    { type: 'Hosting', packets: 120000, bytes: 120000000, unique_ips: 320 },
    { type: 'VPN', packets: 45000, bytes: 45000000, unique_ips: 180 },
    { type: 'Tor', packets: 8000, bytes: 8000000, unique_ips: 25 },
    { type: 'Proxy', packets: 12000, bytes: 12000000, unique_ips: 45 }
  ];

  const mockSuspiciousPatterns = [
    { type: 'HOSTING_SPIKE', message: 'Sudden increase from hosting providers (120000 packets)', severity: 'WARNING', details: { type: 'Hosting', packets: 120000, bytes: 120000000, unique_ips: 320 } },
    { type: 'HIGH_VPN_USAGE', message: 'High VPN usage detected (180 unique IPs)', severity: 'INFO', details: { type: 'VPN', packets: 45000, bytes: 45000000, unique_ips: 180 } }
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
      // const asnResponse = await fetch('/api/get_asn_isp_insights');
      // const suspiciousResponse = await fetch('/api/detect_suspicious_traffic');
      
      // For now, using mock data
      setAsnData(mockAsnData);
      setIspData(mockIspData);
      setNetworkTypeData(mockNetworkTypeData);
      setSuspiciousPatterns(mockSuspiciousPatterns);
    } catch (err) {
      setError('Failed to fetch ASN/ISP insights data');
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

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'WARNING':
        return 'anomaly-suspicious';
      case 'CRITICAL':
        return 'anomaly-malicious';
      case 'INFO':
        return 'cyber-badge-primary';
      default:
        return 'cyber-badge-success';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-neon-green"></div>
            <span className="ml-3 text-cyber-neon-green">Loading ASN/ISP insights...</span>
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
              <h2 className="text-xl font-bold text-cyber-neon-green">ASN & ISP Insights</h2>
              <p className="text-cyber-neon-blue mt-1">
                Autonomous System Numbers and Internet Service Provider analytics
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

      {/* Network Type Distribution */}
      <div className="cyber-card">
        <div className="cyber-card-header">
          <h3 className="text-lg font-bold text-cyber-neon-green">Network Type Distribution</h3>
        </div>
        <div className="cyber-card-body h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={networkTypeData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="bytes"
                nameKey="type"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {networkTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatBytes(value)} />
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
              { id: 'asn', name: 'ASN Data', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
              { id: 'isp', name: 'ISP Data', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'network', name: 'Network Types', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
              { id: 'suspicious', name: 'Suspicious Patterns', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }
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
          {activeTab === 'asn' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Autonomous System Numbers (ASN)</h3>
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr className="cyber-table-head">
                      <th scope="col" className="cyber-table-cell text-left">ASN</th>
                      <th scope="col" className="cyber-table-cell text-left">Packets</th>
                      <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                      <th scope="col" className="cyber-table-cell text-left">Unique IPs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {asnData
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
                              {data.asn}
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
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'isp' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Internet Service Providers (ISP)</h3>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ispData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 50,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="isp" stroke="#00eeff" angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke="#00eeff" tickFormatter={(value) => formatBytes(value)} />
                    <Tooltip 
                      formatter={(value, name) => name === 'bytes' ? formatBytes(value) : value}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Bar dataKey="bytes" name="Traffic (Bytes)" fill="#00eeff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr className="cyber-table-head">
                      <th scope="col" className="cyber-table-cell text-left">ISP</th>
                      <th scope="col" className="cyber-table-cell text-left">Packets</th>
                      <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                      <th scope="col" className="cyber-table-cell text-left">Unique IPs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {ispData
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
                              {data.isp}
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
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Network Type Analytics</h3>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={networkTypeData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 50,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="type" stroke="#bd00ff" />
                    <YAxis stroke="#bd00ff" tickFormatter={(value) => formatBytes(value)} />
                    <Tooltip 
                      formatter={(value, name) => name === 'bytes' ? formatBytes(value) : value}
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
                      <th scope="col" className="cyber-table-cell text-left">Network Type</th>
                      <th scope="col" className="cyber-table-cell text-left">Packets</th>
                      <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                      <th scope="col" className="cyber-table-cell text-left">Unique IPs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {networkTypeData
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
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                              {data.type}
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
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'suspicious' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Suspicious Traffic Patterns</h3>
              {suspiciousPatterns.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-cyber-neon-green">No suspicious patterns detected</div>
                  <p className="text-cyber-neon-blue mt-2">Network traffic appears normal</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suspiciousPatterns.map((pattern, index) => (
                    <motion.div
                      key={index}
                      className="cyber-card bg-cyber-gray-800"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="cyber-card-body">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-bold text-cyber-neon-green">{pattern.type.replace('_', ' ')}</h4>
                            <p className="text-cyber-neon-blue mt-1">{pattern.message}</p>
                          </div>
                          <span className={`cyber-badge ${getSeverityClass(pattern.severity)}`}>
                            {pattern.severity}
                          </span>
                        </div>
                        {pattern.details && (
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="cyber-stat-card">
                              <div className="cyber-stat-card-body">
                                <div className="text-sm text-cyber-neon-blue">Network Type</div>
                                <div className="text-lg font-bold text-cyber-neon-green">{pattern.details.type}</div>
                              </div>
                            </div>
                            <div className="cyber-stat-card">
                              <div className="cyber-stat-card-body">
                                <div className="text-sm text-cyber-neon-blue">Packets</div>
                                <div className="text-lg font-bold text-cyber-neon-green">{pattern.details.packets.toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="cyber-stat-card">
                              <div className="cyber-stat-card-body">
                                <div className="text-sm text-cyber-neon-blue">Unique IPs</div>
                                <div className="text-lg font-bold text-cyber-neon-green">{pattern.details.unique_ips}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AsnIspInsights;