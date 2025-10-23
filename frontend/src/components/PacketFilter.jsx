import React, { useState, useEffect } from 'react';

const PacketFilter = ({ socket }) => {
  const [filters, setFilters] = useState({
    ip_filter: '',
    protocol_filter: '',
    port_filter: '',
    size_min: 0,
    size_max: 1500,
    enabled: false
  });

  const [alertsConfig, setAlertsConfig] = useState({
    high_traffic_threshold: 1000,
    suspicious_ips: '',
    enabled: true
  });

  const [historicalData, setHistoricalData] = useState([]);
  const [statisticsHistory, setStatisticsHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Load current filter settings
    fetchFilters();
    fetchAlertsConfig();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('alert', (alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 19)]); // Keep only last 20 alerts
    });

    return () => {
      socket.off('alert');
    };
  }, [socket]);

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/get_filters');
      const data = await response.json();
      if (data.status === 'success') {
        const filterData = data.filters;
        setFilters({
          ip_filter: filterData.ip_filter || '',
          protocol_filter: filterData.protocol_filter || '',
          port_filter: filterData.port_filter || '',
          size_min: filterData.size_filter?.min || 0,
          size_max: filterData.size_filter?.max || 1500,
          enabled: filterData.enabled || false
        });
      }
    } catch (err) {
      console.error('Failed to fetch filters:', err);
    }
  };

  const fetchAlertsConfig = async () => {
    try {
      const response = await fetch('/api/get_alerts_config');
      const data = await response.json();
      if (data.status === 'success') {
        const config = data.config;
        setAlertsConfig({
          high_traffic_threshold: config.high_traffic_threshold || 1000,
          suspicious_ips: Array.from(config.suspicious_ips || []).join(', '),
          enabled: config.enabled || true
        });
      }
    } catch (err) {
      console.error('Failed to fetch alerts config:', err);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch('/api/get_historical_data');
      const data = await response.json();
      if (data.status === 'success') {
        setHistoricalData(data.packets);
      }
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
    }
  };

  const fetchStatisticsHistory = async () => {
    try {
      const response = await fetch('/api/get_statistics_history');
      const data = await response.json();
      if (data.status === 'success') {
        setStatisticsHistory(data.statistics);
      }
    } catch (err) {
      console.error('Failed to fetch statistics history:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/get_alerts');
      const data = await response.json();
      if (data.status === 'success') {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAlertsConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAlertsConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const applyFilters = async (e) => {
    e.preventDefault();
    try {
      const filterData = {
        ip_filter: filters.ip_filter || null,
        protocol_filter: filters.protocol_filter || null,
        port_filter: filters.port_filter ? parseInt(filters.port_filter) : null,
        size_filter: {
          min: parseInt(filters.size_min) || 0,
          max: parseInt(filters.size_max) || 1500
        }
      };

      const response = await fetch('/api/set_filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterData),
      });

      const data = await response.json();
      if (data.status === 'success') {
        alert('Filters applied successfully!');
      } else {
        alert('Failed to apply filters: ' + data.message);
      }
    } catch (err) {
      console.error('Failed to apply filters:', err);
      alert('Failed to apply filters');
    }
  };

  const disableFilters = async () => {
    try {
      const response = await fetch('/api/disable_filters', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.status === 'success') {
        setFilters(prev => ({ ...prev, enabled: false }));
        alert('Filters disabled successfully!');
      } else {
        alert('Failed to disable filters: ' + data.message);
      }
    } catch (err) {
      console.error('Failed to disable filters:', err);
      alert('Failed to disable filters');
    }
  };

  const saveAlertsConfig = async (e) => {
    e.preventDefault();
    try {
      const configData = {
        high_traffic_threshold: parseInt(alertsConfig.high_traffic_threshold) || 1000,
        suspicious_ips: alertsConfig.suspicious_ips.split(',').map(ip => ip.trim()).filter(ip => ip),
        enabled: alertsConfig.enabled
      };

      const response = await fetch('/api/set_alerts_config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      });

      const data = await response.json();
      if (data.status === 'success') {
        alert('Alert configuration saved successfully!');
      } else {
        alert('Failed to save alert configuration: ' + data.message);
      }
    } catch (err) {
      console.error('Failed to save alert configuration:', err);
      alert('Failed to save alert configuration');
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
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Packet Filtering */}
      <div className="nta-card">
        <div className="nta-card-header">
          <h3 className="text-lg font-bold text-slate-100">Packet Filtering</h3>
          <p className="mt-1 text-sm text-slate-400">Configure packet capture filters</p>
        </div>
        <div className="nta-card-body">
          <form onSubmit={applyFilters}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">IP Address Filter</label>
                <input
                  type="text"
                  name="ip_filter"
                  value={filters.ip_filter}
                  onChange={handleFilterChange}
                  placeholder="e.g., 192.168.1.1"
                  className="nta-input w-full"
                />
                <p className="mt-1 text-xs text-slate-500">Filter packets by source or destination IP</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Protocol Filter</label>
                <select
                  name="protocol_filter"
                  value={filters.protocol_filter}
                  onChange={handleFilterChange}
                  className="nta-input w-full"
                >
                  <option value="">All Protocols</option>
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ICMP">ICMP</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">Filter packets by protocol</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Port Filter</label>
                <input
                  type="number"
                  name="port_filter"
                  value={filters.port_filter}
                  onChange={handleFilterChange}
                  placeholder="e.g., 80"
                  className="nta-input w-full"
                />
                <p className="mt-1 text-xs text-slate-500">Filter packets by port number</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Min Size (bytes)</label>
                  <input
                    type="number"
                    name="size_min"
                    value={filters.size_min}
                    onChange={handleFilterChange}
                    className="nta-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Max Size (bytes)</label>
                  <input
                    type="number"
                    name="size_max"
                    value={filters.size_max}
                    onChange={handleFilterChange}
                    className="nta-input w-full"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={filters.enabled}
                  onChange={handleFilterChange}
                  className="nta-checkbox"
                />
                <label className="ml-2 text-sm text-slate-300">Enable Packet Filtering</label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="nta-btn-primary px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={disableFilters}
                  className="nta-btn-secondary px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Disable Filters
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Alert Configuration */}
      <div className="nta-card">
        <div className="nta-card-header">
          <h3 className="text-lg font-bold text-slate-100">Alert Configuration</h3>
          <p className="mt-1 text-sm text-slate-400">Configure alerting system</p>
        </div>
        <div className="nta-card-body">
          <form onSubmit={saveAlertsConfig}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">High Traffic Threshold (pps)</label>
                <input
                  type="number"
                  name="high_traffic_threshold"
                  value={alertsConfig.high_traffic_threshold}
                  onChange={handleAlertsConfigChange}
                  className="nta-input w-full"
                />
                <p className="mt-1 text-xs text-slate-500">Alert when packets per second exceeds this value</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Suspicious IPs</label>
                <textarea
                  name="suspicious_ips"
                  value={alertsConfig.suspicious_ips}
                  onChange={handleAlertsConfigChange}
                  placeholder="e.g., 192.168.1.100, 10.0.0.5"
                  className="nta-input w-full"
                  rows="3"
                />
                <p className="mt-1 text-xs text-slate-500">Comma-separated list of IPs to monitor</p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={alertsConfig.enabled}
                  onChange={handleAlertsConfigChange}
                  className="nta-checkbox"
                />
                <label className="ml-2 text-sm text-slate-300">Enable Alert System</label>
              </div>

              <button
                type="submit"
                className="nta-btn-primary px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                Save Configuration
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Historical Data */}
      <div className="nta-card lg:col-span-2">
        <div className="nta-card-header">
          <h3 className="text-lg font-bold text-slate-100">Historical Data</h3>
          <p className="mt-1 text-sm text-slate-400">View stored network traffic data</p>
        </div>
        <div className="nta-card-body">
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={fetchHistoricalData}
              className="nta-btn-primary px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Load Packet History
            </button>
            <button
              onClick={fetchStatisticsHistory}
              className="nta-btn-primary px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Load Statistics History
            </button>
            <button
              onClick={fetchAlerts}
              className="nta-btn-primary px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Load Alerts
            </button>
          </div>

          {historicalData.length > 0 && (
            <div className="overflow-x-auto">
              <h4 className="text-md font-bold text-slate-100 mb-2">Recent Packets</h4>
              <table className="nta-table">
                <thead>
                  <tr className="nta-table-head">
                    <th scope="col" className="nta-table-cell text-left">Time</th>
                    <th scope="col" className="nta-table-cell text-left">Source IP</th>
                    <th scope="col" className="nta-table-cell text-left">Destination IP</th>
                    <th scope="col" className="nta-table-cell text-left">Protocol</th>
                    <th scope="col" className="nta-table-cell text-left">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {historicalData.slice(0, 10).map((packet, index) => (
                    <tr key={index} className="nta-table-row">
                      <td className="nta-table-cell text-slate-300">{formatTime(packet.timestamp)}</td>
                      <td className="nta-table-cell text-slate-300">{packet.src_ip}</td>
                      <td className="nta-table-cell text-slate-300">{packet.dst_ip}</td>
                      <td className="nta-table-cell text-slate-300">{packet.protocol}</td>
                      <td className="nta-table-cell text-slate-300">{formatBytes(packet.size)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {statisticsHistory.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <h4 className="text-md font-bold text-slate-100 mb-2">Statistics History</h4>
              <table className="nta-table">
                <thead>
                  <tr className="nta-table-head">
                    <th scope="col" className="nta-table-cell text-left">Time</th>
                    <th scope="col" className="nta-table-cell text-left">Total Packets</th>
                    <th scope="col" className="nta-table-cell text-left">Total Bytes</th>
                    <th scope="col" className="nta-table-cell text-left">Protocols</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {statisticsHistory.slice(0, 10).map((stat, index) => (
                    <tr key={index} className="nta-table-row">
                      <td className="nta-table-cell text-slate-300">{formatTime(stat.timestamp)}</td>
                      <td className="nta-table-cell text-slate-300">{stat.total_packets.toLocaleString()}</td>
                      <td className="nta-table-cell text-slate-300">{formatBytes(stat.total_bytes)}</td>
                      <td className="nta-table-cell text-slate-300">{Object.keys(stat.protocols).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {alerts.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-bold text-slate-100 mb-2">Recent Alerts</h4>
              <div className="space-y-2">
                {alerts.slice(0, 10).map((alert, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg ${
                      alert.severity === 'ALERT' 
                        ? 'bg-red-900/30 border border-red-700' 
                        : 'bg-yellow-900/30 border border-yellow-700'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-slate-100">{alert.type}</span>
                      <span className="text-xs text-slate-400">{formatTime(alert.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{alert.message}</p>
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

export default PacketFilter;