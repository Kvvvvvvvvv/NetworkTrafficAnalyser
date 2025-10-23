import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SessionCapture = ({ socket }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [sessionName, setSessionName] = useState('NTA-Session-' + new Date().toISOString().slice(0, 10));
  const [captureDuration, setCaptureDuration] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const intervalRef = useRef(null);

  // Start capture
  const startCapture = async () => {
    try {
      const response = await fetch('/api/start_capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_name: sessionName }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setIsCapturing(true);
        setCaptureDuration(0);
        
        // Start timer
        intervalRef.current = setInterval(() => {
          setCaptureDuration(prev => prev + 1);
        }, 1000);
        
        showToastMessage('Capture started successfully');
      } else {
        showToastMessage('Failed to start capture: ' + data.message, true);
      }
    } catch (err) {
      console.error('Failed to start capture:', err);
      showToastMessage('Failed to start capture', true);
    }
  };

  // Stop capture
  const stopCapture = async () => {
    try {
      const response = await fetch('/api/stop_capture', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.status === 'success') {
        setIsCapturing(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        showToastMessage('Capture stopped and session saved');
      } else {
        showToastMessage('Failed to stop capture: ' + data.message, true);
      }
    } catch (err) {
      console.error('Failed to stop capture:', err);
      showToastMessage('Failed to stop capture', true);
    }
  };

  // Export session
  const exportSession = async (format) => {
    try {
      const response = await fetch(`/api/export_session?format=${format}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sessionName}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToastMessage(`Session exported as ${format.toUpperCase()}`);
      } else {
        showToastMessage(`Failed to export session as ${format.toUpperCase()}`, true);
      }
    } catch (err) {
      console.error(`Failed to export session as ${format}:`, err);
      showToastMessage(`Failed to export session as ${format.toUpperCase()}`, true);
    }
  };

  // Show toast message
  const showToastMessage = (message, isError = false) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Format time
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="cyber-card">
      <div className="cyber-card-header">
        <h3 className="text-lg font-bold text-cyber-neon-green">Session Capture & Export</h3>
      </div>
      <div className="cyber-card-body">
        {/* Session Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-cyber-neon-blue mb-1">
            Session Name
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            disabled={isCapturing}
            className="w-full px-3 py-2 bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green placeholder-cyber-neon-blue focus:outline-none focus:ring-2 focus:ring-cyber-neon-green disabled:opacity-50"
          />
        </div>

        {/* Capture Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Capture Status */}
          <div className="cyber-card bg-cyber-gray-800">
            <div className="cyber-card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-cyber-neon-green font-medium">Capture Status</h4>
                  <p className="text-cyber-neon-blue text-sm mt-1">
                    {isCapturing ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className={`w-4 h-4 rounded-full ${isCapturing ? 'bg-cyber-neon-green animate-pulse' : 'bg-cyber-gray-600'}`}></div>
              </div>
              
              {isCapturing && (
                <div className="mt-4">
                  <div className="text-cyber-neon-blue text-sm">Duration</div>
                  <div className="text-2xl font-mono font-bold text-cyber-neon-green glow-text">
                    {formatTime(captureDuration)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Capture Actions */}
          <div className="cyber-card bg-cyber-gray-800">
            <div className="cyber-card-body">
              <h4 className="text-cyber-neon-green font-medium mb-3">Capture Controls</h4>
              
              {!isCapturing ? (
                <button
                  onClick={startCapture}
                  className="cyber-btn-primary w-full py-3 flex items-center justify-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Capture
                </button>
              ) : (
                <button
                  onClick={stopCapture}
                  className="cyber-btn-danger w-full py-3 flex items-center justify-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Stop Capture
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="cyber-card bg-cyber-gray-800">
          <div className="cyber-card-body">
            <h4 className="text-cyber-neon-green font-medium mb-3">Export Session</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => exportSession('pcap')}
                disabled={!isCapturing && captureDuration === 0}
                className="cyber-btn-primary py-2 flex items-center justify-center disabled:opacity-50"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export as PCAP
              </button>
              
              <button
                onClick={() => exportSession('csv')}
                disabled={!isCapturing && captureDuration === 0}
                className="cyber-btn-secondary py-2 flex items-center justify-center disabled:opacity-50"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export as CSV
              </button>
            </div>
            
            <div className="mt-4 text-sm text-cyber-neon-blue">
              <p>Export your captured session data in various formats for further analysis.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 cyber-card border-l-4 border-cyber-neon-green neon-glow-green"
            style={{ zIndex: 1000 }}
          >
            <div className="cyber-card-body py-3 px-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-cyber-neon-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-cyber-neon-green">{toastMessage}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SessionCapture;