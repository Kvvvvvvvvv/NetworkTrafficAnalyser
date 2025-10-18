import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import InterfaceSelector from './components/InterfaceSelector';
import { io } from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [captureRunning, setCaptureRunning] = useState(false);

  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io('http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header with gradient background */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-xl border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-white">Network Traffic Analyzer</h1>
                <p className="text-sm text-slate-400">Real-time packet monitoring and analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-1 rounded-full ${isConnected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              {captureRunning && (
                <div className="flex items-center px-3 py-1 rounded-full bg-blue-900/30 text-blue-400">
                  <div className="w-2 h-2 rounded-full mr-2 bg-blue-500 animate-pulse"></div>
                  <span className="text-sm font-medium">Capturing</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {!captureRunning ? (
          <InterfaceSelector 
            socket={socket} 
            isConnected={isConnected}
            onStartCapture={() => setCaptureRunning(true)}
          />
        ) : (
          <Dashboard 
            socket={socket} 
            onStopCapture={() => setCaptureRunning(false)}
          />
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-400">
                &copy; 2025 Network Traffic Analyzer. All rights reserved.
              </p>
            </div>
            <div className="mt-4 flex justify-center md:mt-0">
              <div className="flex space-x-6">
                <a href="#" className="text-slate-400 hover:text-slate-300">
                  <span className="sr-only">Documentation</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;