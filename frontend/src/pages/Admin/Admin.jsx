import { useState, useEffect } from 'react';
import { FileText, Users, BarChart2, Download, Settings, LogOut, ChevronUp, ChevronDown, Edit2, Trash2, CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { issuesAPI, usersAPI } from '../../services/api';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  // Fetch issues and users from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [issuesData, usersData] = await Promise.all([
          issuesAPI.getIssues(),
          usersAPI.getUsers()
        ]);
        setIssues(issuesData || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper to get user name by ID
  const getUserName = (userId) => {
    if (!userId) return 'Unknwon';
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  // Analytics data
  const stats = {
    totalIssues: issues.length,
    resolutionRate: issues.length > 0 
      ? Math.round((issues.filter(i => i.status === 'Resolved').length / issues.length) * 100)
      : 0,
    topCategory: issues.length > 0
      ? Object.entries(
          issues.reduce((acc, i) => {
            const cat = i.category || 'Other';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      : 'N/A',
    activeUsers: users.length
  };

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedIssues = [...issues].sort((a, b) => {
    let aVal, bVal;
    
    if (sortField === 'reporter') {
      aVal = getUserName(a.reporterId);
      bVal = getUserName(b.reporterId);
    } else if (sortField === 'date') {
      aVal = new Date(a.reportedDate || a.createdAt);
      bVal = new Date(b.reportedDate || b.createdAt);
    } else {
      aVal = a[sortField] || '';
      bVal = b[sortField] || '';
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIssues = sortedIssues.slice(startIndex, startIndex + itemsPerPage);

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
      'Open': 'bg-gradient-to-r from-yellow-400 to-yellow-500',
      'In Progress': 'bg-gradient-to-r from-blue-400 to-blue-600',
      'Resolved': 'bg-gradient-to-r from-green-400 to-green-500'
    };
    return styles[normalized] || 'bg-gray-400';
  };

  const getStatusIcon = (status) => {
    const normalized = normalizeStatus(status);
    const icons = {
      'Open': <AlertCircle className="w-3 h-3" />,
      'In Progress': <Clock className="w-3 h-3" />,
      'Resolved': <CheckCircle className="w-3 h-3" />
    };
    return icons[normalized];
  };

  const handleDeleteIssue = async (issueId) => {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    
    try {
      await fetch(`https://68daac4623ebc87faa30ec78.mockapi.io/api/vish/issues/${issueId}`, {
        method: 'DELETE'
      });
      setIssues(issues.filter(i => i.id !== issueId));
    } catch (error) {
      console.error('Error deleting issue:', error);
      alert('Failed to delete issue');
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await issuesAPI.updateIssue(issueId, { status: newStatus });
      setIssues(issues.map(i => i.id === issueId ? { ...i, status: newStatus } : i));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const SidebarItem = ({ icon: Icon, label, value, active }) => (
    <div
      onClick={() => setActiveTab(value)}
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

  const SortIcon = ({ field }) => (
    <div className="flex flex-col ml-1">
      <ChevronUp className={`w-3 h-3 ${sortField === field && sortOrder === 'asc' ? 'text-white' : 'text-white/30'}`} />
      <ChevronDown className={`w-3 h-3 -mt-1 ${sortField === field && sortOrder === 'desc' ? 'text-white' : 'text-white/30'}`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#43c6ac] to-[#191654] text-white">
      <div className="flex relative">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} min-h-screen bg-white/10 backdrop-blur-lg border-r border-white/20 overflow-hidden transition-all duration-300 ease-in-out`}>
          <div className="w-64 p-6 flex flex-col gap-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
              <p className="text-white/70 text-sm">Manage your platform</p>
            </div>

            <SidebarItem icon={BarChart2} label="Overview" value="overview" active={activeTab === 'overview'} />
            <SidebarItem icon={FileText} label="All Issues" value="issues" active={activeTab === 'issues'} />
            <SidebarItem icon={Users} label="Users" value="users" active={activeTab === 'users'} />
            <SidebarItem icon={Download} label="Export Reports" value="export" active={activeTab === 'export'} />
            
            <div className="border-t border-white/20 pt-4 space-y-2 mt-auto">
              <SidebarItem icon={Settings} label="Settings" value="settings" active={activeTab === 'settings'} />
              <SidebarItem icon={LogOut} label="Log Out" value="logout" active={false} />
            </div>
          </div>
        </aside>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-4 z-50 bg-white text-slate-900 rounded-r-lg p-2 shadow-lg hover:bg-gray-100 transition-all duration-300"
          style={{ left: sidebarOpen ? '256px' : '0px' }}
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-x-auto">
          {/* Stats Cards */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]" />
                <div className="p-6">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.totalIssues}</div>
                  <div className="text-slate-600 font-medium">Total Issues</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-2 bg-gradient-to-r from-[#fbb034] to-[#ffdd00]" />
                <div className="p-6">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.resolutionRate}%</div>
                  <div className="text-slate-600 font-medium">Resolution Rate</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-2 bg-gradient-to-r from-[#56ab2f] to-[#a8e063]" />
                <div className="p-6">
                  <div className="text-4xl font-bold text-slate-900 mb-2 capitalize">{stats.topCategory}</div>
                  <div className="text-slate-600 font-medium">Top Category</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
                <div className="h-2 bg-gradient-to-r from-[#43c6ac] to-[#191654]" />
                <div className="p-6">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.activeUsers}</div>
                  <div className="text-slate-600 font-medium">Registered Users</div>
                </div>
              </div>
            </div>
          </div>

          {/* Issues Table */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">All Issues</h2>
                <div className="text-sm text-white/70">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, issues.length)} of {issues.length}
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Loading issues...</p>
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="bg-white/5 rounded-lg p-4 mb-2">
                    <div className="grid grid-cols-12 gap-4 items-center text-sm font-semibold">
                      <div className="col-span-3 flex items-center cursor-pointer" onClick={() => handleSort('title')}>
                        Issue Title
                        <SortIcon field="title" />
                      </div>
                      <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort('category')}>
                        Category
                        <SortIcon field="category" />
                      </div>
                      <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort('status')}>
                        Status
                        <SortIcon field="status" />
                      </div>
                      <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort('reporter')}>
                        Reporter
                        <SortIcon field="reporter" />
                      </div>
                      <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort('date')}>
                        Date
                        <SortIcon field="date" />
                      </div>
                      <div className="col-span-1 text-center">Actions</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="space-y-2">
                    {paginatedIssues.length === 0 ? (
                      <div className="text-center py-12 text-white/70">
                        No issues found
                      </div>
                    ) : (
                      paginatedIssues.map((issue) => (
                        <div key={issue.id} className="bg-white rounded-lg p-4 hover:shadow-xl transition-shadow">
                          <div className="grid grid-cols-12 gap-4 items-center text-sm">
                            <div className="col-span-3 text-slate-900 font-medium">
                              <div className="truncate" title={issue.title}>
                                {issue.title}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {issue.upvotes || 0} votes • {Array.isArray(issue.comments) ? issue.comments.length : 0} comments
                              </div>
                            </div>
                            
                            <div className="col-span-2">
                              <span className="inline-flex items-center gap-1 bg-gray-100 text-slate-700 text-xs font-medium px-2 py-1 rounded-full capitalize">
                                {issue.category || 'Other'}
                              </span>
                            </div>
                            
                            <div className="col-span-2">
                              <select
                                value={normalizeStatus(issue.status)}
                                onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                                className={`${getStatusBadge(issue.status)} text-white text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1 cursor-pointer border-none outline-none`}
                              >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            </div>
                            
                            <div className="col-span-2 text-slate-700 font-medium">
                              {getUserName(issue.reporterId)}
                            </div>
                            
                            <div className="col-span-2 text-slate-600">
                              {new Date(issue.reportedDate || issue.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            
                            <div className="col-span-1 flex gap-2 justify-center">
                              <button 
                                onClick={() => window.open(`/issues/${issue.id}`, '_blank')}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Edit2 className="w-4 h-4 text-blue-600" />
                              </button>
                              <button 
                                onClick={() => handleDeleteIssue(issue.id)}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete Issue"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        Previous
                      </button>
                      
                      <div className="flex gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                                currentPage === pageNum
                                  ? 'bg-white text-slate-900'
                                  : 'bg-white/5 hover:bg-white/10'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}