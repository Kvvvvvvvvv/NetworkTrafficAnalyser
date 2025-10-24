import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FlaggedIPs = () => {
  const [flaggedIPs, setFlaggedIPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFlaggedIPs();
    // Refresh every 30 seconds
    const interval = setInterval(fetchFlaggedIPs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchFlaggedIPs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get_flagged_ips');
      const data = await response.json();
      
      if (data.status === 'success') {
        setFlaggedIPs(data.flagged_ips);
      } else {
        setError(data.message || 'Failed to fetch flagged IPs');
      }
    } catch (err) {
      setError('Failed to fetch flagged IPs: ' + err.message);
      console.error('Error fetching flagged IPs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskClass = (riskScore) => {
    if (riskScore >= 80) return 'anomaly-malicious';
    if (riskScore >= 60) return 'anomaly-suspicious';
    if (riskScore >= 40) return 'cyber-badge-warning';
    return 'cyber-badge-success';
  };

  const getRiskLabel = (riskScore) => {
    if (riskScore >= 80) return 'Critical';
    if (riskScore >= 60) return 'High';
    if (riskScore >= 40) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-neon-green"></div>
            <span className="ml-3 text-cyber-neon-green">Loading flagged IPs...</span>
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
              onClick={fetchFlaggedIPs}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card">
      <div className="cyber-card-header">
        <h3 className="text-lg font-bold text-cyber-neon-green">⚠️ Flagged IPs</h3>
        <p className="text-cyber-neon-blue mt-1">
          Malicious or suspicious IP addresses detected in real-time
        </p>
      </div>
      <div className="cyber-card-body">
        {flaggedIPs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-cyber-neon-green text-xl mb-2">No flagged IPs detected</div>
            <p className="text-cyber-neon-blue mt-2 mb-4">All IP addresses appear to be clean</p>
            <div className="bg-cyber-gray-800 rounded-lg p-4 max-w-2xl mx-auto">
              <h4 className="text-cyber-neon-green font-bold mb-2">Why am I seeing this?</h4>
              <ul className="text-cyber-neon-blue text-left list-disc pl-5 space-y-1">
                <li>No malicious traffic has been detected yet</li>
                <li>Packet capture may still be initializing</li>
                <li>Your network traffic may be clean (good!)</li>
                <li>Threat intelligence feeds may still be updating</li>
              </ul>
              <button 
                className="cyber-btn-primary mt-4"
                onClick={fetchFlaggedIPs}
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
                  <th scope="col" className="cyber-table-cell text-left">Risk Level</th>
                  <th scope="col" className="cyber-table-cell text-left">Threat Type</th>
                  <th scope="col" className="cyber-table-cell text-left">Reports</th>
                  <th scope="col" className="cyber-table-cell text-left">Country</th>
                  <th scope="col" className="cyber-table-cell text-left">ISP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {flaggedIPs.map((ipData, index) => (
                  <motion.tr 
                    key={index} 
                    className="cyber-table-row"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="cyber-table-cell font-medium text-cyber-neon-green">
                      <div className="flex items-center">
                        <div className="bg-cyber-gray-700 rounded-full p-1 mr-2">
                          <svg className="h-3 w-3 text-cyber-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        {ipData.ip}
                      </div>
                    </td>
                    <td className="cyber-table-cell">
                      <span className={`cyber-badge ${getRiskClass(ipData.risk_score)}`}>
                        {getRiskLabel(ipData.risk_score)}
                      </span>
                    </td>
                    <td className="cyber-table-cell text-cyber-neon-blue">
                      {ipData.threat_type || 'Unknown'}
                    </td>
                    <td className="cyber-table-cell text-cyber-neon-blue">
                      {ipData.reports}
                    </td>
                    <td className="cyber-table-cell text-cyber-neon-blue">
                      {ipData.country || 'Unknown'}
                    </td>
                    <td className="cyber-table-cell text-cyber-neon-blue">
                      {ipData.isp || 'Unknown'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlaggedIPs;