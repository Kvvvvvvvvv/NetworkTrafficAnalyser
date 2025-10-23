import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ThreatIntelligence = () => {
  const [activeTab, setActiveTab] = useState('blacklist');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock threat intelligence data
  const mockBlacklistData = [
    { ip: '192.168.1.100', threat: 'Malware Distribution', lastSeen: '2023-05-15', reports: 12, risk: 'High' },
    { ip: '10.0.0.50', threat: 'Brute Force Attempts', lastSeen: '2023-05-14', reports: 8, risk: 'Medium' },
    { ip: '172.16.0.75', threat: 'Phishing Campaign', lastSeen: '2023-05-12', reports: 15, risk: 'High' },
    { ip: '192.168.2.200', threat: 'DDoS Botnet', lastSeen: '2023-05-10', reports: 22, risk: 'Critical' },
    { ip: '10.10.10.10', threat: 'Spam Distribution', lastSeen: '2023-05-08', reports: 5, risk: 'Low' }
  ];

  const mockThreatReports = [
    { id: 1, title: 'Ransomware Activity Detected', source: 'VirusTotal', severity: 'High', date: '2023-05-15' },
    { id: 2, title: 'New Botnet C2 Infrastructure', source: 'AbuseIPDB', severity: 'Critical', date: '2023-05-14' },
    { id: 3, title: 'Emerging Phishing Domains', source: 'AlienVault', severity: 'Medium', date: '2023-05-12' },
    { id: 4, title: 'IoT Device Exploitation', source: 'Cisco Talos', severity: 'High', date: '2023-05-10' }
  ];

  const filteredBlacklist = mockBlacklistData.filter(item => 
    item.ip.includes(searchTerm) || item.threat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskClass = (risk) => {
    switch (risk) {
      case 'Critical':
        return 'anomaly-malicious';
      case 'High':
        return 'anomaly-suspicious';
      case 'Medium':
        return 'cyber-badge-warning';
      default:
        return 'cyber-badge-success';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-cyber-neon-green">Threat Intelligence</h2>
              <p className="text-cyber-neon-blue mt-1">
                Real-time threat feeds and malicious IP detection
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button className="cyber-btn-primary">
                Update Feeds
              </button>
              <button className="cyber-btn-secondary">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                      {mockBlacklistData.filter(item => item.risk === 'Critical').length}
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
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">High Risk IPs</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-yellow glow-text">
                      {mockBlacklistData.filter(item => item.risk === 'High').length}
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
              <div className="flex-shrink-0 bg-cyber-neon-blue/10 rounded-lg p-3 neon-glow-blue">
                <svg className="h-6 w-6 text-cyber-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Threat Reports</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-blue glow-text">
                      {mockThreatReports.length}
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
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Blocked IPs</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-green glow-text">
                      24
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="cyber-card">
        <div className="border-b border-cyber-border">
          <nav className="flex -mb-px">
            {[
              { id: 'blacklist', name: 'Blacklisted IPs', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
              { id: 'reports', name: 'Threat Reports', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { id: 'settings', name: 'Feed Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
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
          {activeTab === 'blacklist' && (
            <div>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-cyber-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green placeholder-cyber-neon-blue focus:outline-none focus:ring-2 focus:ring-cyber-neon-green"
                    placeholder="Search by IP or threat type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Blacklist Table */}
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr className="cyber-table-head">
                      <th scope="col" className="cyber-table-cell text-left">IP Address</th>
                      <th scope="col" className="cyber-table-cell text-left">Threat Type</th>
                      <th scope="col" className="cyber-table-cell text-left">Last Seen</th>
                      <th scope="col" className="cyber-table-cell text-left">Reports</th>
                      <th scope="col" className="cyber-table-cell text-left">Risk Level</th>
                      <th scope="col" className="cyber-table-cell text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {filteredBlacklist.map((item, index) => (
                      <motion.tr 
                        key={index} 
                        className="cyber-table-row"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <td className="cyber-table-cell font-medium text-cyber-neon-green">
                          <div className="flex items-center">
                            <div className="bg-cyber-gray-700 rounded-full p-1 mr-2">
                              <svg className="h-3 w-3 text-cyber-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            {item.ip}
                          </div>
                        </td>
                        <td className="cyber-table-cell text-cyber-neon-blue">
                          {item.threat}
                        </td>
                        <td className="cyber-table-cell text-cyber-neon-blue">
                          {item.lastSeen}
                        </td>
                        <td className="cyber-table-cell text-cyber-neon-blue">
                          {item.reports}
                        </td>
                        <td className="cyber-table-cell">
                          <span className={`cyber-badge ${getRiskClass(item.risk)}`}>
                            {item.risk}
                          </span>
                        </td>
                        <td className="cyber-table-cell">
                          <div className="flex space-x-2">
                            <button className="cyber-btn-primary text-xs px-2 py-1">
                              Block
                            </button>
                            <button className="cyber-btn-secondary text-xs px-2 py-1">
                              Details
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Latest Threat Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockThreatReports.map((report) => (
                  <motion.div
                    key={report.id}
                    className="cyber-card bg-cyber-gray-800"
                    whileHover={{ y: -5 }}
                  >
                    <div className="cyber-card-body">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-bold text-cyber-neon-green">{report.title}</h4>
                        <span className={`cyber-badge ${
                          report.severity === 'Critical' ? 'anomaly-malicious' :
                          report.severity === 'High' ? 'anomaly-suspicious' :
                          'cyber-badge-warning'
                        }`}>
                          {report.severity}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center text-sm text-cyber-neon-blue">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        {report.source}
                        <span className="mx-2">•</span>
                        {report.date}
                      </div>
                      <div className="mt-4">
                        <button className="cyber-btn-primary w-full">
                          View Full Report
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Threat Intelligence Feeds</h3>
              <div className="space-y-4">
                {[
                  { name: 'AbuseIPDB', status: 'Active', lastUpdate: '2023-05-15 14:30', type: 'Blacklist' },
                  { name: 'VirusTotal', status: 'Active', lastUpdate: '2023-05-15 14:25', type: 'Reputation' },
                  { name: 'AlienVault OTX', status: 'Active', lastUpdate: '2023-05-15 14:20', type: 'Threat Intel' },
                  { name: 'Emerging Threats', status: 'Inactive', lastUpdate: '2023-05-14 09:15', type: 'Ruleset' }
                ].map((feed, index) => (
                  <div key={index} className="cyber-card bg-cyber-gray-800">
                    <div className="cyber-card-body">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-cyber-neon-green">{feed.name}</h4>
                          <div className="flex items-center mt-1">
                            <span className={`cyber-badge ${
                              feed.status === 'Active' ? 'cyber-badge-success' : 'cyber-badge-danger'
                            }`}>
                              {feed.status}
                            </span>
                            <span className="cyber-badge cyber-badge-primary ml-2">
                              {feed.type}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 md:mt-0 text-cyber-neon-blue">
                          Last update: {feed.lastUpdate}
                        </div>
                        <div className="mt-3 md:mt-0">
                          <button className="cyber-btn-primary">
                            {feed.status === 'Active' ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatIntelligence;