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
import ThreatDashboard from './ThreatDashboard';

const CyberDashboard = ({ socket, onStopCapture, interfaces }) => {
  const [activeTab, setActiveTab] = useState('network');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'network':
        return <Dashboard socket={socket} onStopCapture={onStopCapture} interfaces={interfaces} />;
      case 'anomalies':
        return <AnomalyDetection socket={socket} />;
      case 'geoip':
        return <GeoIPMap />;
      case 'threats':
        return <ThreatDashboard />;
      default:
        return <Dashboard socket={socket} onStopCapture={onStopCapture} interfaces={interfaces} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="cyber-card">
        <div className="border-b border-cyber-border">
          <nav className="flex space-x-8">
            {[
              { id: 'network', name: 'Network Traffic', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z' },
              { id: 'anomalies', name: 'Anomaly Detection', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
              { id: 'geoip', name: 'GeoIP Map', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'threats', name: 'Threat Intelligence', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-1 text-sm font-medium font-mono flex items-center border-b-2 ${
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
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CyberDashboard;