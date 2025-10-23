import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { motion } from 'framer-motion';

// World map data
const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

// Mock geo data for demonstration
const mockGeoData = [
  { ip: '192.168.1.105', country: 'United States', countryCode: 'US', latitude: 37.0902, longitude: -95.7129, traffic: 1250000 },
  { ip: '10.0.0.42', country: 'Germany', countryCode: 'DE', latitude: 51.1657, longitude: 10.4515, traffic: 980000 },
  { ip: '203.0.113.5', country: 'Japan', countryCode: 'JP', latitude: 36.2048, longitude: 138.2529, traffic: 750000 },
  { ip: '198.51.100.23', country: 'United Kingdom', countryCode: 'GB', latitude: 55.3781, longitude: -3.4360, traffic: 620000 },
  { ip: '192.0.2.178', country: 'Canada', countryCode: 'CA', latitude: 56.1304, longitude: -106.3468, traffic: 480000 },
  { ip: '192.168.1.5', country: 'Australia', countryCode: 'AU', latitude: -25.2744, longitude: 133.7751, traffic: 350000 },
  { ip: '198.51.100.45', country: 'France', countryCode: 'FR', latitude: 46.6034, longitude: 1.8883, traffic: 290000 },
  { ip: '203.0.113.12', country: 'Brazil', countryCode: 'BR', latitude: -14.2350, longitude: -51.9253, traffic: 180000 }
];

const GeoIPMap = ({ packetHistory }) => {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [geoData, setGeoData] = useState(mockGeoData);

  // In a real implementation, you would fetch GeoIP data here
  // For now, we'll use mock data

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  const handleCountryClick = (geo) => {
    const countryData = geoData.find(d => d.countryCode === geo.properties.ISO_A2);
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
              <button className="cyber-btn-primary">
                Refresh Data
              </button>
            </div>
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
                        const countryData = geoData.find(d => d.countryCode === geo.properties.ISO_A2);
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
                  {geoData.map(({ ip, latitude, longitude, traffic }) => (
                    <Marker key={ip} coordinates={[longitude, latitude]}>
                      <motion.circle
                        r={Math.log(traffic) / 10}
                        fill="#ff00c8"
                        stroke="#0a0a0a"
                        strokeWidth={1}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.5 }}
                        className="neon-glow-red"
                      />
                      <motion.circle
                        r={Math.log(traffic) / 10}
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
                    <p className="text-cyber-neon-blue text-sm">Country Code</p>
                    <p className="text-cyber-neon-green">{selectedCountry.countryCode}</p>
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
                      {formatBytes(geoData.reduce((sum, d) => sum + d.traffic, 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-cyber-neon-blue text-sm">Top Country</p>
                    <p className="text-xl font-bold text-cyber-neon-green">
                      {geoData.sort((a, b) => b.traffic - a.traffic)[0]?.country || 'N/A'}
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

      {/* Traffic by Country */}
      <div className="cyber-card">
        <div className="cyber-card-header">
          <h3 className="text-lg font-bold text-cyber-neon-green">Traffic by Country</h3>
        </div>
        <div className="cyber-card-body">
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr className="cyber-table-head">
                  <th scope="col" className="cyber-table-cell text-left">Country</th>
                  <th scope="col" className="cyber-table-cell text-left">IP Address</th>
                  <th scope="col" className="cyber-table-cell text-left">Traffic</th>
                  <th scope="col" className="cyber-table-cell text-left">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {geoData
                  .filter(d => d.traffic > 0)
                  .sort((a, b) => b.traffic - a.traffic)
                  .map((data, index) => {
                    const totalTraffic = geoData.reduce((sum, d) => sum + d.traffic, 0);
                    const share = ((data.traffic / totalTraffic) * 100).toFixed(1);
                    
                    return (
                      <motion.tr 
                        key={index} 
                        className="cyber-table-row"
                        whileHover={{ backgroundColor: 'rgba(26, 26, 46, 0.5)' }}
                        onClick={() => {
                          const countryData = geoData.find(d => d.countryCode === data.countryCode);
                          if (countryData) setSelectedCountry(countryData);
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
                          {data.ip}
                        </td>
                        <td className="cyber-table-cell text-cyber-neon-blue">
                          {formatBytes(data.traffic)}
                        </td>
                        <td className="cyber-table-cell">
                          <div className="flex items-center">
                            <div className="w-24 bg-cyber-gray-700 rounded-full h-2 mr-2">
                              <div 
                                className="bg-cyber-neon-green h-2 rounded-full" 
                                style={{ width: `${share}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-cyber-neon-blue">
                              {share}%
                            </span>
                          </div>
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