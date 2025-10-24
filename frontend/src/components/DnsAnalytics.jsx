import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const DnsAnalytics = () => {
  const [dnsStats, setDnsStats] = useState({
    total_lookups: 0,
    successful_lookups: 0,
    failed_lookups: 0,
    suspicious_domains: 0
  });
  const [topDomains, setTopDomains] = useState([]);
  const [suspiciousDomains, setSuspiciousDomains] = useState([]);
  const [domainCountryCorrelation, setDomainCountryCorrelation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const mockDnsStats = {
    total_lookups: 12500,
    successful_lookups: 11250,
    failed_lookups: 1250,
    suspicious_domains: 25
  };

  const mockTopDomains = [
    { domain: 'google.com', lookups: 12500, unique_ips: 450, is_suspicious: false },
    { domain: 'facebook.com', lookups: 9800, unique_ips: 320, is_suspicious: false },
    { domain: 'youtube.com', lookups: 7500, unique_ips: 280, is_suspicious: false },
    { domain: 'amazon.com', lookups: 6200, unique_ips: 210, is_suspicious: false },
    { domain: 'microsoft.com', lookups: 4800, unique_ips: 180, is_suspicious: false },
    { domain: 'cloudflare.com', lookups: 3500, unique_ips: 150, is_suspicious: false },
    { domain: 'akamai.com', lookups: 2900, unique_ips: 120, is_suspicious: false },
    { domain: 'fastly.com', lookups: 1800, unique_ips: 95, is_suspicious: false },
    { domain: 'temp12345.tk', lookups: 1500, unique_ips: 85, is_suspicious: true },
    { domain: 'freehost.ga', lookups: 1200, unique_ips: 75, is_suspicious: true }
  ];

  const mockDomainCountryCorrelation = [
    { domain: 'google.com', country: 'United States', lookups: 4500, unique_ips: 180 },
    { domain: 'facebook.com', country: 'United States', lookups: 3200, unique_ips: 120 },
    { domain: 'youtube.com', country: 'United States', lookups: 2800, unique_ips: 110 },
    { domain: 'amazon.com', country: 'United States', lookups: 2100, unique_ips: 95 },
    { domain: 'baidu.com', country: 'China', lookups: 1900, unique_ips: 85 },
    { domain: 'yandex.ru', country: 'Russia', lookups: 1500, unique_ips: 75 },
    { domain: 'temp12345.tk', country: 'Germany', lookups: 1200, unique_ips: 65 },
    { domain: 'freehost.ga', country: 'Netherlands', lookups: 1000, unique_ips: 55 }
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
      // const dnsResponse = await fetch('/api/get_dns_analytics');
      // const correlationResponse = await fetch('/api/get_domain_correlation');
      
      // For now, using mock data
      setDnsStats(mockDnsStats);
      setTopDomains(mockTopDomains);
      setSuspiciousDomains(mockTopDomains.filter(d => d.is_suspicious));
      setDomainCountryCorrelation(mockDomainCountryCorrelation);
    } catch (err) {
      setError('Failed to fetch DNS analytics data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSuccessRate = () => {
    if (dnsStats.total_lookups === 0) return 0;
    return ((dnsStats.successful_lookups / dnsStats.total_lookups) * 100).toFixed(1);
  };

  const getSuspiciousRate = () => {
    if (dnsStats.total_lookups === 0) return 0;
    return ((dnsStats.suspicious_domains / dnsStats.total_lookups) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-neon-green"></div>
            <span className="ml-3 text-cyber-neon-green">Loading DNS analytics data...</span>
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
              <h2 className="text-xl font-bold text-cyber-neon-green">DNS & Domain Analytics</h2>
              <p className="text-cyber-neon-blue mt-1">
                Analysis of DNS lookups and domain activity
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

      {/* DNS Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="cyber-stat-card">
          <div className="cyber-stat-card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-cyber-neon-green/10 rounded-lg p-3 neon-glow-green">
                <svg className="h-6 w-6 text-cyber-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Total Lookups</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-green glow-text">
                      {dnsStats.total_lookups.toLocaleString()}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Success Rate</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-green glow-text">
                      {getSuccessRate()}%
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
              <div className="flex-shrink-0 bg-cyber-neon-yellow/10 rounded-lg p-3 neon-glow-yellow">
                <svg className="h-6 w-6 text-cyber-neon-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Failed Lookups</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-yellow glow-text">
                      {dnsStats.failed_lookups.toLocaleString()}
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
              <div className="flex-shrink-0 bg-cyber-neon-red/10 rounded-lg p-3 neon-glow-red">
                <svg className="h-6 w-6 text-cyber-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyber-neon-blue truncate">Suspicious Domains</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-cyber-neon-red glow-text">
                      {dnsStats.suspicious_domains}
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
              { id: 'overview', name: 'Overview', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
              { id: 'domains', name: 'Top Domains', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { id: 'suspicious', name: 'Suspicious Domains', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
              { id: 'correlation', name: 'Domain-Country Correlation', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
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
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">DNS Analytics Overview</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="cyber-card">
                  <div className="cyber-card-header">
                    <h4 className="text-md font-bold text-cyber-neon-green">DNS Lookup Success Rate</h4>
                  </div>
                  <div className="cyber-card-body">
                    <div className="flex items-center justify-center h-48">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-8 border-cyber-gray-700 flex items-center justify-center">
                          <div className="text-2xl font-bold text-cyber-neon-green">{getSuccessRate()}%</div>
                        </div>
                        <div 
                          className="absolute top-0 left-0 w-32 h-32 rounded-full border-8 border-cyber-neon-green clip-path-half"
                          style={{ 
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((getSuccessRate() * 3.6 - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((getSuccessRate() * 3.6 - 90) * Math.PI / 180)}%)` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-cyber-neon-blue">
                        {dnsStats.successful_lookups.toLocaleString()} successful out of {dnsStats.total_lookups.toLocaleString()} total lookups
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="cyber-card">
                  <div className="cyber-card-header">
                    <h4 className="text-md font-bold text-cyber-neon-green">DNS Lookup Distribution</h4>
                  </div>
                  <div className="cyber-card-body h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Successful', value: dnsStats.successful_lookups },
                            { name: 'Failed', value: dnsStats.failed_lookups }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                        >
                          <Cell fill="#00eeff" />
                          <Cell fill="#ff00c8" />
                        </Pie>
                        <Tooltip formatter={(value) => value.toLocaleString()} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'domains' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Most Queried Domains</h3>
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr className="cyber-table-head">
                      <th scope="col" className="cyber-table-cell text-left">Domain</th>
                      <th scope="col" className="cyber-table-cell text-left">DNS Lookups</th>
                      <th scope="col" className="cyber-table-cell text-left">Unique IPs</th>
                      <th scope="col" className="cyber-table-cell text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {topDomains
                      .sort((a, b) => b.lookups - a.lookups)
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
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                              {data.domain}
                            </div>
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.lookups.toLocaleString()}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.unique_ips}
                          </td>
                          <td className="cyber-table-cell">
                            {data.is_suspicious ? (
                              <span className="cyber-badge anomaly-suspicious">
                                Suspicious
                              </span>
                            ) : (
                              <span className="cyber-badge cyber-badge-success">
                                Clean
                              </span>
                            )}
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
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Suspicious Domains</h3>
              {suspiciousDomains.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-cyber-neon-green">No suspicious domains detected</div>
                  <p className="text-cyber-neon-blue mt-2">DNS activity appears normal</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="cyber-table">
                    <thead>
                      <tr className="cyber-table-head">
                        <th scope="col" className="cyber-table-cell text-left">Domain</th>
                        <th scope="col" className="cyber-table-cell text-left">DNS Lookups</th>
                        <th scope="col" className="cyber-table-cell text-left">Unique IPs</th>
                        <th scope="col" className="cyber-table-cell text-left">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-border">
                      {suspiciousDomains
                        .sort((a, b) => b.lookups - a.lookups)
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
                                  <svg className="h-3 w-3 text-cyber-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                </div>
                                {data.domain}
                              </div>
                            </td>
                            <td className="cyber-table-cell text-cyber-neon-blue">
                              {data.lookups.toLocaleString()}
                            </td>
                            <td className="cyber-table-cell text-cyber-neon-blue">
                              {data.unique_ips}
                            </td>
                            <td className="cyber-table-cell">
                              <span className="cyber-badge anomaly-malicious">
                                HIGH RISK
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

          {activeTab === 'correlation' && (
            <div>
              <h3 className="text-lg font-bold text-cyber-neon-green mb-4">Domain-Country Correlation</h3>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={domainCountryCorrelation}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 70,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="domain" 
                      stroke="#bd00ff" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tickFormatter={(value, index) => {
                        const item = domainCountryCorrelation[index];
                        return item ? `${item.domain} (${item.country})` : value;
                      }}
                    />
                    <YAxis stroke="#bd00ff" />
                    <Tooltip 
                      formatter={(value) => value.toLocaleString()}
                      labelStyle={{ color: '#000' }}
                      labelFormatter={(value, payload) => {
                        const item = payload[0]?.payload;
                        return item ? `${item.domain} - ${item.country}` : value;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="lookups" name="DNS Lookups" fill="#bd00ff" />
                    <Bar dataKey="unique_ips" name="Unique IPs" fill="#ff00c8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr className="cyber-table-head">
                      <th scope="col" className="cyber-table-cell text-left">Domain</th>
                      <th scope="col" className="cyber-table-cell text-left">Country</th>
                      <th scope="col" className="cyber-table-cell text-left">DNS Lookups</th>
                      <th scope="col" className="cyber-table-cell text-left">Unique IPs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border">
                    {domainCountryCorrelation
                      .sort((a, b) => b.lookups - a.lookups)
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
                              {data.domain}
                            </div>
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.country}
                          </td>
                          <td className="cyber-table-cell text-cyber-neon-blue">
                            {data.lookups.toLocaleString()}
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
        </div>
      </div>
    </div>
  );
};

export default DnsAnalytics;