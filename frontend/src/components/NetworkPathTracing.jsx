import React, { useState } from 'react';
import { motion } from 'framer-motion';

const NetworkPathTracing = () => {
  const [targetIP, setTargetIP] = useState('');
  const [traceResults, setTraceResults] = useState(null);
  const [batchIPs, setBatchIPs] = useState('');
  const [batchResults, setBatchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('single');

  const performTraceroute = async () => {
    if (!targetIP) {
      setError('Please enter a target IP address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would call the backend API
      // const response = await fetch('/api/network_path_trace', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ip: targetIP })
      // });
      // const data = await response.json();
      
      // For now, using mock data
      const mockData = {
        status: 'success',
        traceroute: {
          target_ip: targetIP,
          hops: [
            { hop: 1, hostname: 'router.local', latency_ms: 1.2 },
            { hop: 2, hostname: '192.168.1.1', latency_ms: 2.1 },
            { hop: 3, hostname: '10.0.0.1', latency_ms: 15.3 },
            { hop: 4, hostname: 'core-router.example.com', latency_ms: 22.7 },
            { hop: 5, hostname: 'border-router.example.com', latency_ms: 35.2 },
            { hop: 6, hostname: '198.51.100.45', latency_ms: 42.8 },
            { hop: 7, hostname: 'target.example.com', latency_ms: 58.1 }
          ],
          success: true
        },
        whois: {
          ip: targetIP,
          organization: 'Example Corporation',
          country: 'United States',
          netname: 'EXAMPLE-CORP'
        }
      };
      
      setTraceResults(mockData);
    } catch (err) {
      setError('Failed to perform traceroute: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const performBatchTraceroute = async () => {
    if (!batchIPs) {
      setError('Please enter IP addresses');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Parse IPs from textarea
      const ipList = batchIPs.split('\n').filter(ip => ip.trim()).slice(0, 10);
      
      // In a real implementation, this would call the backend API
      // const response = await fetch('/api/batch_network_trace', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ips: ipList })
      // });
      // const data = await response.json();
      
      // For now, using mock data
      const mockResults = ipList.map((ip, index) => ({
        ip: ip,
        traceroute: {
          target_ip: ip,
          hops: [
            { hop: 1, hostname: 'router.local', latency_ms: 1.2 + index },
            { hop: 2, hostname: '192.168.1.1', latency_ms: 2.1 + index },
            { hop: 3, hostname: '10.0.0.1', latency_ms: 15.3 + index },
            { hop: 4, hostname: `core-router-${index}.example.com`, latency_ms: 22.7 + index },
            { hop: 5, hostname: 'border-router.example.com', latency_ms: 35.2 + index },
            { hop: 6, hostname: `198.51.100.${45 + index}`, latency_ms: 42.8 + index }
          ],
          success: true
        },
        whois: {
          ip: ip,
          organization: `Organization ${index}`,
          country: ['United States', 'Germany', 'Japan', 'United Kingdom'][index % 4],
          netname: `NET-${index}`
        }
      }));
      
      setBatchResults(mockResults);
    } catch (err) {
      setError('Failed to perform batch traceroute: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTraceResults(null);
    setBatchResults([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-cyber-neon-green">Network Path Tracing</h2>
              <p className="text-cyber-neon-blue mt-1">
                Trace network paths and perform WHOIS lookups for IP addresses
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                className="cyber-btn-secondary"
                onClick={clearResults}
              >
                Clear Results
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
              { id: 'single', name: 'Single Trace', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'batch', name: 'Batch Trace', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' }
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
          {activeTab === 'single' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Single IP Traceroute</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    className="w-full bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green placeholder-cyber-neon-blue px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyber-neon-green"
                    placeholder="Enter target IP address (e.g., 8.8.8.8)"
                    value={targetIP}
                    onChange={(e) => setTargetIP(e.target.value)}
                  />
                </div>
                <div>
                  <button
                    className="w-full cyber-btn-primary py-2 px-4"
                    onClick={performTraceroute}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Tracing...
                      </span>
                    ) : (
                      'Trace Route'
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="cyber-card bg-cyber-gray-800 mb-6">
                  <div className="cyber-card-body">
                    <div className="text-cyber-neon-red">Error: {error}</div>
                  </div>
                </div>
              )}

              {traceResults && (
                <div className="space-y-6">
                  <div className="cyber-card bg-cyber-gray-800">
                    <div className="cyber-card-header">
                      <h4 className="text-md font-bold text-cyber-neon-green">Traceroute Results for {traceResults.traceroute.target_ip}</h4>
                    </div>
                    <div className="cyber-card-body">
                      <div className="overflow-x-auto">
                        <table className="cyber-table">
                          <thead>
                            <tr className="cyber-table-head">
                              <th scope="col" className="cyber-table-cell text-left">Hop</th>
                              <th scope="col" className="cyber-table-cell text-left">Hostname</th>
                              <th scope="col" className="cyber-table-cell text-left">Latency</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-cyber-border">
                            {traceResults.traceroute.hops.map((hop, index) => (
                              <motion.tr 
                                key={index} 
                                className="cyber-table-row"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <td className="cyber-table-cell font-medium text-cyber-neon-green">
                                  {hop.hop}
                                </td>
                                <td className="cyber-table-cell text-cyber-neon-blue">
                                  {hop.hostname}
                                </td>
                                <td className="cyber-table-cell text-cyber-neon-blue">
                                  {hop.latency_ms ? `${hop.latency_ms.toFixed(2)} ms` : '*'}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="cyber-card bg-cyber-gray-800">
                    <div className="cyber-card-header">
                      <h4 className="text-md font-bold text-cyber-neon-green">WHOIS Information</h4>
                    </div>
                    <div className="cyber-card-body">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-cyber-neon-blue text-sm">IP Address</p>
                          <p className="text-cyber-neon-green">{traceResults.whois.ip}</p>
                        </div>
                        <div>
                          <p className="text-cyber-neon-blue text-sm">Organization</p>
                          <p className="text-cyber-neon-green">{traceResults.whois.organization}</p>
                        </div>
                        <div>
                          <p className="text-cyber-neon-blue text-sm">Country</p>
                          <p className="text-cyber-neon-green">{traceResults.whois.country}</p>
                        </div>
                        <div>
                          <p className="text-cyber-neon-blue text-sm">Netname</p>
                          <p className="text-cyber-neon-green">{traceResults.whois.netname}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'batch' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Batch IP Traceroute</h3>
              <div className="mb-6">
                <textarea
                  className="w-full h-32 bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green placeholder-cyber-neon-blue px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyber-neon-green"
                  placeholder="Enter IP addresses (one per line, max 10)&#10;Example:&#10;8.8.8.8&#10;1.1.1.1&#10;208.67.222.222"
                  value={batchIPs}
                  onChange={(e) => setBatchIPs(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  className="cyber-btn-primary py-2 px-4"
                  onClick={performBatchTraceroute}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Tracing...
                    </span>
                  ) : (
                    'Trace All Routes'
                  )}
                </button>
                <button
                  className="cyber-btn-secondary py-2 px-4"
                  onClick={() => setBatchIPs('')}
                >
                  Clear
                </button>
              </div>

              {error && (
                <div className="cyber-card bg-cyber-gray-800 mt-6">
                  <div className="cyber-card-body">
                    <div className="text-cyber-neon-red">Error: {error}</div>
                  </div>
                </div>
              )}

              {batchResults.length > 0 && (
                <div className="mt-6 space-y-6">
                  <h4 className="text-lg font-bold text-cyber-neon-green">Batch Results</h4>
                  {batchResults.map((result, index) => (
                    <motion.div
                      key={index}
                      className="cyber-card bg-cyber-gray-800"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="cyber-card-header">
                        <h5 className="text-md font-bold text-cyber-neon-green">IP: {result.ip}</h5>
                      </div>
                      <div className="cyber-card-body">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h6 className="text-sm font-bold text-cyber-neon-green mb-2">Traceroute</h6>
                            <div className="overflow-x-auto">
                              <table className="cyber-table text-xs">
                                <thead>
                                  <tr className="cyber-table-head">
                                    <th scope="col" className="cyber-table-cell text-left py-1">Hop</th>
                                    <th scope="col" className="cyber-table-cell text-left py-1">Hostname</th>
                                    <th scope="col" className="cyber-table-cell text-left py-1">Latency</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-cyber-border">
                                  {result.traceroute.hops.slice(0, 5).map((hop, hopIndex) => (
                                    <tr key={hopIndex} className="cyber-table-row">
                                      <td className="cyber-table-cell py-1 text-cyber-neon-green">
                                        {hop.hop}
                                      </td>
                                      <td className="cyber-table-cell py-1 text-cyber-neon-blue">
                                        {hop.hostname}
                                      </td>
                                      <td className="cyber-table-cell py-1 text-cyber-neon-blue">
                                        {hop.latency_ms ? `${hop.latency_ms.toFixed(2)} ms` : '*'}
                                      </td>
                                    </tr>
                                  ))}
                                  {result.traceroute.hops.length > 5 && (
                                    <tr className="cyber-table-row">
                                      <td colSpan="3" className="cyber-table-cell py-1 text-cyber-neon-blue text-center">
                                        ... and {result.traceroute.hops.length - 5} more hops
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div>
                            <h6 className="text-sm font-bold text-cyber-neon-green mb-2">WHOIS Info</h6>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-cyber-neon-blue">Organization</p>
                                <p className="text-cyber-neon-green truncate">{result.whois.organization}</p>
                              </div>
                              <div>
                                <p className="text-cyber-neon-blue">Country</p>
                                <p className="text-cyber-neon-green">{result.whois.country}</p>
                              </div>
                              <div>
                                <p className="text-cyber-neon-blue">Netname</p>
                                <p className="text-cyber-neon-green truncate">{result.whois.netname}</p>
                              </div>
                            </div>
                          </div>
                        </div>
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

export default NetworkPathTracing;