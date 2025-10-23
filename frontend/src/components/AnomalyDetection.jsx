import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AnomalyDetection = ({ anomalies }) => {
  const [timeRange, setTimeRange] = useState('24h');

  // Mock data for demonstration
  const mockAnomalies = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      type: 'HIGH_TRAFFIC',
      severity: 'WARNING',
      message: 'Unusual traffic spike detected from 192.168.1.105',
      sourceIP: '192.168.1.105',
      destinationIP: '203.0.113.5',
      protocol: 'TCP',
      size: 1500000
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      type: 'AI_ANOMALY',
      severity: 'CRITICAL',
      message: 'Suspicious behavior pattern detected',
      sourceIP: '10.0.0.42',
      destinationIP: '198.51.100.23',
      protocol: 'UDP',
      size: 850000
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      type: 'SUSPICIOUS_IP',
      severity: 'WARNING',
      message: 'Known malicious IP attempting connection',
      sourceIP: '192.0.2.178',
      destinationIP: '192.168.1.5',
      protocol: 'TCP',
      size: 1200000
    }
  ];

  const displayedAnomalies = anomalies && anomalies.length > 0 ? anomalies : mockAnomalies;

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'anomaly-malicious';
      case 'WARNING':
        return 'anomaly-suspicious';
      default:
        return 'anomaly-normal';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return '🔴';
      case 'WARNING':
        return '🟠';
      default:
        return '🟢';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-cyber-neon-green">AI Threat Detection</h2>
              <p className="text-cyber-neon-blue mt-1">
                Real-time anomaly detection powered by machine learning
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <span className="text-cyber-neon-blue">Time Range:</span>
                <select 
                  className="bg-cyber-gray-800 text-cyber-neon-green border border-cyber-border rounded px-3 py-1"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="1h">Last 1 Hour</option>
                  <option value="6h">Last 6 Hours</option>
                  <option value="12h">Last 12 Hours</option>
                  <option value="24h">Last 24 Hours</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-stat-card">
          <div className="cyber-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-cyber-neon-red/10 rounded-lg p-3 neon-glow-red">
                <svg className="h-6 w-6 text-cyber-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Critical Threats</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-red glow-text">
                      {displayedAnomalies.filter(a => a.severity === 'CRITICAL').length}
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
              <div className="flex-shrink-0 bg-cyber-neon-yellow/10 rounded-lg p-3 neon-glow-red">
                <svg className="h-6 w-6 text-cyber-neon-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Warnings</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-yellow glow-text">
                      {displayedAnomalies.filter(a => a.severity === 'WARNING').length}
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
              <div className="flex-shrink-0 bg-cyber-neon-green/10 rounded-lg p-3 neon-glow-green">
                <svg className="h-6 w-6 text-cyber-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Total Detected</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-green glow-text">
                      {displayedAnomalies.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="cyber-card">
        <div className="cyber-card-header">
          <h3 className="text-lg font-bold text-cyber-neon-green">Detected Anomalies</h3>
        </div>
        <div className="cyber-card-body">
          <div className="space-y-4">
            {displayedAnomalies.map((anomaly) => (
              <motion.div
                key={anomaly.id}
                className="cyber-card bg-cyber-gray-800 border-l-4 border-cyber-neon-red"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="cyber-card-body">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start">
                      <div className="text-2xl mr-3">
                        {getSeverityIcon(anomaly.severity)}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-lg font-bold text-cyber-neon-green">
                            {anomaly.type.replace('_', ' ')}
                          </h4>
                          <span className={`ml-3 text-xs ${getSeverityClass(anomaly.severity)}`}>
                            {anomaly.severity}
                          </span>
                        </div>
                        <p className="text-cyber-neon-blue mt-1">
                          {anomaly.message}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="cyber-badge cyber-badge-primary">
                            {anomaly.sourceIP} → {anomaly.destinationIP}
                          </span>
                          <span className="cyber-badge cyber-badge-purple">
                            {anomaly.protocol}
                          </span>
                          <span className="cyber-badge cyber-badge-success">
                            {formatBytes(anomaly.size)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0 text-sm text-cyber-neon-blue">
                      {formatTime(anomaly.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Model Info */}
      <div className="cyber-card">
        <div className="cyber-card-header">
          <h3 className="text-lg font-bold text-cyber-neon-green">AI Detection Model</h3>
        </div>
        <div className="cyber-card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-cyber-gray-800 rounded-lg">
              <h4 className="font-bold text-cyber-neon-blue">Model Type</h4>
              <p className="text-cyber-neon-green mt-1">Isolation Forest</p>
            </div>
            <div className="p-4 bg-cyber-gray-800 rounded-lg">
              <h4 className="font-bold text-cyber-neon-blue">Features Analyzed</h4>
              <p className="text-cyber-neon-green mt-1">Packet size, protocol, timing</p>
            </div>
            <div className="p-4 bg-cyber-gray-800 rounded-lg">
              <h4 className="font-bold text-cyber-neon-blue">Accuracy</h4>
              <p className="text-cyber-neon-green mt-1">92.7%</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-cyber-gray-800 rounded-lg">
            <h4 className="font-bold text-cyber-neon-blue">Model Status</h4>
            <div className="flex items-center mt-2">
              <div className="w-3 h-3 rounded-full bg-cyber-neon-green mr-2 animate-pulse"></div>
              <span className="text-cyber-neon-green">Active and Learning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetection;