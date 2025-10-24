import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const GeoTimeCorrelation = () => {
  const [timeZoneData, setTimeZoneData] = useState([]);
  const [activityPatterns, setActivityPatterns] = useState([]);
  const [suspiciousPatterns, setSuspiciousPatterns] = useState([]);
  const [bubbleData, setBubbleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('timezones');
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  // World map data
  const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

  // Mock data for demonstration
  const mockTimeZoneData = [
    { timezone: 'UTC', countries: ['United States', 'United Kingdom', 'Germany'], packets: 125000, bytes: 125000000, unique_ips: 450 },
    { timezone: 'UTC+1', countries: ['France', 'Germany', 'Italy'], packets: 98000, bytes: 98000000, unique_ips: 320 },
    { timezone: 'UTC+9', countries: ['Japan', 'South Korea'], packets: 75000, bytes: 75000000, unique_ips: 280 },
    { timezone: 'UTC-5', countries: ['United States', 'Canada'], packets: 62000, bytes: 62000000, unique_ips: 210 },
    { timezone: 'UTC+5:30', countries: ['India'], packets: 48000, bytes: 48000000, unique_ips: 180 },
    { timezone: 'UTC+8', countries: ['China', 'Singapore'], packets: 35000, bytes: 35000000, unique_ips: 150 },
    { timezone: 'UTC+3', countries: ['Russia', 'Turkey'], packets: 29000, bytes: 29000000, unique_ips: 120 },
    { timezone: 'UTC-3', countries: ['Brazil', 'Argentina'], packets: 18000, bytes: 18000000, unique_ips: 95 }
  ];

  const mockActivityPatterns = [
    { timezone: 'UTC', off_hour_packets: 45000, off_hour_bytes: 45000000, normal_hour_packets: 80000, normal_hour_bytes: 80000000 },
    { timezone: 'UTC+1', off_hour_packets: 32000, off_hour_bytes: 32000000, normal_hour_packets: 66000, normal_hour_bytes: 66000000 },
    { timezone: 'UTC+9', off_hour_packets: 55000, off_hour_bytes: 55000000, normal_hour_packets: 20000, normal_hour_bytes: 20000000 },
    { timezone: 'UTC-5', off_hour_packets: 38000, off_hour_bytes: 38000000, normal_hour_packets: 24000, normal_hour_bytes: 24000000 }
  ];

  const mockSuspiciousPatterns = [
    { timezone: 'UTC+9', off_hour_ratio: 0.73, off_hour_packets: 55000, off_hour_bytes: 55000000, risk_level: 'High' },
    { timezone: 'UTC-5', off_hour_ratio: 0.61, off_hour_packets: 38000, off_hour_bytes: 38000000, risk_level: 'Medium' }
  ];

  const mockBubbleData = [
    { ip: '192.168.1.105', latitude: 37.0902, longitude: -95.7129, country: 'United States', packets: 12500, bytes: 12500000, radius: 35 },
    { ip: '10.0.0.42', latitude: 51.1657, longitude: 10.4515, country: 'Germany', packets: 9800, bytes: 9800000, radius: 30 },
    { ip: '203.0.113.5', latitude: 36.2048, longitude: 138.2529, country: 'Japan', packets: 7500, bytes: 7500000, radius: 25 },
    { ip: '198.51.100.23', latitude: 55.3781, longitude: -3.4360, country: 'United Kingdom', packets: 6200, bytes: 6200000, radius: 22 },
    { ip: '192.0.2.178', latitude: -25.2744, longitude: 133.7751, country: 'Australia', packets: 4800, bytes: 4800000, radius: 20 }
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
      // const response = await fetch('/api/get_geo_time_correlation');
      // const bubbleResponse = await fetch('/api/get_world_map_bubbles');
      
      // For now, using mock data
      setTimeZoneData(mockTimeZoneData);
      setActivityPatterns(mockActivityPatterns);
      setSuspiciousPatterns(mockSuspiciousPatterns);
      setBubbleData(mockBubbleData);
    } catch (err) {
      setError('Failed to fetch geo-time correlation data');
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

  const getRiskClass = (riskLevel) => {
    switch (riskLevel) {
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

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  if (loading) {
    return (
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-neon-green"></div>
            <span className="ml-3 text-cyber-neon-green">Loading geo-time correlation data...</span>
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
              <h2 className="text-xl font-bold text-cyber-neon-green">Geo-time Correlation</h2>
              <p className="text-cyber-neon-blue mt-1">
                Analysis of IP activity patterns across timezones
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

      {/* Navigation Tabs */}
      <div className="cyber-card">
        <div className="border-b border-cyber-border">
          <nav className="flex -mb-px">
            {[
              { id: 'timezones', name: 'Timezone Analysis', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'patterns', name: 'Activity Patterns', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { id: 'suspicious', name: 'Suspicious Patterns', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
              { id: 'map', name: 'World Map', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
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
          {activeTab === 'timezones' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Timezone Traffic Analysis</h3>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeZoneData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 50,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="timezone" stroke="#00eeff" angle={-45} textAnchor="end" height={60} />
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
                      <th scope="col" className="cyber-table-cell text-left">Timezone</th>
                      <th scope="col" className="cyber-table-cell text-left">Countries</th>
                      <th scope="col" className="cyber-table-cell text-left">Packets</th>
                      <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                      <th scope="col" className="cyber-table-cell text-left">Unique IPs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {timeZoneData
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
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              {data.timezone}
                            </div>
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.countries.join(', ')}
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

          {activeTab === 'patterns' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Activity Patterns by Timezone</h3>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityPatterns}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 50,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="timezone" stroke="#bd00ff" />
                    <YAxis stroke="#bd00ff" />
                    <Tooltip 
                      formatter={(value) => value.toLocaleString()}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Bar dataKey="off_hour_packets" name="Off-Hour Packets" fill="#ff00c8" />
                    <Bar dataKey="normal_hour_packets" name="Normal Hour Packets" fill="#00eeff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr className="cyber-table-head">
                      <th scope="col" className="cyber-table-cell text-left">Timezone</th>
                      <th scope="col" className="cyber-table-cell text-left">Off-Hour Packets</th>
                      <th scope="col" className="cyber-table-cell text-left">Normal Hour Packets</th>
                      <th scope="col" className="cyber-table-cell text-left">Off-Hour Traffic</th>
                      <th scope="col" className="cyber-table-cell text-left">Normal Hour Traffic</th>
                      <th scope="col" className="cyber-table-cell text-left">Off-Hour Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {activityPatterns
                      .sort((a, b) => (b.off_hour_packets + b.normal_hour_packets) - (a.off_hour_packets + a.normal_hour_packets))
                      .map((data, index) => {
                        const totalPackets = data.off_hour_packets + data.normal_hour_packets;
                        const offHourRatio = totalPackets > 0 ? (data.off_hour_packets / totalPackets) : 0;
                        
                        return (
                          <motion.tr 
                            key={index} 
                            className="cyber-table-row"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <td className="cyber-table-cell font-medium text-cyber-neon-green">
                              {data.timezone}
                            </td>
                            <td className="cyber-table-cell text-cyber-neon-blue">
                              {data.off_hour_packets.toLocaleString()}
                            </td>
                            <td className="cyber-table-cell text-cyber-neon-blue">
                              {data.normal_hour_packets.toLocaleString()}
                            </td>
                            <td className="cyber-table-cell text-cyber-neon-blue">
                              {formatBytes(data.off_hour_bytes)}
                            </td>
                            <td className="cyber-table-cell text-cyber-neon-blue">
                              {formatBytes(data.normal_hour_bytes)}
                            </td>
                            <td className="cyber-table-cell text-cyber-neon-blue">
                              {(offHourRatio * 100).toFixed(1)}%
                            </td>
                          </motion.tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'suspicious' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Suspicious Time Activity Patterns</h3>
              {suspiciousPatterns.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-cyber-neon-green">No suspicious time patterns detected</div>
                  <p className="text-cyber-neon-blue mt-2">Network activity patterns appear normal</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="cyber-table">
                    <thead>
                      <tr className="cyber-table-head">
                        <th scope="col" className="cyber-table-cell text-left">Timezone</th>
                        <th scope="col" className="cyber-table-cell text-left">Off-Hour Ratio</th>
                        <th scope="col" className="cyber-table-cell text-left">Off-Hour Packets</th>
                        <th scope="col" className="cyber-table-cell text-left">Off-Hour Traffic</th>
                        <th scope="col" className="cyber-table-cell text-left">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-border">
                      {suspiciousPatterns.map((data, index) => (
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
                              {data.timezone}
                            </div>
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {(data.off_hour_ratio * 100).toFixed(1)}%
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.off_hour_packets.toLocaleString()}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {formatBytes(data.off_hour_bytes)}
                          </td>
                          <td className="cyber-table-cell">
                            <span className={`cyber-badge ${getRiskClass(data.risk_level)}`}>
                              {data.risk_level}
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

          {activeTab === 'map' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">World Map - Active Connections</h3>
              <div className="h-96 w-full relative">
                <ComposableMap 
                  projection="geoMercator"
                  projectionConfig={{
                    scale: 120
                  }}
                >
                  <ZoomableGroup
                    center={position.coordinates}
                    zoom={position.zoom}
                    onMoveEnd={handleMoveEnd}
                  >
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        geographies.map((geo) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            style={{
                              default: {
                                fill: "#1a1a2e",
                                stroke: "#334155",
                                strokeWidth: 0.5,
                                outline: "none"
                              },
                              hover: {
                                fill: "#2a2a2a",
                                stroke: "#00ff9d",
                                strokeWidth: 1,
                                outline: "none"
                              },
                              pressed: {
                                fill: "#bd00ff",
                                stroke: "#bd00ff",
                                strokeWidth: 1,
                                outline: "none"
                              }
                            }}
                          />
                        ))
                      }
                    </Geographies>
                    {bubbleData.map(({ ip, latitude, longitude, country, packets, radius }) => (
                      <Marker key={ip} coordinates={[longitude, latitude]}>
                        <motion.circle
                          r={radius / 5}
                          fill="#ff00c8"
                          stroke="#0a0a0a"
                          strokeWidth={1}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.5 }}
                          className="neon-glow-red"
                        />
                        <motion.circle
                          r={radius / 5}
                          fill="rgba(255, 0, 192, 0.2)"
                          stroke="none"
                          initial={{ scale: 0 }}
                          animate={{ scale: 2 }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        />
                      </Marker>
                    ))}
                  </ZoomableGroup>
                </ComposableMap>
              </div>
              <div className="mt-4">
                <p className="text-cyber-neon-blue text-sm">
                  Bubble size represents traffic volume. Hover over bubbles to see details.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeoTimeCorrelation;