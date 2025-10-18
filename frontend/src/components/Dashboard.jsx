import React, { useState, useEffect } from 'react';
import LiveTrafficTable from './LiveTrafficTable';
import ProtocolChart from './ProtocolChart';
import BytesChart from './BytesChart';
import TopTalkersChart from './TopTalkersChart';
import TrafficHeatmap from './TrafficHeatmap';

const Dashboard = ({ socket, onStopCapture }) => {
  const [stats, setStats] = useState({
    total_packets: 0,
    total_bytes: 0,
    protocols: {},
    ips: {},
    top_talkers: [],
    packet_history: []
  });

  useEffect(() => {
    if (!socket) return;

    socket.on('update_stats', (data) => {
      setStats(data);
    });

    return () => {
      socket.off('update_stats');
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

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="nta-stat-card">
          <div className="nta-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-900/30 rounded-lg p-3">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-400 truncate">Total Packets</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-slate-100">
                      {stats.total_packets.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="nta-stat-card">
          <div className="nta-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-900/30 rounded-lg p-3">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-400 truncate">Total Traffic</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-slate-100">
                      {formatBytes(stats.total_bytes)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="nta-stat-card">
          <div className="nta-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-900/30 rounded-lg p-3">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-400 truncate">Protocols</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-slate-100">
                      {Object.keys(stats.protocols).length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="nta-stat-card">
          <div className="nta-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-900/30 rounded-lg p-3">
                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-400 truncate">Active IPs</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-slate-100">
                      {Object.keys(stats.ips).length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="nta-stat-card">
          <div className="nta-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-cyan-900/30 rounded-lg p-3">
                <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-400 truncate">Packets/Second</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-slate-100">
                      {calculatePps()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="nta-stat-card">
          <div className="nta-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-rose-900/30 rounded-lg p-3">
                <svg className="h-6 w-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-400 truncate">Top Protocol</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-slate-100">
                      {getTopProtocols()[0]?.name || 'N/A'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="nta-stat-card">
          <div className="nta-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-900/30 rounded-lg p-3">
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-400 truncate">Top IP</dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-bold text-slate-100 truncate">
                      {getTopIPs()[0]?.ip || 'N/A'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="nta-card mb-8">
        <div className="nta-card-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Traffic Capture</h2>
              <p className="mt-1 text-sm text-slate-400">Real-time network monitoring in progress</p>
            </div>
            <button
              onClick={stopCapture}
              className="nta-btn-danger mt-3 sm:mt-0 px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 glow-red"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Capture
            </button>
          </div>
        </div>
        
        <div className="nta-card-body">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <div className="flex items-center text-blue-400">
                <div className="w-3 h-3 rounded-full mr-2 bg-blue-500 animate-pulse"></div>
                <span className="text-sm font-medium">Live Capture Active</span>
              </div>
              <div className="ml-4 flex items-center text-slate-400">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Updated just now</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <div className="nta-badge nta-badge-primary">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Real-time
              </div>
              <div className="nta-badge nta-badge-success">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="nta-chart-container">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Protocol Distribution</h3>
          <ProtocolChart protocols={stats.protocols} />
        </div>
        
        <div className="nta-chart-container">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Network Traffic (Bytes/Second)</h3>
          <BytesChart packetHistory={stats.packet_history} />
        </div>
        
        <div className="nta-chart-container">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Top Talkers</h3>
          <TopTalkersChart topTalkers={stats.top_talkers} />
        </div>
        
        <div className="nta-chart-container">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Traffic Heatmap</h3>
          <TrafficHeatmap packetHistory={stats.packet_history} />
        </div>
      </div>

      {/* Protocol Breakdown */}
      <div className="nta-card mb-8">
        <div className="nta-card-header">
          <h3 className="text-lg font-bold text-slate-100">Protocol Breakdown</h3>
        </div>
        <div className="nta-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {getTopProtocols().map((protocol, index) => (
              <div key={index} className="nta-card bg-slate-800/50 hover:bg-slate-700/50 transition-colors duration-200">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-300">{protocol.name}</h4>
                    <span className="nta-badge nta-badge-primary text-xs">
                      {((protocol.count / stats.total_packets) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-slate-100">{protocol.count.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">packets</p>
                  </div>
                  <div className="mt-3 w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((protocol.count / stats.total_packets) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top IPs */}
      <div className="nta-card mb-8">
        <div className="nta-card-header">
          <h3 className="text-lg font-bold text-slate-100">Top IP Addresses</h3>
        </div>
        <div className="nta-card-body">
          <div className="overflow-x-auto">
            <table className="nta-table">
              <thead>
                <tr className="nta-table-head">
                  <th scope="col" className="nta-table-cell text-left">IP Address</th>
                  <th scope="col" className="nta-table-cell text-left">Traffic</th>
                  <th scope="col" className="nta-table-cell text-left">Packets</th>
                  <th scope="col" className="nta-table-cell text-left">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {getTopIPs().map((ipData, index) => (
                  <tr key={index} className="nta-table-row">
                    <td className="nta-table-cell font-medium text-slate-100">
                      <div className="flex items-center">
                        <div className="bg-slate-700 rounded-full p-1 mr-2">
                          <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        {ipData.ip}
                      </div>
                    </td>
                    <td className="nta-table-cell text-slate-300">
                      {formatBytes(ipData.bytes)}
                    </td>
                    <td className="nta-table-cell text-slate-300">
                      {ipData.packets.toLocaleString()}
                    </td>
                    <td className="nta-table-cell">
                      <div className="flex items-center">
                        <div className="w-24 bg-slate-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${Math.min((ipData.bytes / stats.total_bytes) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-400">
                          {((ipData.bytes / stats.total_bytes) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Traffic Table */}
      <div className="nta-traffic-table">
        <div className="nta-traffic-table-header">
          <h3 className="text-lg font-bold text-slate-100">Live Traffic</h3>
          <p className="mt-1 text-sm text-slate-400">Real-time network packet information</p>
        </div>
        <div className="nta-traffic-table-body">
          <LiveTrafficTable packetHistory={stats.packet_history} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;