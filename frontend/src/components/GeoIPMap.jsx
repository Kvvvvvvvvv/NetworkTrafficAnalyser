import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { motion } from 'framer-motion';

// World map data
const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

const GeoIPMap = ({ packetHistory }) => {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [geoData, setGeoData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'non_local', 'specific'
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('');

  // Fetch real GeoIP data
  useEffect(() => {
    fetchGeoIPData();
    fetchCountryAnalytics();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchGeoIPData();
      fetchCountryAnalytics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [filter, selectedCountryFilter]);

  const fetchGeoIPData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get_geoip_data');
      const data = await response.json();
      
      if (data.status === 'success') {
        setGeoData(data.geoip_data);
      } else {
        setError(data.message || 'Failed to fetch GeoIP data');
      }
    } catch (err) {
      setError('Failed to fetch GeoIP data: ' + err.message);
      console.error('Error fetching GeoIP data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountryAnalytics = async () => {
    try {
      const response = await fetch('/api/get_country_analytics');
      const data = await response.json();
      
      if (data.status === 'success') {
        setCountryData(data.country_data);
      } else {
        setError(data.message || 'Failed to fetch country analytics');
      }
    } catch (err) {
      setError('Failed to fetch country analytics: ' + err.message);
      console.error('Error fetching country analytics:', err);
    }
  };

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  const handleCountryClick = (geo) => {
    const countryData = geoData.find(d => d.country_code === geo.properties.ISO_A2);
    if (countryData) {
      setSelectedCountry(countryData);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCountryRiskClass = (countryName) => {
    // In a real implementation, this would be based on threat intelligence
    const highRiskCountries = ['North Korea', 'Iran', 'Russia', 'China'];
    const mediumRiskCountries = ['United States', 'United Kingdom', 'Germany'];
    
    if (highRiskCountries.includes(countryName)) return 'anomaly-malicious';
    if (mediumRiskCountries.includes(countryName)) return 'anomaly-suspicious';
    return 'cyber-badge-success';
  };

  if (loading) {
    return (
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-neon-green"></div>
            <span className="ml-3 text-cyber-neon-green">Loading geolocation data...</span>
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
              onClick={() => {
                setError(null);
                fetchGeoIPData();
                fetchCountryAnalytics();
              }}
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
              <h2 className="text-xl font-bold text-cyber-neon-green">Global Traffic Map</h2>
              <p className="text-cyber-neon-blue mt-1">
                Real-time visualization of network traffic by geographic location
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                className="cyber-btn-primary"
                onClick={() => {
                  fetchGeoIPData();
                  fetchCountryAnalytics();
                }}
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Country Filter */}
      <div className="cyber-card">
        <div className="cyber-card-body">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center">
              <label className="text-cyber-neon-green mr-2">Filter:</label>
              <select 
                className="bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green px-3 py-2"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Countries</option>
                <option value="non_local">Non-Local Countries</option>
                <option value="specific">Specific Country</option>
              </select>
            </div>
            
            {filter === 'specific' && (
              <div className="flex items-center">
                <label className="text-cyber-neon-green mr-2">Country:</label>
                <select 
                  className="bg-cyber-gray-800 border border-cyber-border rounded-md text-cyber-neon-green px-3 py-2"
                  value={selectedCountryFilter}
                  onChange={(e) => setSelectedCountryFilter(e.target.value)}
                >
                  <option value="">Select Country</option>
                  {Array.from(new Set(geoData.map(d => d.country))).map((country, index) => (
                    <option key={index} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map and Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="cyber-card lg:col-span-2">
          <div className="cyber-card-body">
            <div className="h-96 w-full relative">
              <ComposableMap 
                projection="geoMercator"
                projectionConfig={{
                  scale: 120
                }}
              >
                <ZoomableGroup
                  center={position.coordinates}
                  zoom={position.zoom}
                  onMoveEnd={handleMoveEnd}
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const countryData = geoData.find(d => d.country_code === geo.properties.ISO_A2);
                        const hasTraffic = countryData && countryData.traffic > 0;
                        
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onClick={() => handleCountryClick(geo)}
                            style={{
                              default: {
                                fill: hasTraffic ? "#00eeff" : "#1a1a2e",
                                stroke: "#334155",
                                strokeWidth: 0.5,
                                outline: "none",
                                opacity: hasTraffic ? 1 : 0.3
                              },
                              hover: {
                                fill: hasTraffic ? "#00ff9d" : "#2a2a2a",
                                stroke: "#00ff9d",
                                strokeWidth: 1,
                                outline: "none",
                                opacity: 1
                              },
                              pressed: {
                                fill: "#bd00ff",
                                stroke: "#bd00ff",
                                strokeWidth: 1,
                                outline: "none"
                              }
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                  {geoData.map(({ ip, latitude, longitude, traffic, country }) => (
                    <Marker key={ip} coordinates={[longitude, latitude]}>
                      <motion.circle
                        r={Math.log(traffic + 1) / 2}
                        fill="#ff00c8"
                        stroke="#0a0a0a"
                        strokeWidth={1}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.5 }}
                        className="neon-glow-red"
                      />
                      <motion.circle
                        r={Math.log(traffic + 1) / 2}
                        fill="rgba(255, 0, 192, 0.2)"
                        stroke="none"
                        initial={{ scale: 0 }}
                        animate={{ scale: 2 }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                    </Marker>
                  ))}
                </ZoomableGroup>
              </ComposableMap>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="cyber-card">
          <div className="cyber-card-header">
            <h3 className="text-lg font-bold text-cyber-neon-green">Traffic Insights</h3>
          </div>
          <div className="cyber-card-body">
            {selectedCountry ? (
              <div>
                <h4 className="text-xl font-bold text-cyber-neon-green">{selectedCountry.country}</h4>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-cyber-neon-blue text-sm">IP Address</p>
                    <p className="text-cyber-neon-green">{selectedCountry.ip}</p>
                  </div>
                  <div>
                    <p className="text-cyber-neon-blue text-sm">Traffic Volume</p>
                    <p className="text-cyber-neon-green">{formatBytes(selectedCountry.traffic)}</p>
                  </div>
                  <div>
                    <p className="text-cyber-neon-blue text-sm">City</p>
                    <p className="text-cyber-neon-green">{selectedCountry.city || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-cyber-neon-blue text-sm">Region</p>
                    <p className="text-cyber-neon-green">{selectedCountry.region || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-cyber-neon-blue text-sm">ISP</p>
                    <p className="text-cyber-neon-green">{selectedCountry.isp || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-cyber-neon-blue text-sm">ASN</p>
                    <p className="text-cyber-neon-green">{selectedCountry.asn || 'Unknown'}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button 
                    className="cyber-btn-secondary w-full"
                    onClick={() => setSelectedCountry(null)}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="text-lg font-bold text-cyber-neon-green">Global Statistics</h4>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-cyber-neon-blue text-sm">Active Countries</p>
                    <p className="text-2xl font-bold text-cyber-neon-green">
                      {geoData.filter(d => d.traffic > 0).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-cyber-neon-blue text-sm">Total Traffic</p>
                    <p className="text-2xl font-bold text-cyber-neon-green">
                      {formatBytes(geoData.reduce((sum, d) => sum + (d.traffic || 0), 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-cyber-neon-blue text-sm">Top Country</p>
                    <p className="text-xl font-bold text-cyber-neon-green">
                      {geoData.sort((a, b) => (b.traffic || 0) - (a.traffic || 0))[0]?.country || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-cyber-neon-blue text-sm">
                    Click on any highlighted country to see detailed information
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Country Analytics */}
      <div className="cyber-card">
        <div className="cyber-card-header">
          <h3 className="text-lg font-bold text-cyber-neon-green">Country Analytics</h3>
        </div>
        <div className="cyber-card-body">
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr className="cyber-table-head">
                  <th scope="col" className="cyber-table-cell text-left">Country</th>
                  <th scope="col" className="cyber-table-cell text-left">Packets</th>
                  <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                  <th scope="col" className="cyber-table-cell text-left">Unique IPs</th>
                  <th scope="col" className="cyber-table-cell text-left">Top ISP</th>
                  <th scope="col" className="cyber-table-cell text-left">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {countryData
                  .sort((a, b) => b.bytes - a.bytes)
                  .map((data, index) => {
                    const totalBytes = countryData.reduce((sum, d) => sum + d.bytes, 0);
                    const share = totalBytes > 0 ? ((data.bytes / totalBytes) * 100).toFixed(1) : 0;
                    
                    return (
                      <motion.tr 
                        key={index} 
                        className="cyber-table-row"
                        whileHover={{ backgroundColor: 'rgba(26, 26, 46, 0.5)' }}
                        onClick={() => {
                          // Find and select a country
                        }}
                      >
                        <td className="cyber-table-cell font-medium text-cyber-neon-green">
                          <div className="flex items-center">
                            <div className="bg-cyber-gray-700 rounded-full p-1 mr-2">
                              <svg className="h-3 w-3 text-cyber-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            {data.country}
                          </div>
                        </td>
                        <td className="cyber-table-cell text-cyber-neon-blue">
                          {data.packets.toLocaleString()}
                        </td>
                        <td className="cyber-table-cell text-cyber-neon-blue">
                          {formatBytes(data.bytes)}
                        </td>
                        <td className="cyber-table-cell text-cyber-neon-blue">
                          {data.unique_ips}
                        </td>
                        <td className="cyber-table-cell text-cyber-neon-blue">
                          {data.isp_list.length > 0 ? data.isp_list[0] : 'Unknown'}
                        </td>
                        <td className="cyber-table-cell">
                          <span className={`cyber-badge ${getCountryRiskClass(data.country)}`}>
                            {getCountryRiskClass(data.country).includes('red') ? 'High' : 
                             getCountryRiskClass(data.country).includes('yellow') ? 'Medium' : 'Low'}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoIPMap;