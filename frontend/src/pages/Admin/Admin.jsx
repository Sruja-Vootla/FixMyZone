import { useState, useEffect } from 'react';
import { FileText, Users, BarChart2, Download, Settings, LogOut, ChevronUp, ChevronDown, Edit2, Trash2, CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [issues, setIssues] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const itemsPerPage = 5;

  // Fetch issues from API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch('https://68daac4623ebc87faa30ec78.mockapi.io/api/vish/issues');
        const data = await response.json();
        setIssues(data);
      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    };
    
    fetchIssues();
  }, []);

  // Analytics data - calculate from real issues
  const stats = {
    totalIssues: issues.length,
    resolutionRate: issues.length > 0 
      ? Math.round((issues.filter(i => i.status === 'Resolved').length / issues.length) * 100)
      : 0,
    topCategory: issues.length > 0
      ? Object.entries(
          issues.reduce((acc, i) => {
            acc[i.category] = (acc[i.category] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      : 'N/A',
    activeUsers: new Set(issues.map(i => i.reporter || i.userId)).size
  };

  const categoryStats = issues.length > 0
    ? Object.entries(
        issues.reduce((acc, i) => {
          acc[i.category] = (acc[i.category] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / issues.length) * 100),
        color: 'bg-[#0083b0]'
      }))
    : [];

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
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'date') {
      aVal = new Date(aVal || a.createdAt);
      bVal = new Date(bVal || b.createdAt);
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

  const getStatusBadge = (status) => {
    const styles = {
      'Open': 'bg-gradient-to-r from-yellow-400 to-yellow-500',
      'In Progress': 'bg-gradient-to-r from-blue-400 to-blue-600',
      'Resolved': 'bg-gradient-to-r from-green-400 to-green-500'
    };
    return styles[status] || 'bg-gray-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Open': <AlertCircle className="w-3 h-3" />,
      'In Progress': <Clock className="w-3 h-3" />,
      'Resolved': <CheckCircle className="w-3 h-3" />
    };
    return icons[status];
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#43c6ac] to-[#191654] text-white">
      <div className="flex relative">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} min-h-screen bg-white/10 backdrop-blur-lg border-r border-white/20 overflow-hidden transition-all duration-300 ease-in-out`}>
          <div className="w-64 p-6 flex flex-col gap-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
            </div>

            <SidebarItem icon={BarChart2} label="Overview" value="overview" active={activeTab === 'overview'} />
            <SidebarItem icon={FileText} label="All Issues" value="issues" active={activeTab === 'issues'} />
            <SidebarItem icon={Users} label="Users" value="users" active={activeTab === 'users'} />
            <SidebarItem icon={BarChart2} label="Analytics" value="analytics" active={activeTab === 'analytics'} />
            <SidebarItem icon={Download} label="Export Reports" value="export" active={activeTab === 'export'} />
            
            <div className="border-t border-white/20 pt-4 space-y-2">
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
          <div className="mb-8 min-w-[800px]">
            <h1 className="text-center text-white text-xl font-bold mb-6">Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]" />
                <div className="p-6">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.totalIssues}</div>
                  <div className="text-slate-600">Total Issues</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#fbb034] to-[#ffdd00]" />
                <div className="p-6">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.resolutionRate}%</div>
                  <div className="text-slate-600">Resolution Rate</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#56ab2f] to-[#a8e063]" />
                <div className="p-6">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.topCategory}</div>
                  <div className="text-slate-600">Top Category</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]" />
                <div className="p-6">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.activeUsers}</div>
                  <div className="text-slate-600">Active Users</div>
                </div>
              </div>
            </div>
          </div>

          {/* Issues Table */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden min-w-[800px]">
            <div className="p-6">
              <h2 className="text-center text-xl font-bold mb-4">Recent Issues</h2>
              
              {/* Table Header */}
              <div className="bg-white/5 rounded-lg p-4 mb-4 grid grid-cols-12 gap-4 items-center text-sm font-semibold">
                <div className="col-span-3 flex items-center gap-2 cursor-pointer" onClick={() => handleSort('title')}>
                  Issue
                  <div className="flex flex-col">
                    <ChevronUp className={`w-3 h-3 ${sortField === 'title' && sortOrder === 'asc' ? 'text-white' : 'text-white/30'}`} />
                    <ChevronDown className={`w-3 h-3 -mt-1 ${sortField === 'title' && sortOrder === 'desc' ? 'text-white' : 'text-white/30'}`} />
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2 cursor-pointer" onClick={() => handleSort('category')}>
                  Category
                  <ChevronUp className="w-3 h-3" />
                </div>
                <div className="col-span-2 flex items-center gap-2 cursor-pointer" onClick={() => handleSort('status')}>
                  Status
                  <ChevronUp className="w-3 h-3" />
                </div>
                <div className="col-span-2 flex items-center gap-2 cursor-pointer" onClick={() => handleSort('reporter')}>
                  Reporter
                  <ChevronUp className="w-3 h-3" />
                </div>
                <div className="col-span-2 flex items-center gap-2 cursor-pointer" onClick={() => handleSort('date')}>
                  Date
                  <ChevronUp className="w-3 h-3" />
                </div>
                <div className="col-span-1 text-center">Actions</div>
              </div>

              {/* Table Body */}
              <div className="space-y-2">
                {paginatedIssues.map((issue) => (
                  <div key={issue.id} className="bg-white rounded-lg p-4 grid grid-cols-12 gap-4 items-center text-sm hover:shadow-lg transition-shadow">
                    <div className="col-span-3 text-slate-900 font-medium truncate">{issue.title}</div>
                    <div className="col-span-2 text-slate-600">{issue.category}</div>
                    <div className="col-span-2">
                      <span className={`${getStatusBadge(issue.status)} text-white text-xs font-medium px-3 py-1 rounded-full inline-flex items-center gap-1`}>
                        {getStatusIcon(issue.status)}
                        {issue.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-slate-600">{issue.reporter || issue.userId || 'Unknown'}</div>
                    <div className="col-span-2 text-slate-600">{issue.date ? new Date(issue.date).toLocaleDateString() : new Date(issue.createdAt).toLocaleDateString()}</div>
                    <div className="col-span-1 flex gap-2 justify-center">
                      <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === i + 1
                        ? 'bg-white text-slate-900 font-semibold'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Heat Map Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mt-8 min-w-[800px]">
            <h2 className="text-xl font-bold mb-4 text-center">Issue Density Map</h2>
            <div className="w-full rounded-xl overflow-hidden h-96 bg-gray-600 flex items-center justify-center">
              <span className="text-white/70 text-lg">Map Integration Pending</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}