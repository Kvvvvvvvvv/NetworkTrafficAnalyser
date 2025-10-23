import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LiveTrafficTable from './LiveTrafficTable';
import ProtocolChart from './ProtocolChart';
import BytesChart from './BytesChart';
import TopTalkersChart from './TopTalkersChart';
import TrafficHeatmap from './TrafficHeatmap';
import PacketFilter from './PacketFilter';
import AnomalyDetection from './AnomalyDetection';
import GeoIPMap from './GeoIPMap';
import ThreatIntelligence from './ThreatIntelligence';

const CyberDashboard = ({ socket, onStopCapture, interfaces }) => {
  const [stats, setStats] = useState({
    total_packets: 0,
    total_bytes: 0,
    protocols: {},
    ips: {},
    top_talkers: [],
    packet_history: [],
    anomalies: []
  });

  const [selectedInterfaces, setSelectedInterfaces] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [sessionName, setSessionName] = useState('NTA-Session-' + new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!socket) return;

    socket.on('update_stats', (data) => {
      setStats(data);
    });

    socket.on('alert', (alert) => {
      // Show alert notification
      console.log('Alert received:', alert);
    });

    return () => {
      socket.off('update_stats');
      socket.off('alert');
    };
  }, [socket]);

  const stopCapture = async () => {
    try {
      await fetch('/api/stop_capture', {
        method: 'POST',
      });
      onStopCapture();
    } catch (err) {
      console.error('Failed to stop capture:', err);
    }
  };

  const handleInterfaceChange = (interfaceName) => {
    setSelectedInterfaces(prev => {
      if (prev.includes(interfaceName)) {
        return prev.filter(iface => iface !== interfaceName);
      } else {
        return [...prev, interfaceName];
      }
    });
  };

  const startMultiInterfaceCapture = async () => {
    if (selectedInterfaces.length === 0) {
      alert('Please select at least one interface');
      return;
    }

    try {
      const response = await fetch('/api/start_capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interfaces: selectedInterfaces }),
      });

      const data = await response.json();
      if (data.status !== 'success') {
        alert('Failed to start capture: ' + data.message);
      }
    } catch (err) {
      console.error('Failed to start capture:', err);
      alert('Failed to start capture');
    }
  };

  // Format bytes for display
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate packets per second
  const calculatePps = () => {
    if (stats.packet_history.length < 2) return 0;
    
    const recentPackets = stats.packet_history.slice(-10); // Last 10 packets
    if (recentPackets.length < 2) return 0;
    
    const firstTime = recentPackets[0].timestamp;
    const lastTime = recentPackets[recentPackets.length - 1].timestamp;
    const timeDiff = lastTime - firstTime;
    
    if (timeDiff === 0) return 0;
    
    return (recentPackets.length / timeDiff).toFixed(2);
  };

  // Get top protocols by count
  const getTopProtocols = () => {
    const protocolNames = {
      1: 'ICMP',
      6: 'TCP',
      17: 'UDP',
      2: 'IGMP',
      89: 'OSPF',
      132: 'SCTP'
    };
    
    return Object.entries(stats.protocols)
      .map(([protocol, count]) => ({
        name: protocolNames[protocol] || `Protocol ${protocol}`,
        count: count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // Get top IPs by traffic
  const getTopIPs = () => {
    return Object.entries(stats.ips)
      .map(([ip, data]) => ({
        ip: ip,
        bytes: data.bytes,
        packets: data.sent + data.received
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 5);
  };

  // Determine anomaly status for display
  const getAnomalyStatus = () => {
    if (stats.anomalies && stats.anomalies.length > 0) {
      const malicious = stats.anomalies.filter(a => a.severity === 'CRITICAL').length;
      const suspicious = stats.anomalies.filter(a => a.severity === 'WARNING').length;
      
      if (malicious > 0) return 'malicious';
      if (suspicious > 0) return 'suspicious';
      return 'normal';
    }
    return 'normal';
  };

  const anomalyStatus = getAnomalyStatus();

  return (
    <div className="matrix-bg">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          className="cyber-stat-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="cyber-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-cyber-neon-green/10 rounded-lg p-3 neon-glow-green">
                <svg className="h-6 w-6 text-cyber-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Total Packets</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-green glow-text">
                      {stats.total_packets.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="cyber-stat-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="cyber-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-cyber-neon-blue/10 rounded-lg p-3 neon-glow-blue">
                <svg className="h-6 w-6 text-cyber-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Total Traffic</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-green glow-text">
                      {formatBytes(stats.total_bytes)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="cyber-stat-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="cyber-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-cyber-neon-purple/10 rounded-lg p-3 neon-glow-purple">
                <svg className="h-6 w-6 text-cyber-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Protocols</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-green glow-text">
                      {Object.keys(stats.protocols).length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="cyber-stat-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="cyber-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-cyber-neon-pink/10 rounded-lg p-3 neon-glow-red">
                <svg className="h-6 w-6 text-cyber-neon-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Active IPs</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-green glow-text">
                      {Object.keys(stats.ips).length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Anomaly Status */}
      <div className="cyber-card mb-8">
        <div className="cyber-card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <div className="mr-4">
                {anomalyStatus === 'malicious' && (
                  <div className="anomaly-malicious px-4 py-2">
                    🔴 MALICIOUS ACTIVITY DETECTED
                  </div>
                )}
                {anomalyStatus === 'suspicious' && (
                  <div className="anomaly-suspicious px-4 py-2">
                    🟠 SUSPICIOUS ACTIVITY DETECTED
                  </div>
                )}
                {anomalyStatus === 'normal' && (
                  <div className="anomaly-normal px-4 py-2">
                    🟢 NETWORK STATUS NORMAL
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-cyber-neon-green">AI Threat Detection</h3>
                <p className="text-sm text-cyber-neon-blue">
                  {stats.anomalies && stats.anomalies.length > 0 
                    ? `${stats.anomalies.length} anomalies detected` 
                    : 'No anomalies detected'}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button className="cyber-btn-primary">
                View Threat Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="cyber-card mb-8">
        <div className="cyber-card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-cyber-neon-green">Traffic Capture</h2>
              <p className="mt-1 text-sm text-cyber-neon-blue">Real-time network monitoring in progress</p>
            </div>
            <div className="flex space-x-3 mt-3 sm:mt-0">
              <button
                onClick={stopCapture}
                className="cyber-btn-danger px-4 py-2 text-sm font-mono rounded shadow-md hover:shadow-lg transition-all duration-200"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Stop Capture
              </button>
            </div>
          </div>
        </div>
        
        <div className="cyber-card-body">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <div className="flex items-center text-cyber-neon-green">
                <div className="w-3 h-3 rounded-full mr-2 bg-cyber-neon-green animate-pulse"></div>
                <span className="text-sm font-medium">Live Capture Active</span>
              </div>
              <div className="ml-4 flex items-center text-cyber-neon-blue">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Updated just now</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <div className="cyber-badge cyber-badge-primary">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Real-time
              </div>
              <div className="cyber-badge cyber-badge-success">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="cyber-card mb-8">
        <div className="border-b border-cyber-border">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', name: 'Overview', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
              { id: 'anomalies', name: 'Threat Detection', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
              { id: 'geoip', name: 'GeoIP Map', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'threats', name: 'Threat Intelligence', icon: 'M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01' }
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
      <div className="mb-8">
        {activeTab === 'overview' && (
          <div>
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="cyber-chart-container">
                <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Protocol Distribution</h3>
                <ProtocolChart protocols={stats.protocols} />
              </div>
              
              <div className="cyber-chart-container">
                <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Network Traffic (Bytes/Second)</h3>
                <BytesChart packetHistory={stats.packet_history} />
              </div>
              
              <div className="cyber-chart-container">
                <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Top Talkers</h3>
                <TopTalkersChart topTalkers={stats.top_talkers} />
              </div>
              
              <div className="cyber-chart-container">
                <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Traffic Heatmap</h3>
                <TrafficHeatmap packetHistory={stats.packet_history} />
              </div>
            </div>

            {/* Protocol Breakdown */}
            <div className="cyber-card mb-8">
              <div className="cyber-card-header">
                <h3 className="text-lg font-bold text-cyber-neon-green">Protocol Breakdown</h3>
              </div>
              <div className="cyber-card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {getTopProtocols().map((protocol, index) => (
                    <motion.div 
                      key={index} 
                      className="cyber-card bg-cyber-gray-800 hover:bg-cyber-gray-700 transition-colors duration-200"
                      whileHover={{ y: -5 }}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-cyber-neon-blue">{protocol.name}</h4>
                          <span className="cyber-badge cyber-badge-primary text-xs">
                            {((protocol.count / stats.total_packets) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-2xl font-bold text-cyber-neon-green">{protocol.count.toLocaleString()}</p>
                          <p className="text-xs text-cyber-neon-blue">packets</p>
                        </div>
                        <div className="mt-3 w-full bg-cyber-gray-700 rounded-full h-2">
                          <div 
                            className="bg-cyber-neon-green h-2 rounded-full" 
                            style={{ width: `${Math.min((protocol.count / stats.total_packets) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top IPs */}
            <div className="cyber-card mb-8">
              <div className="cyber-card-header">
                <h3 className="text-lg font-bold text-cyber-neon-green">Top IP Addresses</h3>
              </div>
              <div className="cyber-card-body">
                <div className="overflow-x-auto">
                  <table className="cyber-table">
                    <thead>
                      <tr className="cyber-table-head">
                        <th scope="col" className="cyber-table-cell text-left">IP Address</th>
                        <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                        <th scope="col" className="cyber-table-cell text-left">Packets</th>
                        <th scope="col" className="cyber-table-cell text-left">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-border">
                      {getTopIPs().map((ipData, index) => (
                        <motion.tr 
                          key={index} 
                          className="cyber-table-row"
                          whileHover={{ backgroundColor: 'rgba(26, 26, 46, 0.5)' }}
                        >
                          <td className="cyber-table-cell font-medium text-cyber-neon-green">
                            <div className="flex items-center">
                              <div className="bg-cyber-gray-700 rounded-full p-1 mr-2">
                                <svg className="h-3 w-3 text-cyber-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              {ipData.ip}
                            </div>
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {formatBytes(ipData.bytes)}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {ipData.packets.toLocaleString()}
                          </td>
                          <td className="cyber-table-cell">
                            <div className="flex items-center">
                              <div className="w-24 bg-cyber-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-cyber-neon-green h-2 rounded-full" 
                                  style={{ width: `${Math.min((ipData.bytes / stats.total_bytes) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-cyber-neon-blue">
                                {((ipData.bytes / stats.total_bytes) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Live Traffic Table */}
            <div className="cyber-traffic-table">
              <div className="cyber-traffic-table-header">
                <h3 className="text-lg font-bold text-cyber-neon-green">Live Traffic</h3>
                <p className="mt-1 text-sm text-cyber-neon-blue">Real-time network packet information</p>
              </div>
              <div className="cyber-traffic-table-body">
                <LiveTrafficTable packetHistory={stats.packet_history} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'anomalies' && (
          <AnomalyDetection anomalies={stats.anomalies} />
        )}

        {activeTab === 'geoip' && (
          <GeoIPMap packetHistory={stats.packet_history} />
        )}

        {activeTab === 'threats' && (
          <ThreatIntelligence />
        )}
      </div>
    </div>
  );
};

export default CyberDashboard;