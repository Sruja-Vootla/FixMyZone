import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Map, ThumbsUp, Settings, LogOut, MessageCircle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ADDED
import { useAuth } from '../../context/AuthContext';
import { issuesAPI } from '../../services/api';

export default function Dashboard() {
  const [myIssues, setMyIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation(); // ADDED

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const issues = await issuesAPI.getIssues();
        setAllIssues(issues || []);
        
        // FIXED: Filter issues reported by this user using MongoDB _id
        const userId = user._id || user.id;
        const userIssues = issues.filter(issue => {
          const reporterId = issue.reporterId?._id || issue.reporterId;
          return reporterId === userId || issue.reporterEmail === user.email;
        });
        
        console.log('User ID:', userId);
        console.log('User issues:', userIssues);
        setMyIssues(userIssues);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Calculate user-specific stats
  const stats = {
    totalIssues: myIssues.length,
    resolvedIssues: myIssues.filter(i => i.status?.toLowerCase() === 'resolved').length,
    votesReceived: myIssues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0),
    activeReports: myIssues.filter(i => i.status?.toLowerCase() !== 'resolved').length
  };

  const normalizeStatus = (status) => {
    if (!status) return t('status.open'); // UPDATED
    const statusMap = {
      'open': t('status.open'),
      'in progress': t('status.inProgress'),
      'inprogress': t('status.inProgress'),
      'resolved': t('status.resolved')
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getStatusBadge = (status) => {
    const normalized = normalizeStatus(status);
    const styles = {
      [t('status.open')]: 'bg-gradient-to-b from-yellow-400 to-yellow-500',
      [t('status.inProgress')]: 'bg-gradient-to-b from-blue-400 to-blue-600',
      [t('status.resolved')]: 'bg-gradient-to-b from-green-400 to-green-500'
    };
    return styles[normalized] || 'bg-gray-400';
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return t('common.unknown', 'Unknown'); // UPDATED
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return t('issues.today');
      if (diffDays === 1) return t('issues.yesterday');
      if (diffDays < 7) return `${diffDays}${t('issues.daysAgo')}`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}${t('issues.weeksAgo')}`;
      return `${Math.floor(diffDays / 30)}${t('issues.monthsAgo')}`;
    } catch {
      return t('common.unknown', 'Unknown'); // UPDATED
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
        active 
          ? 'bg-white text-slate-900 shadow-md' 
          : 'text-white hover:bg-white/10'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#43c6ac] to-[#191654] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="flex relative">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-60' : 'w-0'} min-h-screen bg-white/10 backdrop-blur-lg border-r border-white/20 overflow-hidden transition-all duration-300 ease-in-out`}>
          <div className="w-60 p-6 flex flex-col gap-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-1">{t('dashboard.welcome')},</h3>
              <p className="text-white/80 text-sm">{user?.name || 'User'}</p>
            </div>

            <SidebarItem icon={FileText} label={t('dashboard.myReports')} active={true} />
            <SidebarItem icon={Map} label={t('dashboard.mapView')} onClick={() => navigate('/issues')} />
            
            <div className="border-t border-white/20 pt-4 space-y-2 mt-auto">
              <SidebarItem icon={Settings} label={t('dashboard.settings')} />
              <SidebarItem icon={LogOut} label={t('dashboard.logout')} onClick={handleLogout} />
            </div>
          </div>
        </aside>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-4 z-50 bg-white text-slate-900 rounded-r-lg p-2 shadow-lg hover:bg-gray-100 transition-all duration-300"
          style={{ left: sidebarOpen ? '240px' : '0px' }}
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto">
          {/* Analytics Section */}
          <div className="mb-12">
            <h2 className="text-white text-2xl font-bold mb-6">{t('dashboard.statistics')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]" />
                <div className="p-6 text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.totalIssues}</div>
                  <div className="text-slate-600 font-medium">{t('dashboard.totalReported')}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-2 bg-gradient-to-r from-[#56ab2f] to-[#a8e063]" />
                <div className="p-6 text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.resolvedIssues}</div>
                  <div className="text-slate-600 font-medium">{t('dashboard.resolved')}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-2 bg-gradient-to-r from-[#fbb034] to-[#ffdd00]" />
                <div className="p-6 text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.votesReceived}</div>
                  <div className="text-slate-600 font-medium">{t('dashboard.votesReceived')}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-2 bg-gradient-to-r from-[#43c6ac] to-[#191654]" />
                <div className="p-6 text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.activeReports}</div>
                  <div className="text-slate-600 font-medium">{t('dashboard.activeReports')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Issues Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-2xl font-bold">{t('dashboard.recentIssues')}</h2>
              <Link
                to="/report"
                className="bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white px-4 py-2 rounded-full font-semibold hover:scale-105 transition-transform"
              >
                {t('dashboard.reportNew')}
              </Link>
            </div>

            {myIssues.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center border border-white/20">
                <FileText className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{t('dashboard.noIssuesYet')}</h3>
                <p className="text-white/70 mb-6">{t('dashboard.noIssuesDesc')}</p>
                <Link
                  to="/report"
                  className="inline-block bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                >
                  {t('dashboard.reportFirst')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myIssues.map((issue) => (
                  <div key={issue._id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow">
                    {/* Image Wrapper */}
                    <div className="relative h-36 bg-gray-300 flex items-center justify-center">
                      {issue.images && issue.images.length > 0 && issue.images[0].startsWith('http') ? (
                        <img 
                          src={issue.images[0]} 
                          alt={issue.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ display: (issue.images && issue.images.length > 0 && issue.images[0].startsWith('http')) ? 'none' : 'flex' }}>
                        <span className="text-sm">No image</span>
                      </div>
                      <div className={`absolute top-2 left-2 ${getStatusBadge(issue.status)} text-white rounded-full px-3 py-1 text-xs font-medium`}>
                        {normalizeStatus(issue.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <h3 className="text-slate-900 text-base font-medium line-clamp-2">{issue.title}</h3>
                      
                      <div className="flex items-center gap-2 bg-gray-100 text-slate-900 rounded-full px-3 py-1 w-fit">
                        <span className="text-xs font-medium capitalize">{t(`categories.${issue.category}`, issue.category)}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <div className="flex items-center gap-1 max-w-[60%]">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{issue.location}</span>
                        </div>
                        <span className="flex-shrink-0">{getTimeAgo(issue.reportedDate || issue.createdAt)}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-auto">
                        <Link 
                          to={`/issues/${issue._id}`}
                          className="text-[#0083b0] text-sm font-medium hover:underline"
                        >
                          {t('issues.viewDetails')}
                        </Link>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-slate-500">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-xs">{issue.upvotes || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs">{Array.isArray(issue.comments) ? issue.comments.length : 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}



// // src/pages/Dashboard.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { 
//   FileText, 
//   Map, 
//   ThumbsUp, 
//   Settings, 
//   LogOut, 
//   MessageCircle, 
//   MapPin, 
//   ChevronLeft, 
//   ChevronRight,
//   Navigation,
//   Filter,
//   Eye,
//   Calendar
// } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { issuesAPI } from '../../services/api';

// export default function Dashboard() {
//   const [myIssues, setMyIssues] = useState([]);
//   const [nearbyIssues, setNearbyIssues] = useState([]);
//   const [allIssues, setAllIssues] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [userLocation, setUserLocation] = useState(null);
//   const [radiusKm, setRadiusKm] = useState(5); // Default 5km radius
//   const [locationError, setLocationError] = useState(null);
//   const [categoryFilter, setCategoryFilter] = useState('all');

//   const navigate = useNavigate();
//   const { user, logout } = useAuth();

//   useEffect(() => {
//     if (!user) {
//       navigate('/login');
//       return;
//     }

//     // Get user's location
//     getUserLocation();
//     fetchData();
//   }, [user, navigate]);

//   useEffect(() => {
//     // Recalculate nearby issues when location or radius changes
//     if (userLocation && allIssues.length > 0) {
//       filterNearbyIssues();
//     }
//   }, [userLocation, radiusKm, allIssues, categoryFilter]);

//   const getUserLocation = () => {
//     if (!navigator.geolocation) {
//       setLocationError('Geolocation is not supported by your browser');
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setUserLocation({
//           lat: position.coords.latitude,
//           lng: position.coords.longitude
//         });
//         setLocationError(null);
//       },
//       (error) => {
//         console.error('Error getting location:', error);
//         setLocationError('Unable to get your location. Using default area.');
//         // Set default location (e.g., city center)
//         setUserLocation({ lat: 19.076, lng: 72.8777 }); // Mumbai as default
//       }
//     );
//   };

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const issues = await issuesAPI.getIssues();
//       setAllIssues(issues || []);
      
//       const userId = user._id || user.id;
//       const userIssues = issues.filter(issue => {
//         const reporterId = issue.reporterId?._id || issue.reporterId;
//         return reporterId === userId || issue.reporterEmail === user.email;
//       });
      
//       setMyIssues(userIssues);
//     } catch (error) {
//       console.error('Error fetching issues:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     // Haversine formula to calculate distance between two coordinates
//     const R = 6371; // Radius of the Earth in km
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = 
//       Math.sin(dLat/2) * Math.sin(dLat/2) +
//       Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//       Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     const distance = R * c;
//     return distance;
//   };

//   const filterNearbyIssues = () => {
//     if (!userLocation) return;

//     const filtered = allIssues
//       .filter(issue => {
//         // Filter by category
//         if (categoryFilter !== 'all' && issue.category !== categoryFilter) {
//           return false;
//         }

//         // Calculate distance
//         if (issue.coordinates && issue.coordinates.lat && issue.coordinates.lng) {
//           const distance = calculateDistance(
//             userLocation.lat,
//             userLocation.lng,
//             issue.coordinates.lat,
//             issue.coordinates.lng
//           );
//           return distance <= radiusKm;
//         }
//         return false;
//       })
//       .map(issue => {
//         // Add distance to each issue
//         const distance = calculateDistance(
//           userLocation.lat,
//           userLocation.lng,
//           issue.coordinates.lat,
//           issue.coordinates.lng
//         );
//         return { ...issue, distance };
//       })
//       .sort((a, b) => a.distance - b.distance); // Sort by nearest first

//     setNearbyIssues(filtered);
//   };

//   const stats = {
//     totalIssues: myIssues.length,
//     resolvedIssues: myIssues.filter(i => i.status?.toLowerCase() === 'resolved').length,
//     votesReceived: myIssues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0),
//     activeReports: myIssues.filter(i => i.status?.toLowerCase() !== 'resolved').length
//   };

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

//   const getStatusBadge = (status) => {
//     const normalized = normalizeStatus(status);
//     const styles = {
//       'Open': 'bg-gradient-to-b from-yellow-400 to-yellow-500',
//       'In Progress': 'bg-gradient-to-b from-blue-400 to-blue-600',
//       'Resolved': 'bg-gradient-to-b from-green-400 to-green-500'
//     };
//     return styles[normalized] || 'bg-gray-400';
//   };

//   const getTimeAgo = (dateString) => {
//     if (!dateString) return 'Unknown';
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMs = now - date;
//       const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
//       if (diffDays === 0) return 'Today';
//       if (diffDays === 1) return 'Yesterday';
//       if (diffDays < 7) return `${diffDays}d ago`;
//       if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
//       return `${Math.floor(diffDays / 30)}mo ago`;
//     } catch {
//       return 'Unknown';
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
//     <div
//       onClick={onClick}
//       className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
//         active 
//           ? 'bg-white text-slate-900 shadow-md' 
//           : 'text-white hover:bg-white/10'
//       }`}
//     >
//       <Icon className="w-5 h-5" />
//       <span className="font-medium">{label}</span>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-[#43c6ac] to-[#191654] flex items-center justify-center">
//         <div className="text-white text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
//           <p className="text-lg">Loading your dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen text-white">
//       <div className="flex relative">
//         {/* Sidebar */}
//         <aside className={`${sidebarOpen ? 'w-60' : 'w-0'} min-h-screen bg-white/10 backdrop-blur-lg border-r border-white/20 overflow-hidden transition-all duration-300 ease-in-out`}>
//           <div className="w-60 p-6 flex flex-col gap-4">
//             <div className="mb-4">
//               <h3 className="text-lg font-semibold text-white mb-1">Welcome back,</h3>
//               <p className="text-white/80 text-sm">{user?.name || 'User'}</p>
//             </div>

//             <SidebarItem icon={FileText} label="Dashboard" active={true} />
//             <SidebarItem icon={FileText} label="My Reports" onClick={() => navigate('/my-reports')} />
//             <SidebarItem icon={Map} label="View All Issues" onClick={() => navigate('/issues')} />
            
//             <div className="border-t border-white/20 pt-4 space-y-2 mt-auto">
//               <SidebarItem icon={Settings} label="Settings" />
//               <SidebarItem icon={LogOut} label="Log Out" onClick={handleLogout} />
//             </div>
//           </div>
//         </aside>

//         {/* Toggle Button */}
//         <button
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//           className="absolute left-0 top-4 z-50 bg-white text-slate-900 rounded-r-lg p-2 shadow-lg hover:bg-gray-100 transition-all duration-300"
//           style={{ left: sidebarOpen ? '240px' : '0px' }}
//         >
//           {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
//         </button>

//         {/* Main Content */}
//         <main className="flex-1 p-8 overflow-y-auto">
//           <div className="max-w-7xl mx-auto">
//             {/* Analytics Section */}
//             <div className="mb-12">
//               <h2 className="text-white text-2xl font-bold mb-6">Your Statistics</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
//                   <div className="h-2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]" />
//                   <div className="p-6 text-center">
//                     <div className="text-4xl font-bold text-slate-900 mb-2">{stats.totalIssues}</div>
//                     <div className="text-slate-600 font-medium">Total Reported</div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
//                   <div className="h-2 bg-gradient-to-r from-[#56ab2f] to-[#a8e063]" />
//                   <div className="p-6 text-center">
//                     <div className="text-4xl font-bold text-slate-900 mb-2">{stats.resolvedIssues}</div>
//                     <div className="text-slate-600 font-medium">Resolved</div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
//                   <div className="h-2 bg-gradient-to-r from-[#fbb034] to-[#ffdd00]" />
//                   <div className="p-6 text-center">
//                     <div className="text-4xl font-bold text-slate-900 mb-2">{stats.votesReceived}</div>
//                     <div className="text-slate-600 font-medium">Votes Received</div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
//                   <div className="h-2 bg-gradient-to-r from-[#43c6ac] to-[#191654]" />
//                   <div className="p-6 text-center">
//                     <div className="text-4xl font-bold text-slate-900 mb-2">{stats.activeReports}</div>
//                     <div className="text-slate-600 font-medium">Active Reports</div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Nearby Issues Section */}
//             <div className="mb-12">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h2 className="text-white text-2xl font-bold mb-2">Issues Near You</h2>
//                   <p className="text-white/70 text-sm">
//                     {locationError ? (
//                       <span className="text-yellow-300">⚠️ {locationError}</span>
//                     ) : userLocation ? (
//                       <span>Showing issues within {radiusKm}km of your location</span>
//                     ) : (
//                       <span>Getting your location...</span>
//                     )}
//                   </p>
//                 </div>
//                 <Link
//                   to="/report"
//                   className="bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
//                 >
//                   + Report New Issue
//                 </Link>
//               </div>

//               {/* Filters */}
//               <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 mb-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* Radius Slider */}
//                   <div>
//                     <label className="block text-white text-sm font-semibold mb-2">
//                       Search Radius: {radiusKm}km
//                     </label>
//                     <input
//                       type="range"
//                       min="1"
//                       max="50"
//                       value={radiusKm}
//                       onChange={(e) => setRadiusKm(Number(e.target.value))}
//                       className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
//                       style={{
//                         background: `linear-gradient(to right, #00b4db 0%, #00b4db ${(radiusKm/50)*100}%, rgba(255,255,255,0.2) ${(radiusKm/50)*100}%, rgba(255,255,255,0.2) 100%)`
//                       }}
//                     />
//                     <div className="flex justify-between text-white/60 text-xs mt-1">
//                       <span>1km</span>
//                       <span>50km</span>
//                     </div>
//                   </div>

//                   {/* Category Filter */}
//                   <div>
//                     <label className="block text-white text-sm font-semibold mb-2">
//                       Filter by Category
//                     </label>
//                     <select
//                       value={categoryFilter}
//                       onChange={(e) => setCategoryFilter(e.target.value)}
//                       className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#00b4db] cursor-pointer"
//                     >
//                       <option value="all" className="bg-slate-800">All Categories</option>
//                       <option value="lighting" className="bg-slate-800">Lighting</option>
//                       <option value="road" className="bg-slate-800">Road & Infrastructure</option>
//                       <option value="waste" className="bg-slate-800">Waste</option>
//                       <option value="water" className="bg-slate-800">Water Supply</option>
//                       <option value="traffic" className="bg-slate-800">Traffic</option>
//                       <option value="safety" className="bg-slate-800">Safety</option>
//                       <option value="other" className="bg-slate-800">Other</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Refresh Location Button */}
//                 <div className="mt-4 flex items-center gap-3">
//                   <button
//                     onClick={getUserLocation}
//                     className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
//                   >
//                     <Navigation className="w-4 h-4" />
//                     Refresh Location
//                   </button>
//                   <span className="text-white/60 text-sm">
//                     Found {nearbyIssues.length} issue{nearbyIssues.length !== 1 ? 's' : ''} nearby
//                   </span>
//                 </div>
//               </div>

//               {/* Nearby Issues List */}
//               {nearbyIssues.length === 0 ? (
//                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center border border-white/20">
//                   <Map className="w-16 h-16 text-white/50 mx-auto mb-4" />
//                   <h3 className="text-xl font-semibold text-white mb-2">No Issues Found Nearby</h3>
//                   <p className="text-white/70 mb-6">
//                     {locationError 
//                       ? "We couldn't get your location. Try adjusting the search radius or enable location services."
//                       : "There are no reported issues within your selected radius. Try increasing the search distance."}
//                   </p>
//                 </div>
//               ) : (
//                 <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
//                   <div className="overflow-x-auto">
//                     <table className="w-full">
//                       <thead className="bg-white/5 border-b border-white/10">
//                         <tr>
//                           <th className="px-6 py-4 text-left text-sm font-semibold text-white">Issue</th>
//                           <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
//                           <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
//                           <th className="px-6 py-4 text-left text-sm font-semibold text-white">Distance</th>
//                           <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
//                           <th className="px-6 py-4 text-center text-sm font-semibold text-white">View</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {nearbyIssues.map((issue) => (
//                           <tr key={issue._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
//                             <td className="px-6 py-4">
//                               <div className="flex flex-col gap-1">
//                                 <h3 className="text-white font-medium text-base">{issue.title}</h3>
//                                 <p className="text-white/60 text-sm line-clamp-1">{issue.description}</p>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4">
//                               <span className="inline-flex items-center bg-white/20 text-white rounded-full px-3 py-1 text-xs font-medium capitalize">
//                                 {issue.category}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4">
//                               <span className={`inline-flex items-center ${getStatusBadge(issue.status)} text-white rounded-full px-3 py-1 text-xs font-medium shadow-sm`}>
//                                 {normalizeStatus(issue.status)}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4">
//                               <div className="flex items-center gap-2 text-white/80 text-sm">
//                                 <MapPin className="w-4 h-4 flex-shrink-0 text-white/60" />
//                                 <span className="font-medium">{issue.distance.toFixed(1)}km</span>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4">
//                               <div className="flex items-center gap-2 text-white/80 text-sm">
//                                 <Calendar className="w-4 h-4 text-white/60" />
//                                 <span>{getTimeAgo(issue.reportedDate || issue.createdAt)}</span>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4">
//                               <div className="flex items-center justify-center">
//                                 <Link 
//                                   to={`/issues/${issue._id}`}
//                                   className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
//                                   title="View Details"
//                                 >
//                                   <Eye className="w-4 h-4" />
//                                 </Link>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
