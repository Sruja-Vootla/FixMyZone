import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Map, ThumbsUp, Settings, LogOut, MessageCircle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { issuesAPI } from '../../services/api';

export default function Dashboard() {
  const [myIssues, setMyIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
        
        // Filter issues reported by this user
        const userIssues = issues.filter(issue => 
          issue.reporterId === user.id || 
          issue.reporterName === user.name
        );
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
    if (!status) return 'Open';
    const statusMap = {
      'open': 'Open',
      'in progress': 'In Progress',
      'inprogress': 'In Progress',
      'resolved': 'Resolved'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getStatusBadge = (status) => {
    const normalized = normalizeStatus(status);
    const styles = {
      'Open': 'bg-gradient-to-b from-yellow-400 to-yellow-500',
      'In Progress': 'bg-gradient-to-b from-blue-400 to-blue-600',
      'Resolved': 'bg-gradient-to-b from-green-400 to-green-500'
    };
    return styles[normalized] || 'bg-gray-400';
  };

  // const getCategoryIcon = (category) => {
  //   const iconMap = {
  //     'lighting': '💡',
  //     'road': '🛣️',
  //     'waste': '🗑️',
  //     'water': '💧',
  //     'traffic': '🚦',
  //     'safety': '🛡️',
  //     'other': '📋'
  //   };
  //   return iconMap[category?.toLowerCase()] || '📍';
  // };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      return `${Math.floor(diffDays / 30)}mo ago`;
    } catch {
      return 'Unknown';
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
          <p className="text-lg">Loading your dashboard...</p>
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
              <h3 className="text-lg font-semibold text-white mb-1">Welcome back,</h3>
              <p className="text-white/80 text-sm">{user?.name || 'User'}</p>
            </div>

            <SidebarItem icon={FileText} label="My Reports" active={true} />
            <SidebarItem icon={Map} label="Map View" onClick={() => navigate('/issues')} />
            {/* <SidebarItem icon={ThumbsUp} label="All Issues" onClick={() => navigate('/issues')} /> */}
            
            <div className="border-t border-white/20 pt-4 space-y-2 mt-auto">
              <SidebarItem icon={Settings} label="Settings" />
              <SidebarItem icon={LogOut} label="Log Out" onClick={handleLogout} />
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
            <h2 className="text-white text-2xl font-bold mb-6">Your Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]" />
                <div className="p-6 text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.totalIssues}</div>
                  <div className="text-slate-600 font-medium">Total Reported</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-2 bg-gradient-to-r from-[#56ab2f] to-[#a8e063]" />
                <div className="p-6 text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.resolvedIssues}</div>
                  <div className="text-slate-600 font-medium">Resolved</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-2 bg-gradient-to-r from-[#fbb034] to-[#ffdd00]" />
                <div className="p-6 text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.votesReceived}</div>
                  <div className="text-slate-600 font-medium">Votes Received</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-2 bg-gradient-to-r from-[#43c6ac] to-[#191654]" />
                <div className="p-6 text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.activeReports}</div>
                  <div className="text-slate-600 font-medium">Active Reports</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Issues Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-2xl font-bold">My Recent Issues</h2>
              <Link
                to="/report"
                className="bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white px-4 py-2 rounded-full font-semibold hover:scale-105 transition-transform"
              >
                + Report New Issue
              </Link>
            </div>

            {myIssues.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center border border-white/20">
                <FileText className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Issues Yet</h3>
                <p className="text-white/70 mb-6">You haven't reported any issues yet.</p>
                <Link
                  to="/report"
                  className="inline-block bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                >
                  Report Your First Issue
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myIssues.map((issue) => (
                  <div key={issue.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow">
                    {/* Image Wrapper */}
                    <div className="relative h-36 bg-gray-300 flex items-center justify-center">
                      {issue.images && issue.images.length > 0 ? (
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
                      <div className="w-full h-full flex items-center justify-center" style={{ display: issue.images && issue.images.length > 0 ? 'none' : 'flex' }}>
                        {/* <span className="text-5xl">{getCategoryIcon(issue.category)}</span> */}
                      </div>
                      <div className={`absolute top-2 left-2 ${getStatusBadge(issue.status)} text-white rounded-full px-3 py-1 text-xs font-medium`}>
                        {normalizeStatus(issue.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <h3 className="text-slate-900 text-base font-medium line-clamp-2">{issue.title}</h3>
                      
                      <div className="flex items-center gap-2 bg-gray-100 text-slate-900 rounded-full px-3 py-1 w-fit">
                        {/* <span className="text-base">{getCategoryIcon(issue.category)}</span> */}
                        <span className="text-xs font-medium capitalize">{issue.category}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{issue.location}</span>
                        </div>
                        <span>{getTimeAgo(issue.reportedDate || issue.createdAt)}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-auto">
                        <Link 
                          to={`/issues/${issue.id}`}
                          className="text-[#0083b0] text-sm font-medium hover:underline"
                        >
                          View Details
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