import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const CountryAnalytics = () => {
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'non_local', 'top10'
  const [chartType, setChartType] = useState('pie'); // 'pie', 'bar'

  useEffect(() => {
    fetchCountryData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCountryData, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchCountryData = async () => {
    try {
      setLoading(true);
      // Fetch from the backend API
      const response = await fetch('/api/get_country_analytics');
      const data = await response.json();
      
      if (data.status === 'success') {
        setCountryData(data.country_data);
      } else {
        setError(data.message || 'Failed to fetch country analytics data');
      }
    } catch (err) {
      setError('Failed to fetch country analytics data: ' + err.message);
      console.error('Error fetching country analytics:', err);
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

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Critical': return '#ff0000';
      case 'High': return '#ff8c00';
      case 'Medium': return '#ffff00';
      case 'Low': return '#00ff00';
      default: return '#00ff00';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  const filteredData = () => {
    let data = [...countryData];
    
    if (filter === 'non_local') {
      // Filter out local country (example: India)
      data = data.filter(country => country.country !== 'India');
    } else if (filter === 'top10') {
      // Get top 10 countries by bytes
      data = data.sort((a, b) => b.bytes - a.bytes).slice(0, 10);
    }
    
    return data;
  };

  const chartData = filteredData().map(country => ({
    name: country.country,
    packets: country.packets,
    bytes: country.bytes,
    unique_ips: country.unique_ips,
    risk_level: country.risk_level || 'Low', // Default to Low if not provided
    fill: getRiskColor(country.risk_level || 'Low')
  }));

  if (loading) {
    return (
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-neon-green"></div>
            <span className="ml-3 text-cyber-neon-green">Loading country analytics...</span>
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
              onClick={fetchCountryData}
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
      {/* Header and Controls */}
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-cyber-neon-green">Country & Region Analytics</h2>
              <p className="text-cyber-neon-blue mt-1">
                Real-time traffic analytics by geographic location
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="flex items-center">
                <label className="text-cyber-neon-green mr-2">Filter:</label>
                <select 
                  className="bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green px-3 py-2"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Countries</option>
                  <option value="non_local">Non-Local Countries</option>
                  <option value="top10">Top 10 Countries</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="text-cyber-neon-green mr-2">Chart:</label>
                <select 
                  className="bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green px-3 py-2"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <option value="pie">Pie Chart</option>
                  <option value="bar">Bar Chart</option>
                </select>
              </div>
              <button 
                className="cyber-btn-primary"
                onClick={fetchCountryData}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic by Country */}
        <div className="cyber-card">
          <div className="cyber-card-header">
            <h3 className="text-lg font-bold text-cyber-neon-green">Traffic by Country (Bytes)</h3>
          </div>
          <div className="cyber-card-body h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="bytes"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatBytes(value)} />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 50,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#00eeff" angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="#00eeff" tickFormatter={(value) => formatBytes(value)} />
                  <Tooltip 
                    formatter={(value, name) => name === 'bytes' ? formatBytes(value) : value}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Bar dataKey="bytes" name="Traffic (Bytes)" fill="#00eeff" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Packets by Country */}
        <div className="cyber-card">
          <div className="cyber-card-header">
            <h3 className="text-lg font-bold text-cyber-neon-green">Packets by Country</h3>
          </div>
          <div className="cyber-card-body h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 50,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#bd00ff" angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#bd00ff" />
                <Tooltip 
                  formatter={(value) => value.toLocaleString()}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Bar dataKey="packets" name="Packets" fill="#bd00ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Unique IPs by Country */}
      <div className="cyber-card">
        <div className="cyber-card-header">
          <h3 className="text-lg font-bold text-cyber-neon-green">Unique IPs by Country</h3>
        </div>
        <div className="cyber-card-body h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#ff00c8" angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#ff00c8" />
              <Tooltip 
                formatter={(value) => value.toLocaleString()}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Bar dataKey="unique_ips" name="Unique IPs" fill="#ff00c8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Country Data Table */}
      <div className="cyber-card">
        <div className="cyber-card-header">
          <h3 className="text-lg font-bold text-cyber-neon-green">Country Traffic Details</h3>
        </div>
        <div className="cyber-card-body">
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr className="cyber-table-head">
                  <th scope="col" className="cyber-table-cell text-left">Country</th>
                  <th scope="col" className="cyber-table-cell text-left">Packets</th>
                  <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                  <th scope="col" className="cyber-table-cell text-left">Unique IPs</th>
                  <th scope="col" className="cyber-table-cell text-left">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {filteredData()
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 104 0 2 2 0 012-2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          {data.country}
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
                      <td className="cyber-table-cell">
                        <span className={`cyber-badge ${
                          data.risk_level === 'Critical' ? 'anomaly-malicious' :
                          data.risk_level === 'High' ? 'anomaly-suspicious' :
                          data.risk_level === 'Medium' ? 'cyber-badge-warning' :
                          'cyber-badge-success'
                        }`}>
                          {data.risk_level}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryAnalytics;