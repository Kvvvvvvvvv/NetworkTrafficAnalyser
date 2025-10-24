import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThreatIntelligence from './ThreatIntelligence';
import FlaggedIPs from './FlaggedIPs';
import PrivacyMaskedIPs from './PrivacyMaskedIPs';
import CountryAnalytics from './CountryAnalytics';
import AsnIspInsights from './AsnIspInsights';
import PortProtocolIntelligence from './PortProtocolIntelligence';
import IpClustering from './IpClustering';
import DnsAnalytics from './DnsAnalytics';
import GeoTimeCorrelation from './GeoTimeCorrelation';
import NetworkPathTracing from './NetworkPathTracing';

const ThreatDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [threatStats, setThreatStats] = useState({
    criticalThreats: 0,
    highRiskIPs: 0,
    threatReports: 0,
    blockedIPs: 0,
    vpnIPs: 0,
    proxyIPs: 0,
    torIPs: 0,
    flaggedIPs: 0,
    privacyIPs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch flagged IPs
      const flaggedResponse = await fetch('/api/get_flagged_ips');
      const flaggedData = await flaggedResponse.json();
      
      // Fetch VPN/Proxy/Tor data
      const privacyResponse = await fetch('/api/get_vpn_proxy_tor_detection');
      const privacyData = await privacyResponse.json();
      
      if (flaggedData.status === 'success' && privacyData.status === 'success') {
        const vpnData = privacyData.vpn_proxy_tor_data;
        setThreatStats({
          criticalThreats: flaggedData.flagged_ips.filter(ip => ip.risk_score >= 80).length,
          highRiskIPs: flaggedData.flagged_ips.filter(ip => ip.risk_score >= 60).length,
          threatReports: flaggedData.flagged_ips.length,
          blockedIPs: 24, // This would come from a real blocked IPs API
          vpnIPs: vpnData.total_vpn || 0,
          proxyIPs: vpnData.total_proxy || 0,
          torIPs: vpnData.total_tor || 0,
          flaggedIPs: flaggedData.flagged_ips.length,
          privacyIPs: (vpnData.total_vpn || 0) + (vpnData.total_proxy || 0) + (vpnData.total_tor || 0)
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'threat-intel':
        return <ThreatIntelligence />;
      case 'flagged-ips':
        return <FlaggedIPs />;
      case 'privacy-ips':
        return <PrivacyMaskedIPs />;
      case 'country-analytics':
        return <CountryAnalytics />;
      case 'asn-isp':
        return <AsnIspInsights />;
      case 'port-protocol':
        return <PortProtocolIntelligence />;
      case 'ip-clustering':
        return <IpClustering />;
      case 'dns-analytics':
        return <DnsAnalytics />;
      case 'geo-time':
        return <GeoTimeCorrelation />;
      case 'network-path':
        return <NetworkPathTracing />;
      default:
        return <DashboardOverview threatStats={threatStats} loading={loading} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-cyber-neon-green">🛡️ Network Threat Dashboard</h1>
              <p className="text-cyber-neon-blue mt-1">
                Real-time network security monitoring and threat intelligence
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button className="cyber-btn-primary">
                Generate Security Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="cyber-card">
        <div className="border-b border-cyber-border">
          <nav className="flex flex-wrap -mb-px">
            {[
              { id: 'overview', name: 'Dashboard Overview', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
              { id: 'threat-intel', name: 'Threat Intelligence', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
              { id: 'flagged-ips', name: 'Flagged IPs', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
              { id: 'privacy-ips', name: 'Privacy Masked IPs', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
              { id: 'country-analytics', name: 'Country Analytics', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'asn-isp', name: 'ASN & ISP Insights', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
              { id: 'port-protocol', name: 'Port & Protocol', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { id: 'ip-clustering', name: 'IP Clustering', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
              { id: 'dns-analytics', name: 'DNS Analytics', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
              { id: 'geo-time', name: 'Geo-Time Correlation', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'network-path', name: 'Network Path Tracing', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' }
            ].map((section) => (
              <button
                key={section.id}
                className={`py-3 px-4 text-sm font-medium font-mono flex items-center border-b-2 m-1 rounded-t-lg ${
                  activeSection === section.id
                    ? 'border-cyber-neon-green text-cyber-neon-green bg-cyber-gray-800'
                    : 'border-transparent text-cyber-neon-blue hover:text-cyber-neon-green hover:border-cyber-neon-green hover:bg-cyber-gray-800'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                </svg>
                <span className="hidden md:inline">{section.name}</span>
                <span className="md:hidden">{section.name.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div>
        {renderSection()}
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ threatStats, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-neon-green"></div>
        <span className="ml-3 text-cyber-neon-green text-lg">Loading dashboard overview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Threat Stats Overview */}
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
                      {threatStats.criticalThreats}
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
                      {threatStats.highRiskIPs}
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
                      {threatStats.threatReports}
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
                      {threatStats.blockedIPs}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Stats */}
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
                      {threatStats.vpnIPs}
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
                      {threatStats.proxyIPs}
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
                      {threatStats.torIPs}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="cyber-card">
          <div className="cyber-card-header">
            <h3 className="text-lg font-bold text-cyber-neon-green">Quick Actions</h3>
          </div>
          <div className="cyber-card-body">
            <div className="grid grid-cols-2 gap-4">
              <button className="cyber-btn-primary py-3">
                <svg className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="mt-1">Refresh Data</span>
              </button>
              <button className="cyber-btn-secondary py-3">
                <svg className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="mt-1">Export Report</span>
              </button>
              <button className="cyber-btn-primary py-3">
                <svg className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="mt-1">View Alerts</span>
              </button>
              <button className="cyber-btn-secondary py-3">
                <svg className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                <span className="mt-1">Settings</span>
              </button>
            </div>
          </div>
        </div>

        <div className="cyber-card">
          <div className="cyber-card-header">
            <h3 className="text-lg font-bold text-cyber-neon-green">Recent Activity</h3>
          </div>
          <div className="cyber-card-body">
            <div className="space-y-3">
              <div className="flex items-center p-2 hover:bg-cyber-gray-800 rounded">
                <div className="flex-shrink-0 bg-cyber-neon-red/10 rounded-full p-2">
                  <svg className="h-4 w-4 text-cyber-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-cyber-neon-green">New flagged IP detected</p>
                  <p className="text-xs text-cyber-neon-blue">192.168.1.100 - High risk</p>
                </div>
                <div className="ml-auto text-xs text-cyber-neon-blue">2 min ago</div>
              </div>
              <div className="flex items-center p-2 hover:bg-cyber-gray-800 rounded">
                <div className="flex-shrink-0 bg-cyber-neon-blue/10 rounded-full p-2">
                  <svg className="h-4 w-4 text-cyber-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-cyber-neon-green">VPN connection detected</p>
                  <p className="text-xs text-cyber-neon-blue">10.0.0.42 - NordVPN</p>
                </div>
                <div className="ml-auto text-xs text-cyber-neon-blue">5 min ago</div>
              </div>
              <div className="flex items-center p-2 hover:bg-cyber-gray-800 rounded">
                <div className="flex-shrink-0 bg-cyber-neon-green/10 rounded-full p-2">
                  <svg className="h-4 w-4 text-cyber-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-cyber-neon-green">Threat feed updated</p>
                  <p className="text-xs text-cyber-neon-blue">AbuseIPDB - 1,245 new entries</p>
                </div>
                <div className="ml-auto text-xs text-cyber-neon-blue">10 min ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatDashboard;