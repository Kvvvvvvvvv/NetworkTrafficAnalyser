import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PrivacyMaskedIPs = () => {
  const [privacyIPs, setPrivacyIPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_vpn: 0,
    total_proxy: 0,
    total_tor: 0
  });

  useEffect(() => {
    fetchPrivacyMaskedIPs();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPrivacyMaskedIPs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrivacyMaskedIPs = async () => {
    try {
      setLoading(true);
      // Fetch from the backend API
      const response = await fetch('/api/get_vpn_proxy_tor_detection');
      const data = await response.json();
      
      if (data.status === 'success') {
        const vpnData = data.vpn_proxy_tor_data;
        setStats({
          total_vpn: vpnData.total_vpn,
          total_proxy: vpnData.total_proxy,
          total_tor: vpnData.total_tor
        });
        
        // Combine all privacy IPs
        const allPrivacyIPs = [
          ...vpnData.vpn_ips.map(ip => ({ ...ip, type: ['VPN'] })),
          ...vpnData.proxy_ips.map(ip => ({ ...ip, type: ['Proxy'] })),
          ...vpnData.tor_ips.map(ip => ({ ...ip, type: ['Tor'] }))
        ];
        
        // Sort by bytes
        allPrivacyIPs.sort((a, b) => b.bytes - a.bytes);
        setPrivacyIPs(allPrivacyIPs);
      } else {
        setError(data.message || 'Failed to fetch privacy masked IPs');
      }
    } catch (err) {
      setError('Failed to fetch privacy masked IPs: ' + err.message);
      console.error('Error fetching privacy masked IPs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPrivacyType = (types) => {
    if (types.includes('Tor')) return { type: 'Tor', color: 'text-cyber-neon-purple', bg: 'bg-cyber-neon-purple/10' };
    if (types.includes('Proxy')) return { type: 'Proxy', color: 'text-cyber-neon-orange', bg: 'bg-cyber-neon-orange/10' };
    if (types.includes('VPN')) return { type: 'VPN', color: 'text-cyber-neon-pink', bg: 'bg-cyber-neon-pink/10' };
    return { type: 'Unknown', color: 'text-cyber-neon-blue', bg: 'bg-cyber-neon-blue/10' };
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-neon-green"></div>
            <span className="ml-3 text-cyber-neon-green">Loading privacy masked IPs...</span>
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
              onClick={fetchPrivacyMaskedIPs}
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
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-stat-card">
          <div className="cyber-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-cyber-neon-pink/10 rounded-lg p-3 neon-glow-pink">
                <svg className="h-6 w-6 text-cyber-neon-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">VPN IPs</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-pink glow-text">
                      {stats.total_vpn}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-stat-card">
          <div className="cyber-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-cyber-neon-orange/10 rounded-lg p-3 neon-glow-orange">
                <svg className="h-6 w-6 text-cyber-neon-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Proxy IPs</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-orange glow-text">
                      {stats.total_proxy}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-stat-card">
          <div className="cyber-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-cyber-neon-purple/10 rounded-lg p-3 neon-glow-purple">
                <svg className="h-6 w-6 text-cyber-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Tor IPs</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-purple glow-text">
                      {stats.total_tor}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Masked IPs Table */}
      <div className="cyber-card">
        <div className="cyber-card-header">
          <h3 className="text-lg font-bold text-cyber-neon-green">Privacy Masked IPs</h3>
          <p className="text-cyber-neon-blue mt-1">
            VPN, Proxy, and Tor nodes detected in network traffic
          </p>
        </div>
        <div className="cyber-card-body">
          {privacyIPs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-cyber-neon-green text-xl mb-2">No privacy masked IPs detected</div>
              <p className="text-cyber-neon-blue mt-2 mb-4">No VPN, Proxy, or Tor nodes found in network traffic</p>
              <div className="bg-cyber-gray-800 rounded-lg p-4 max-w-2xl mx-auto">
                <h4 className="text-cyber-neon-green font-bold mb-2">Why am I seeing this?</h4>
                <ul className="text-cyber-neon-blue text-left list-disc pl-5 space-y-1">
                  <li>No privacy-masked traffic (VPN/Proxy/Tor) has been detected yet</li>
                  <li>Packet capture may still be initializing</li>
                  <li>Your network traffic may not be using privacy services</li>
                  <li>IP reputation services may still be updating</li>
                </ul>
                <button 
                  className="cyber-btn-primary mt-4"
                  onClick={fetchPrivacyMaskedIPs}
                >
                  Refresh Data
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="cyber-table">
                <thead>
                  <tr className="cyber-table-head">
                    <th scope="col" className="cyber-table-cell text-left">IP Address</th>
                    <th scope="col" className="cyber-table-cell text-left">Type</th>
                    <th scope="col" className="cyber-table-cell text-left">Service</th>
                    <th scope="col" className="cyber-table-cell text-left">Organization</th>
                    <th scope="col" className="cyber-table-cell text-left">ASN</th>
                    <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border">
                  {privacyIPs.map((ipData, index) => {
                    const privacyType = getPrivacyType(ipData.type);
                    return (
                      <motion.tr 
                        key={index} 
                        className="cyber-table-row"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="cyber-table-cell font-medium text-cyber-neon-green">
                          <div className="flex items-center">
                            <div className={`rounded-full p-1 mr-2 ${privacyType.bg}`}>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            {ipData.ip}
                          </div>
                        </td>
                        <td className="cyber-table-cell">
                          <span className={`cyber-badge ${privacyType.bg} ${privacyType.color}`}>
                            {privacyType.type}
                          </span>
                        </td>
                        <td className="cyber-table-cell text-cyber-neon-blue">
                          {ipData.service_name || 'Unknown'}
                        </td>
                        <td className="cyber-table-cell text-cyber-neon-blue">
                          {ipData.org || 'Unknown'}
                        </td>
                        <td className="cyber-table-cell text-cyber-neon-blue">
                          {ipData.asn || 'Unknown'}
                        </td>
                        <td className="cyber-table-cell text-cyber-neon-blue">
                          {formatBytes(ipData.bytes)}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyMaskedIPs;