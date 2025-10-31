// src/pages/Admin/Users.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Calendar,
  FileText,
  Shield,
  Edit2,
  Trash2,
  X,
  Save,
  Settings,
  LogOut,
  BarChart2,
  Download
} from 'lucide-react';
import { usersAPI, issuesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { logout, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: 'user' });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, issuesData] = await Promise.all([
        usersAPI.getUsers(),
        issuesAPI.getIssues()
      ]);
      setUsers(usersData || []);
      setIssues(issuesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  // Get user statistics
  const getUserStats = (userId) => {
    const userIssues = issues.filter(issue => {
      const reporterId = typeof issue.reporterId === 'object' 
        ? issue.reporterId._id 
        : issue.reporterId;
      return reporterId === userId;
    });

    const totalVotes = userIssues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0);
    const resolvedIssues = userIssues.filter(i => i.status === 'resolved').length;

    return {
      totalReports: userIssues.length,
      totalVotes,
      resolvedIssues
    };
  };

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        !searchQuery ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      let aVal, bVal;
      
      if (sortField === 'name') {
        aVal = a.name?.toLowerCase() || '';
        bVal = b.name?.toLowerCase() || '';
      } else if (sortField === 'email') {
        aVal = a.email?.toLowerCase() || '';
        bVal = b.email?.toLowerCase() || '';
      } else if (sortField === 'role') {
        aVal = a.role || 'user';
        bVal = b.role || 'user';
      } else if (sortField === 'reports') {
        aVal = getUserStats(a._id || a.id).totalReports;
        bVal = getUserStats(b._id || b.id).totalReports;
      } else {
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Overall statistics
  const stats = {
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    regularUsers: users.filter(u => u.role === 'user').length,
    activeUsers: users.filter(u => {
      const stats = getUserStats(u._id || u.id);
      return stats.totalReports > 0;
    }).length
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user'
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      const userId = selectedUser._id || selectedUser.id;
      await usersAPI.updateUser(userId, editFormData);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          (u._id || u.id) === userId 
            ? { ...u, ...editFormData }
            : u
        )
      );
      
      setShowEditModal(false);
      setSelectedUser(null);
      alert('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await usersAPI.deleteUser(userId);
      setUsers(prevUsers => prevUsers.filter(u => (u._id || u.id) !== userId));
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.message || 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

//   const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
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
  const SidebarItem = ({ icon: Icon, label, value, active, onClick }) => (
    <div
      onClick={onClick || (() => setActiveTab(value))}
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
    <div className="min-h-screen text-white">
      <div className="flex relative">
        {/* Sidebar */}
                {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} min-h-screen bg-white/10 backdrop-blur-lg border-r border-white/20 overflow-hidden transition-all duration-300 ease-in-out`}>
          <div className="w-64 p-6 flex flex-col gap-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
            </div>

            <SidebarItem icon={BarChart2} label="Overview" value="overview" active={activeTab === 'overview'} />
            <SidebarItem icon={FileText} label="All Issues" onClick={() => navigate('/issues')}  />
            {/* <SidebarItem icon={Users} label="Users" value="users" active={activeTab === 'users'} /> */}
            <SidebarItem icon={Users} label="Users" onClick={() => navigate('/admin/users')} />
            <SidebarItem icon={Download} label="Export Reports" value="export" active={activeTab === 'export'} />
            
            <div className="border-t border-white/20 pt-4 space-y-2 mt-auto">
              <SidebarItem icon={Settings} label="Settings" value="settings" active={activeTab === 'settings'} />
              <SidebarItem icon={LogOut} label="Log Out" value="logout" active={false} onClick={handleLogout} />
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-white/70">Manage and monitor all registered users</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
              <div className="h-2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]" />
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">{stats.totalUsers}</div>
                <div className="text-slate-600 font-medium">Total Users</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
              <div className="h-2 bg-gradient-to-r from-[#f093fb] to-[#f5576c]" />
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">{stats.adminUsers}</div>
                <div className="text-slate-600 font-medium">Admin Users</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
              <div className="h-2 bg-gradient-to-r from-[#56ab2f] to-[#a8e063]" />
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">{stats.regularUsers}</div>
                <div className="text-slate-600 font-medium">Regular Users</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
              <div className="h-2 bg-gradient-to-r from-[#fbb034] to-[#ffdd00]" />
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">{stats.activeUsers}</div>
                <div className="text-slate-600 font-medium">Active Users</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 text-white placeholder-white/60 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#00b4db] cursor-pointer appearance-none"
                >
                  <option value="all" className="bg-slate-800">All Roles</option>
                  <option value="user" className="bg-slate-800">Regular Users</option>
                  <option value="admin" className="bg-slate-800">Admins</option>
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortField}
                onChange={(e) => handleSort(e.target.value)}
                className="px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#00b4db] cursor-pointer"
              >
                <option value="createdAt" className="bg-slate-800">Sort by Date</option>
                <option value="name" className="bg-slate-800">Sort by Name</option>
                <option value="email" className="bg-slate-800">Sort by Email</option>
                <option value="role" className="bg-slate-800">Sort by Role</option>
                <option value="reports" className="bg-slate-800">Sort by Reports</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Loading users...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">Reports</th>
                        {/* <th className="px-6 py-4 text-center text-sm font-semibold">Votes</th> */}
                        <th className="px-6 py-4 text-center text-sm font-semibold">Resolved</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center text-white/70">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((user) => {
                          const userId = user._id || user.id;
                          const stats = getUserStats(userId);
                          const isCurrentUser = (currentUser._id || currentUser.id) === userId;
                          
                          return (
                            <tr key={userId} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00b4db] to-[#0083b0] flex items-center justify-center text-white font-bold">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <div className="font-medium">{user.name}</div>
                                    {isCurrentUser && (
                                      <span className="text-xs text-cyan-300">(You)</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-white/60" />
                                  <span className="text-sm">{user.email}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {user.role === 'admin' ? (
                                  <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
                                    <Shield className="w-3 h-3" />
                                    Admin
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                                    <Users className="w-3 h-3" />
                                    User
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <FileText className="w-4 h-4 text-white/60" />
                                  <span className="font-medium">{stats.totalReports}</span>
                                </div>
                              </td>
                              {/* <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <ThumbsUp className="w-4 h-4 text-white/60" />
                                  <span className="font-medium">{stats.totalVotes}</span>
                                </div>
                              </td> */}
                              <td className="px-6 py-4 text-center">
                                <span className="font-medium text-green-400">{stats.resolvedIssues}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-white/60" />
                                  {formatDate(user.createdAt)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    disabled={isCurrentUser}
                                    className={`p-2 hover:bg-blue-500/20 rounded-lg transition-colors ${isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={isCurrentUser ? "Cannot edit your own account" : "Edit user"}
                                  >
                                    <Edit2 className="w-4 h-4 text-blue-400" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(userId, user.name)}
                                    disabled={isCurrentUser}
                                    className={`p-2 hover:bg-red-500/20 rounded-lg transition-colors ${isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={isCurrentUser ? "Cannot delete your own account" : "Delete user"}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                    <div className="text-sm text-white/70">
                      Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div className="flex gap-2">
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
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/20 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit User</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#00b4db] cursor-pointer"
                >
                  <option value="user" className="bg-slate-800">Regular User</option>
                  <option value="admin" className="bg-slate-800">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-3 bg-gradient-to-b from-[#00b4db] to-[#0083b0] hover:scale-105 text-white rounded-lg font-semibold transition-transform flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}