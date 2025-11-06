// src/pages/MyReports.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Map, 
  ThumbsUp, 
  MessageCircle, 
  MapPin, 
  Calendar,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Trash2,
  Edit2,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { issuesAPI } from '../../services/api';

export default function MyReports() {
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyIssues();
  }, [user, navigate]);

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      const issues = await issuesAPI.getIssues();
      
      const userId = user._id || user.id;
      const userIssues = issues.filter(issue => {
        const reporterId = issue.reporterId?._id || issue.reporterId;
        return reporterId === userId || issue.reporterEmail === user.email;
      });
      
      setMyIssues(userIssues);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteIssue = async (issueId, issueTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${issueTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await issuesAPI.deleteIssue(issueId);
      setMyIssues(prev => prev.filter(issue => issue._id !== issueId));
      alert('Issue deleted successfully');
    } catch (error) {
      console.error('Error deleting issue:', error);
      alert('Failed to delete issue. Please try again.');
    }
  };

  // Calculate statistics
  const stats = {
    totalIssues: myIssues.length,
    openIssues: myIssues.filter(i => i.status?.toLowerCase() === 'open').length,
    inProgressIssues: myIssues.filter(i => i.status?.toLowerCase() === 'in progress' || i.status?.toLowerCase() === 'inprogress').length,
    resolvedIssues: myIssues.filter(i => i.status?.toLowerCase() === 'resolved').length,
    totalVotes: myIssues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0),
    totalComments: myIssues.reduce((sum, issue) => sum + (Array.isArray(issue.comments) ? issue.comments.length : 0), 0)
  };

  // Filter and sort issues
  const filteredIssues = myIssues
    .filter(issue => {
      const matchesSearch = !searchQuery || 
        issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        issue.status?.toLowerCase() === statusFilter.toLowerCase() ||
        (statusFilter === 'inprogress' && issue.status?.toLowerCase() === 'in progress');
      
      const matchesCategory = categoryFilter === 'all' || 
        issue.category?.toLowerCase() === categoryFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.reportedDate || b.createdAt) - new Date(a.reportedDate || a.createdAt);
        case 'oldest':
          return new Date(a.reportedDate || a.createdAt) - new Date(b.reportedDate || b.createdAt);
        case 'mostVoted':
          return (b.upvotes || 0) - (a.upvotes || 0);
        case 'mostCommented':
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        default:
          return 0;
      }
    });

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
          <p className="text-lg">Loading your reports...</p>
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

            <SidebarItem 
              icon={FileText} 
              label="Dashboard" 
              onClick={() => navigate('/dashboard')} 
            />
            <SidebarItem 
              icon={FileText} 
              label="My Reports" 
              active={true}
            />
            <SidebarItem 
              icon={Map} 
              label="View Issues" 
              onClick={() => navigate('/issues')} 
            />
            
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
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">My Reports</h1>
              <p className="text-white/70">Track and manage all your reported issues</p>
            </div>


            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 text-white placeholder-white/60 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#00b4db] cursor-pointer"
                >
                  <option value="all" className="bg-slate-800">All Status</option>
                  <option value="open" className="bg-slate-800">Open</option>
                  <option value="inprogress" className="bg-slate-800">In Progress</option>
                  <option value="resolved" className="bg-slate-800">Resolved</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#00b4db] cursor-pointer"
                >
                  <option value="all" className="bg-slate-800">All Categories</option>
                  <option value="lighting" className="bg-slate-800">Lighting</option>
                  <option value="road" className="bg-slate-800">Road & Infrastructure</option>
                  <option value="waste" className="bg-slate-800">Waste</option>
                  <option value="water" className="bg-slate-800">Water Supply</option>
                  <option value="traffic" className="bg-slate-800">Traffic</option>
                  <option value="safety" className="bg-slate-800">Safety</option>
                  <option value="other" className="bg-slate-800">Other</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#00b4db] cursor-pointer"
                >
                  <option value="newest" className="bg-slate-800">Newest First</option>
                  <option value="oldest" className="bg-slate-800">Oldest First</option>
                  <option value="mostVoted" className="bg-slate-800">Most Voted</option>
                  <option value="mostCommented" className="bg-slate-800">Most Commented</option>
                </select>
              </div>
            </div>

            {/* Reports Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-2xl font-bold">
                  Your Reports ({filteredIssues.length})
                </h2>
              </div>

              {filteredIssues.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center border border-white/20">
                  <FileText className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {myIssues.length === 0 ? 'No Reports Yet' : 'No Matching Reports'}
                  </h3>
                  <p className="text-white/70 mb-6">
                    {myIssues.length === 0 
                      ? "You haven't reported any issues yet." 
                      : "Try adjusting your filters to see more results."}
                  </p>
                  {myIssues.length === 0 && (
                    <Link
                      to="/report"
                      className="inline-block bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                    >
                      Report Your First Issue
                    </Link>
                  )}
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-white">Issue</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-white">Location</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredIssues.map((issue) => (
                          <tr key={issue._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <h3 className="text-white font-medium text-base">{issue.title}</h3>
                                <p className="text-white/60 text-sm line-clamp-1">{issue.description}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center bg-white/20 text-white rounded-full px-3 py-1 text-xs font-medium capitalize">
                                {issue.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center ${getStatusBadge(issue.status)} text-white rounded-full px-3 py-1 text-xs font-medium shadow-sm`}>
                                {normalizeStatus(issue.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-white/80 text-sm max-w-xs">
                                <MapPin className="w-4 h-4 flex-shrink-0 text-white/60" />
                                <span className="truncate">{issue.location}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-white/80 text-sm">
                                <Calendar className="w-4 h-4 text-white/60" />
                                <span>{getTimeAgo(issue.reportedDate || issue.createdAt)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <Link 
                                  to={`/issues/${issue._id}`}
                                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteIssue(issue._id, issue.title)}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                                  title="Delete Issue"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Total Votes Received</p>
                    <p className="text-3xl font-bold text-white">{stats.totalVotes}</p>
                  </div>
                  <ThumbsUp className="w-12 h-12 text-white/40" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Total Comments</p>
                    <p className="text-3xl font-bold text-white">{stats.totalComments}</p>
                  </div>
                  <MessageCircle className="w-12 h-12 text-white/40" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}