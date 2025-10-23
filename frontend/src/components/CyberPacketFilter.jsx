import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CyberPacketFilter = ({ socket, onFilterChange }) => {
  const [filters, setFilters] = useState({
    ip: '',
    protocol: '',
    port: '',
    sizeMin: '',
    sizeMax: '',
    timeRange: 'all'
  });
  
  const [activeFilters, setActiveFilters] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // Protocol options
  const protocolOptions = [
    { value: '', label: 'All Protocols' },
    { value: '6', label: 'TCP' },
    { value: '17', label: 'UDP' },
    { value: '1', label: 'ICMP' },
    { value: '2', label: 'IGMP' },
    { value: '89', label: 'OSPF' }
  ];

  // Time range options
  const timeRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: '5m', label: 'Last 5 Minutes' },
    { value: '15m', label: 'Last 15 Minutes' },
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' }
  ];

  // Handle filter input changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply filters
  const applyFilters = async () => {
    const active = [];
    
    // Build active filters list
    if (filters.ip) active.push({ type: 'IP', value: filters.ip });
    if (filters.protocol) {
      const protocolName = protocolOptions.find(p => p.value === filters.protocol)?.label || filters.protocol;
      active.push({ type: 'Protocol', value: protocolName });
    }
    if (filters.port) active.push({ type: 'Port', value: filters.port });
    if (filters.sizeMin || filters.sizeMax) {
      active.push({ 
        type: 'Size', 
        value: `${filters.sizeMin || 0} - ${filters.sizeMax || '∞'} bytes` 
      });
    }
    if (filters.timeRange !== 'all') {
      active.push({ type: 'Time', value: timeRangeOptions.find(t => t.value === filters.timeRange)?.label || filters.timeRange });
    }
    
    setActiveFilters(active);
    setIsFiltering(true);
    
    try {
      // Send filter settings to backend
      const response = await fetch('/api/set_filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip_filter: filters.ip || null,
          protocol_filter: filters.protocol || null,
          port_filter: filters.port ? parseInt(filters.port) : null,
          size_filter: {
            min: filters.sizeMin ? parseInt(filters.sizeMin) : 0,
            max: filters.sizeMax ? parseInt(filters.sizeMax) : Number.POSITIVE_INFINITY
          }
        }),
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        console.log('Filters applied successfully');
        if (onFilterChange) onFilterChange(filters);
      } else {
        console.error('Failed to apply filters:', data.message);
      }
    } catch (err) {
      console.error('Error applying filters:', err);
    }
  };

  // Clear all filters
  const clearFilters = async () => {
    setFilters({
      ip: '',
      protocol: '',
      port: '',
      sizeMin: '',
      sizeMax: '',
      timeRange: 'all'
    });
    setActiveFilters([]);
    setIsFiltering(false);
    
    try {
      // Disable filters on backend
      const response = await fetch('/api/disable_filters', {
        method: 'POST',
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        console.log('Filters cleared successfully');
        if (onFilterChange) onFilterChange(null);
      } else {
        console.error('Failed to clear filters:', data.message);
      }
    } catch (err) {
      console.error('Error clearing filters:', err);
    }
  };

  return (
    <div className="cyber-card">
      <div className="cyber-card-header">
        <h3 className="text-lg font-bold text-cyber-neon-green">Packet Filtering & Search</h3>
      </div>
      <div className="cyber-card-body">
        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-cyber-neon-blue text-sm">Active Filters:</span>
              {activeFilters.map((filter, index) => (
                <motion.span
                  key={index}
                  className="cyber-badge cyber-badge-purple"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {filter.type}: {filter.value}
                </motion.span>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="cyber-btn-primary text-sm"
              >
                Refresh
              </button>
              <button
                onClick={clearFilters}
                className="cyber-btn-secondary text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* IP Filter */}
          <div>
            <label className="block text-sm font-medium text-cyber-neon-blue mb-1">
              Source/Destination IP
            </label>
            <input
              type="text"
              value={filters.ip}
              onChange={(e) => handleFilterChange('ip', e.target.value)}
              placeholder="192.168.1.1"
              className="w-full px-3 py-2 bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green placeholder-cyber-neon-blue focus:outline-none focus:ring-2 focus:ring-cyber-neon-green"
            />
          </div>

          {/* Protocol Filter */}
          <div>
            <label className="block text-sm font-medium text-cyber-neon-blue mb-1">
              Protocol
            </label>
            <select
              value={filters.protocol}
              onChange={(e) => handleFilterChange('protocol', e.target.value)}
              className="w-full px-3 py-2 bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green focus:outline-none focus:ring-2 focus:ring-cyber-neon-green"
            >
              {protocolOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Port Filter */}
          <div>
            <label className="block text-sm font-medium text-cyber-neon-blue mb-1">
              Port
            </label>
            <input
              type="number"
              value={filters.port}
              onChange={(e) => handleFilterChange('port', e.target.value)}
              placeholder="80"
              className="w-full px-3 py-2 bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green placeholder-cyber-neon-blue focus:outline-none focus:ring-2 focus:ring-cyber-neon-green"
            />
          </div>

          {/* Size Range */}
          <div>
            <label className="block text-sm font-medium text-cyber-neon-blue mb-1">
              Packet Size (bytes)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.sizeMin}
                onChange={(e) => handleFilterChange('sizeMin', e.target.value)}
                placeholder="Min"
                className="w-full px-3 py-2 bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green placeholder-cyber-neon-blue focus:outline-none focus:ring-2 focus:ring-cyber-neon-green"
              />
              <input
                type="number"
                value={filters.sizeMax}
                onChange={(e) => handleFilterChange('sizeMax', e.target.value)}
                placeholder="Max"
                className="w-full px-3 py-2 bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green placeholder-cyber-neon-blue focus:outline-none focus:ring-2 focus:ring-cyber-neon-green"
              />
            </div>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-cyber-neon-blue mb-1">
              Time Range
            </label>
            <select
              value={filters.timeRange}
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              className="w-full px-3 py-2 bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green focus:outline-none focus:ring-2 focus:ring-cyber-neon-green"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end">
            <div className="flex gap-2 w-full">
              <button
                onClick={applyFilters}
                className="cyber-btn-primary flex-1"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="cyber-btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Filter Status */}
        <div className="mt-6 pt-4 border-t border-cyber-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isFiltering ? 'bg-cyber-neon-green animate-pulse' : 'bg-cyber-gray-600'}`}></div>
              <span className="text-cyber-neon-blue">
                {isFiltering ? 'Filtering active' : 'No filters applied'}
              </span>
            </div>
            <div className="text-sm text-cyber-neon-blue">
              {activeFilters.length > 0 && (
                <span>{activeFilters.length} active filter{activeFilters.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberPacketFilter;