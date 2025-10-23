import React, { useState, useEffect } from 'react';
import CyberDashboard from './components/CyberDashboard';
import InterfaceSelector from './components/InterfaceSelector';
import ParticlesBackground from './components/ParticlesBackground';
import { io } from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState(null);
  const [interfaces, setInterfaces] = useState([]);
  const [selectedInterface, setSelectedInterface] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showBootAnimation, setShowBootAnimation] = useState(false);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io();
    setSocket(newSocket);

    // Fetch available network interfaces
    fetchInterfaces();

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchInterfaces = async () => {
    try {
      const response = await fetch('/api/interfaces');
      const data = await response.json();
      setInterfaces(data.interfaces);
    } catch (err) {
      console.error('Failed to fetch interfaces:', err);
    }
  };

  const startCapture = async () => {
    if (!selectedInterface) {
      alert('Please select a network interface');
      return;
    }

    try {
      const response = await fetch('/api/start_capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interface: selectedInterface }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setIsCapturing(true);
      } else {
        alert('Failed to start capture: ' + data.message);
      }
    } catch (err) {
      console.error('Failed to start capture:', err);
      alert('Failed to start capture');
    }
  };

  const stopCapture = () => {
    setIsCapturing(false);
    setSelectedInterface('');
  };

  const handleBootFinish = () => {
    setShowBootAnimation(false);
  };

  // Removed boot animation - direct render of main app

  return (
    <div className="min-h-screen bg-cyber-dark-bg text-cyber-neon-green font-mono matrix-bg">
      <ParticlesBackground />
      {/* Header */}
      <header className="cyber-card border-b border-cyber-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-cyber-gray-800 rounded-lg p-2 neon-glow-green">
                  <svg className="h-8 w-8 text-cyber-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-cyber-neon-green glow-text">NETWORK TRAFFIC ANALYZER</h1>
                <p className="text-xs text-cyber-neon-blue">Real-time packet monitoring and analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="cyber-badge cyber-badge-success">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                LIVE
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isCapturing ? (
          <InterfaceSelector
            socket={socket}
            isConnected={!!socket}
            interfaces={interfaces}
            selectedInterface={selectedInterface}
            onSelectInterface={setSelectedInterface}
            onStartCapture={startCapture}
          />
        ) : (
          <CyberDashboard
            socket={socket}
            onStopCapture={stopCapture}
            interfaces={interfaces}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="cyber-card border-t border-cyber-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-cyber-neon-blue">
            <p>Network Traffic Analyzer v2.0 • Built with Flask, Scapy, React, and TailwindCSS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;