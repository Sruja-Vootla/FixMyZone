import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { FaThumbsUp, FaCommentDots } from "react-icons/fa";
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on status
const getMarkerIcon = (status) => {
  const colors = {
    'Open': '#eab308',
    'In Progress': '#3b82f6',
    'Resolved': '#22c55e'
  };
  
  const color = colors[status] || '#gray';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Component to handle map updates
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function IssuesMap({ issues, selectedIssue, onMarkerClick }) {
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]); // Mumbai coordinates
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    if (selectedIssue && selectedIssue.coordinates) {
      setMapCenter([selectedIssue.coordinates.lat, selectedIssue.coordinates.lng]);
      setMapZoom(15);
    }
  }, [selectedIssue]);

  // Get coordinates from issue data
  const getIssueCoordinates = (issue, index) => {
    // First, check if issue has stored coordinates object
    if (issue.coordinates && issue.coordinates.lat && issue.coordinates.lng) {
      return issue.coordinates;
    }
    
    // Try to parse if location is "lat, lng" format (old data)
    if (issue.location && issue.location.includes(',')) {
      const [lat, lng] = issue.location.split(',').map(s => parseFloat(s.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    
    // Fallback: generate position around Mumbai for issues without coordinates
    const baseLatMumbai = 19.0760;
    const baseLngMumbai = 72.8777;
    const randomOffset = 0.05;
    
    return {
      lat: baseLatMumbai + (Math.random() - 0.5) * randomOffset,
      lng: baseLngMumbai + (Math.random() - 0.5) * randomOffset
    };
  };

  const normalizeStatus = (status) => {
    if (!status) return 'Open';
    const statusMap = {
      'open': 'Open',
      'in progress': 'In Progress',
      'inprogress': 'In Progress',
      'resolved': 'Resolved'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: '100%', width: '100%' }}
      className="leaflet-map"
    >
      <MapUpdater center={mapCenter} zoom={mapZoom} />
      
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {issues.map((issue, index) => {
        const coords = getIssueCoordinates(issue, index);
        const status = normalizeStatus(issue.status);
        const issueId = issue._id || issue.id; // FIXED: Use _id for MongoDB
        
        return (
          <Marker
            key={issueId} // FIXED: Changed from issue.id to issueId
            position={[coords.lat, coords.lng]}
            icon={getMarkerIcon(status)}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(issue)
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: '#1e293b'
                }}>
                  {issue.title}
                </h3>
                
                <div style={{ marginBottom: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: status === 'Open' ? '#fef3c7' : 
                                   status === 'In Progress' ? '#dbeafe' : '#d1fae5',
                    color: status === 'Open' ? '#92400e' : 
                           status === 'In Progress' ? '#1e40af' : '#065f46'
                  }}>
                    {status}
                  </span>
                </div>

                <p style={{ 
                  fontSize: '14px', 
                  color: '#64748b', 
                  marginBottom: '4px' 
                }}>
                  {issue.location}
                </p>

                <p style={{ 
                  fontSize: '13px', 
                  color: '#64748b',
                  marginBottom: '12px',
                  lineHeight: '1.4'
                }}>
                  {issue.description?.substring(0, 100)}
                  {issue.description?.length > 100 ? '...' : ''}
                </p>

                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  fontSize: '12px',
                  color: '#64748b',
                  marginBottom: '12px'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaThumbsUp style={{ width: '14px', height: '14px' }} />
                    {issue.upvotes || 0}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaCommentDots style={{ width: '14px', height: '14px' }} />
                    {Array.isArray(issue.comments) ? issue.comments.length : 0}
                  </span>
                </div>

                <Link
                  to={`/issues/${issueId}`} // FIXED: Changed from issue.id to issueId
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    backgroundColor: '#0ea5e9',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}