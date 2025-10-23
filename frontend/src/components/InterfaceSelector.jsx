import React, { useState, useEffect } from 'react';

const InterfaceSelector = ({ socket, isConnected, interfaces, selectedInterface, onSelectInterface, onStartCapture }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // In the new implementation, interfaces are passed as props from App.jsx
    // We don't need to fetch them here since App.jsx already does that
  }, [isConnected]);

  const startCapture = async () => {
    if (!selectedInterface) {
      setError('Please select a network interface');
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
        onStartCapture();
        setError('');
      } else {
        setError(data.message || 'Failed to start capture');
        // Automatically clear the error after 5 seconds
        setTimeout(() => {
          setError('');
        }, 5000);
      }
    } catch (err) {
      setError('Failed to start capture');
      console.error(err);
      // Automatically clear the error after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  const stopCapture = async () => {
    try {
      const response = await fetch('/api/stop_capture', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setError(''); // Clear the error
        // Try to start capture again after stopping
        setTimeout(() => {
          startCapture();
        }, 1000);
      } else {
        setError('Failed to stop capture: ' + data.message);
      }
    } catch (err) {
      setError('Failed to stop capture');
      console.error(err);
    }
  };

  const forceReset = async () => {
    try {
      const response = await fetch('/api/force_reset', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setError(''); // Clear the error
        // Try to start capture again after force reset
        setTimeout(() => {
          startCapture();
        }, 1000);
      } else {
        setError('Failed to force reset: ' + data.message);
      }
    } catch (err) {
      setError('Failed to force reset');
      console.error(err);
    }
  };

  // Check if the error is related to capture already running
  const isCaptureRunningError = error && error.includes('Capture already running');

  return (
    <div className="nta-card">
      <div className="nta-card-header">
        <h2 className="text-xl font-bold text-slate-100">Network Interface Selection</h2>
        <p className="mt-1 text-sm text-slate-400">Choose an interface to monitor network traffic</p>
      </div>
      
      <div className="nta-card-body">
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-300">Error</h3>
                <div className="mt-2 text-sm text-red-200">
                  <p>{error}</p>
                </div>
                {isCaptureRunningError && (
                  <div className="mt-3 flex flex-col space-y-2">
                    <button
                      onClick={stopCapture}
                      className="nta-btn-danger px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Stop Current Capture
                    </button>
                    <button
                      onClick={forceReset}
                      className="nta-btn-warning px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Force Reset Capture State
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <label htmlFor="interface" className="block text-sm font-medium text-slate-300 mb-2">
            Available Network Interfaces
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <select
              id="interface"
              value={selectedInterface}
              onChange={(e) => onSelectInterface(e.target.value)}
              className="nta-card bg-slate-800 border-slate-700 text-slate-100 focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-10 py-3 text-base border rounded-lg focus:outline-none"
              disabled={!isConnected}
            >
              {interfaces && interfaces.length > 0 ? (
                interfaces.map((iface) => (
                  <option key={iface} value={iface} className="bg-slate-800">
                    {iface}
                  </option>
                ))
              ) : (
                <option value="" className="bg-slate-800">
                  {isConnected ? 'No interfaces found' : 'Connecting...'}
                </option>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div className={`flex items-center ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                {isConnected ? 'Backend Connected' : 'Connecting to Backend...'}
              </span>
            </div>
          </div>
          
          <button
            onClick={startCapture}
            disabled={!isConnected || !selectedInterface}
            className={`nta-btn-primary px-6 py-3 text-sm font-semibold rounded-lg shadow-md transition-all duration-200 ${
              isConnected && selectedInterface
                ? 'hover:shadow-lg hover:scale-[1.02] glow-blue'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Packet Capture
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-300 mb-3">System Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="nta-card bg-slate-800/50">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-900/30 rounded-lg p-2">
                    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-400">Interfaces</p>
                    <p className="text-lg font-semibold text-slate-100">{interfaces ? interfaces.length : 0}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="nta-card bg-slate-800/50">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-900/30 rounded-lg p-2">
                    <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-400">Status</p>
                    <p className="text-lg font-semibold text-slate-100">
                      {isConnected ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="nta-card bg-slate-800/50">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-900/30 rounded-lg p-2">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-400">Security</p>
                    <p className="text-lg font-semibold text-slate-100">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterfaceSelector;