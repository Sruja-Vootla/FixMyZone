// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { issuesAPI } from '../services/api';

// // Fix Leaflet marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// // Custom marker icons
// const getMarkerIcon = (status) => {
//   const colors = {
//     'Open': '#eab308',
//     'In Progress': '#3b82f6',
//     'Resolved': '#22c55e'
//   };
  
//   const color = colors[status] || '#gray';
  
//   return L.divIcon({
//     className: 'custom-marker',
//     html: `
//       <div style="
//         background: ${color};
//         width: 20px;
//         height: 20px;
//         border-radius: 50%;
//         border: 3px solid white;
//         box-shadow: 0 2px 6px rgba(0,0,0,0.3);
//       "></div>
//     `,
//     iconSize: [20, 20],
//     iconAnchor: [10, 10]
//   });
// };

// export default function MapSnapShot() {
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchIssues = async () => {
//       try {
//         const data = await issuesAPI.getIssues();
//         setIssues(data || []);
//       } catch (error) {
//         console.error('Error fetching issues:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchIssues();
//   }, []);

//   const normalizeStatus = (status) => {
//     if (!status) return 'Open';
//     const statusMap = {
//       'open': 'Open',
//       'in progress': 'In Progress',
//       'inprogress': 'In Progress',
//       'resolved': 'Resolved'
//     };
//     return statusMap[status.toLowerCase()] || status;
//   };

//   const getCategoryIcon = (category) => {
//     const iconMap = {
//       'lighting': '💡',
//       'road': '🛣️',
//       'waste': '🗑️',
//       'water': '💧',
//       'traffic': '🚦',
//       'safety': '🛡️',
//       'other': '📋'
//     };
//     return iconMap[category?.toLowerCase()] || '📍';
//   };

//   const getIssueCoordinates = (issue) => {
//     if (issue.coordinates && issue.coordinates.lat && issue.coordinates.lng) {
//       return issue.coordinates;
//     }
    
//     if (issue.location && issue.location.includes(',')) {
//       const [lat, lng] = issue.location.split(',').map(s => parseFloat(s.trim()));
//       if (!isNaN(lat) && !isNaN(lng)) {
//         return { lat, lng };
//       }
//     }
    
//     const baseLatMumbai = 19.0760;
//     const baseLngMumbai = 72.8777;
//     const randomOffset = 0.05;
    
//     return {
//       lat: baseLatMumbai + (Math.random() - 0.5) * randomOffset,
//       lng: baseLngMumbai + (Math.random() - 0.5) * randomOffset
//     };
//   };

//   const displayIssues = issues.slice(0, 10);

//   return (
//     <section id="map" className="relative w-full flex flex-col items-center justify-center px-6 py-20">
//       <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[50px] p-10 w-full max-w-6xl flex flex-col items-center gap-10">
//         <h2 className="text-3xl font-semibold text-white font-inter">
//           Explore Issues Around You
//         </h2>

//         <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-2xl">
//           {loading ? (
//             <div className="w-full h-full bg-slate-800/40 flex items-center justify-center">
//               <div className="text-white text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
//                 <p>Loading map...</p>
//               </div>
//             </div>
//           ) : (
//             <MapContainer
//               center={[19.0760, 72.8777]}
//               zoom={12}
//               style={{ height: '100%', width: '100%' }}
//               zoomControl={false}
//               dragging={true}
//               scrollWheelZoom={false}
//             >
//               <TileLayer
//                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               />

//               {displayIssues.map((issue) => {
//                 const coords = getIssueCoordinates(issue);
//                 const status = normalizeStatus(issue.status);
                
//                 return (
//                   <Marker
//                     key={issue.id}
//                     position={[coords.lat, coords.lng]}
//                     icon={getMarkerIcon(status)}
//                   >
//                     <Popup>
//                       <div style={{ minWidth: '180px' }}>
//                         <div style={{
//                           display: 'flex',
//                           alignItems: 'center',
//                           gap: '8px',
//                           marginBottom: '8px'
//                         }}>
//                           <span style={{ fontSize: '20px' }}>
//                             {getCategoryIcon(issue.category)}
//                           </span>
//                           <h3 style={{
//                             fontSize: '14px',
//                             fontWeight: 'bold',
//                             color: '#1e293b',
//                             margin: 0
//                           }}>
//                             {issue.title}
//                           </h3>
//                         </div>

//                         <div style={{ marginBottom: '8px' }}>
//                           <span style={{
//                             display: 'inline-block',
//                             padding: '2px 8px',
//                             borderRadius: '12px',
//                             fontSize: '11px',
//                             fontWeight: '500',
//                             backgroundColor: status === 'Open' ? '#fef3c7' : 
//                                            status === 'In Progress' ? '#dbeafe' : '#d1fae5',
//                             color: status === 'Open' ? '#92400e' : 
//                                    status === 'In Progress' ? '#1e40af' : '#065f46'
//                           }}>
//                             {status}
//                           </span>
//                         </div>

//                         <p style={{
//                           fontSize: '12px',
//                           color: '#64748b',
//                           marginBottom: '8px',
//                           lineHeight: '1.4'
//                         }}>
//                           {issue.description?.substring(0, 80)}
//                           {issue.description?.length > 80 ? '...' : ''}
//                         </p>

//                         <Link
//                           to={`/issues/${issue.id}`}
//                           style={{
//                             display: 'inline-block',
//                             padding: '4px 12px',
//                             backgroundColor: '#0ea5e9',
//                             color: 'white',
//                             borderRadius: '6px',
//                             textDecoration: 'none',
//                             fontSize: '12px',
//                             fontWeight: '500'
//                           }}
//                         >
//                           View Details
//                         </Link>
//                       </div>
//                     </Popup>
//                   </Marker>
//                 );
//               })}
//             </MapContainer>
//           )}

//           {/* Issue Count Badge */}
//           {!loading && (
//             <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg z-[1000]">
//               {issues.length} Issue{issues.length !== 1 ? 's' : ''}
//             </div>
//           )}

//           {/* View Full Map Button */}
//           <Link
//             to="/issues"
//             className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#00b4db] to-[#0083b0] rounded-full px-6 py-3 text-sm font-semibold shadow-lg text-white hover:scale-105 transition-transform z-[1000]"
//           >
//             View Full Map
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }











import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { issuesAPI } from '../services/api';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
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
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

export default function MapSnapShot() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await issuesAPI.getIssues();
        setIssues(data || []);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

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

  const getCategoryIcon = (category) => {
    const iconMap = {
      'lighting': '💡',
      'road': '🛣️',
      'waste': '🗑️',
      'water': '💧',
      'traffic': '🚦',
      'safety': '🛡️',
      'other': '📋'
    };
    return iconMap[category?.toLowerCase()] || '📍';
  };

  const getIssueCoordinates = (issue) => {
    if (issue.coordinates && issue.coordinates.lat && issue.coordinates.lng) {
      return issue.coordinates;
    }
    
    if (issue.location && issue.location.includes(',')) {
      const [lat, lng] = issue.location.split(',').map(s => parseFloat(s.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    
    const baseLatMumbai = 19.0760;
    const baseLngMumbai = 72.8777;
    const randomOffset = 0.05;
    
    return {
      lat: baseLatMumbai + (Math.random() - 0.5) * randomOffset,
      lng: baseLngMumbai + (Math.random() - 0.5) * randomOffset
    };
  };

  const displayIssues = issues.slice(0, 10);

  return (
    <section id="map" className="relative w-full flex flex-col items-center justify-center px-6 py-20">
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[50px] p-10 w-full max-w-6xl flex flex-col items-center gap-10">
        <h2 className="text-3xl font-semibold text-white font-inter">
          Explore Issues Around You
        </h2>

        <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="w-full h-full bg-slate-800/40 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Loading map...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={[19.0760, 72.8777]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              dragging={true}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {displayIssues.map((issue) => {
                const coords = getIssueCoordinates(issue);
                const status = normalizeStatus(issue.status);
                
                return (
                  <Marker
                    key={issue._id || issue.id}
                    position={[coords.lat, coords.lng]}
                    icon={getMarkerIcon(status)}
                  >
                    <Popup>
                      <div style={{ minWidth: '180px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontSize: '20px' }}>
                            {getCategoryIcon(issue.category)}
                          </span>
                          <h3 style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1e293b',
                            margin: 0
                          }}>
                            {issue.title}
                          </h3>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
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
                          fontSize: '12px',
                          color: '#64748b',
                          marginBottom: '8px',
                          lineHeight: '1.4'
                        }}>
                          {issue.description?.substring(0, 80)}
                          {issue.description?.length > 80 ? '...' : ''}
                        </p>

                        <Link
                          to={`/issues/${issue._id || issue.id}`}
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: '#0ea5e9',
                            color: 'white',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '12px',
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
          )}

          {/* Issue Count Badge */}
          {!loading && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg z-[1000]">
              {issues.length} Issue{issues.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* View Full Map Button */}
          <Link
            to="/issues"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#00b4db] to-[#0083b0] rounded-full px-6 py-3 text-sm font-semibold shadow-lg text-white hover:scale-105 transition-transform z-[1000]"
          >
            View Full Map
          </Link>
        </div>
      </div>
    </section>
  );
}