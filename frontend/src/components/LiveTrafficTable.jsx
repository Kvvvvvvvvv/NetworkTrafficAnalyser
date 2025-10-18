import React from 'react';

const LiveTrafficTable = ({ packetHistory }) => {
  // Function to get protocol name from protocol number
  const getProtocolName = (protocolNum) => {
    const protocols = {
      1: 'ICMP',
      6: 'TCP',
      17: 'UDP',
      2: 'IGMP',
      89: 'OSPF',
      132: 'SCTP'
    };
    return protocols[protocolNum] || `Protocol ${protocolNum}`;
  };

  // Function to format packet size
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Function to determine badge color based on protocol
  const getProtocolBadgeClass = (protocolNum) => {
    const protocolMap = {
      1: 'nta-badge-primary',   // ICMP
      6: 'nta-badge-success',   // TCP
      17: 'nta-badge-warning',  // UDP
      2: 'nta-badge-danger',    // IGMP
      89: 'nta-badge-primary',  // OSPF
      132: 'nta-badge-warning'  // SCTP
    };
    return protocolMap[protocolNum] || 'nta-badge-secondary';
  };

  return (
    <div className="overflow-x-auto">
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
          {packetHistory.slice().reverse().map((packet, index) => (
            <tr key={index} className="nta-table-row">
              <td className="nta-table-cell text-slate-300">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-slate-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(packet.timestamp * 1000).toLocaleTimeString()}
                </div>
              </td>
              <td className="nta-table-cell font-medium text-slate-100">
                <div className="flex items-center">
                  <div className="bg-slate-700 rounded-full p-1 mr-2">
                    <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {packet.src}
                </div>
              </td>
              <td className="nta-table-cell text-slate-300">
                <div className="flex items-center">
                  <div className="bg-slate-700 rounded-full p-1 mr-2">
                    <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {packet.dst}
                </div>
              </td>
              <td className="nta-table-cell">
                <span className={`nta-badge ${getProtocolBadgeClass(packet.protocol)}`}>
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {getProtocolName(packet.protocol)}
                </span>
              </td>
              <td className="nta-table-cell text-slate-300">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-slate-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  {formatSize(packet.size)}
                </div>
              </td>
            </tr>
          ))}
          {packetHistory.length === 0 && (
            <tr>
              <td colSpan="5" className="nta-table-cell text-center text-slate-500 py-12">
                <div className="flex flex-col items-center justify-center">
                  <svg className="h-12 w-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-lg font-medium text-slate-400 mb-1">No packets captured yet</h3>
                  <p className="text-slate-500">Waiting for network traffic to analyze</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LiveTrafficTable;