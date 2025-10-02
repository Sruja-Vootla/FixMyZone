import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Map, ThumbsUp, Settings, LogOut, MessageCircle, MapPin, ChevronLeft, ChevronRight} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Mock user's reported issues
    const mockIssues = [
      {
        id: 1,
        title: 'Pothole near Main Street',
        category: 'Road',
        categoryIcon: '🛣️',
        status: 'Open',
        location: 'Downtown, Block A',
        timeAgo: '2d ago',
        upvotes: 12,
        comments: 5,
        image: null
      },
      {
        id: 2,
        title: 'Broken streetlight on Oak Ave',
        category: 'Lighting',
        categoryIcon: '💡',
        status: 'In Progress',
        location: 'Oak Avenue, Block C',
        timeAgo: '5d ago',
        upvotes: 8,
        comments: 3,
        image: null
      },
      {
        id: 3,
        title: 'Garbage overflow at Market',
        category: 'Waste',
        categoryIcon: '🗑️',
        status: 'Resolved',
        location: 'Central Market',
        timeAgo: '1w ago',
        upvotes: 15,
        comments: 7,
        image: null
      }
    ];
    setIssues(mockIssues);
  }, []);

  const stats = {
    totalIssues: 12,
    resolvedIssues: 7,
    votesGiven: 45,
    activeReports: 5
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Open': 'bg-gradient-to-b from-yellow-400 to-yellow-500',
      'In Progress': 'bg-gradient-to-b from-blue-400 to-blue-600',
      'Resolved': 'bg-gradient-to-b from-green-400 to-green-500'
    };
    return styles[status] || 'bg-gray-400';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#43c6ac] to-[#191654] text-white">
      {/* Dashboard Body */}
      <div className="flex relative">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-60' : 'w-0'} min-h-screen bg-white/10 backdrop-blur-lg border-r border-white/20 overflow-hidden transition-all duration-300 ease-in-out`}>
          <div className="w-60 p-6 flex flex-col gap-4">
            <SidebarItem icon={FileText} label="My Reports" active={true} />
            <SidebarItem icon={Map} label="Map View" active={true}/>
            <SidebarItem icon={ThumbsUp} label="Voted Issues" active={true}/>
            
            <div className="border-t border-white/20 pt-4 space-y-2">
              <SidebarItem icon={Settings} label="Settings" active={true}/>
              <SidebarItem icon={LogOut} label="Log Out" active={true} onClick={handleLogout} />
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
          {/* Recent Issues Section */}
          <div className="mb-12">
            <h2 className="text-[#9EB3D0] text-xl font-bold mb-6 text-center">My Recent Issues</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <div key={issue.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                  {/* Image Wrapper */}
                  <div className="relative h-36 bg-gray-300 flex items-center justify-center">
                    <span className="text-5xl">{issue.categoryIcon}</span>
                    <div className={`absolute top-2 left-2 ${getStatusBadge(issue.status)} text-white rounded-full px-3 py-1 text-xs font-medium`}>
                      {issue.status}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    {/* Title */}
                    <h3 className="text-slate-900 text-base font-medium line-clamp-2">{issue.title}</h3>
                    
                    {/* Category Chip */}
                    <div className="flex items-center gap-2 bg-gray-100 text-slate-900 rounded-full px-3 py-1 w-fit">
                      <span className="text-base">{issue.categoryIcon}</span>
                      <span className="text-xs font-medium">{issue.category}</span>
                    </div>

                    {/* Location & Time */}
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{issue.location}</span>
                      </div>
                      <span>{issue.timeAgo}</span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <button className="text-[#0083b0] text-sm font-medium hover:underline">
                        View
                      </button>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-slate-500">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs">{issue.upvotes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs">{issue.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="mb-12">
            <h2 className="text-[#9EB3D0] text-xl font-bold mb-6 text-center">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]" />
                <div className="p-6 text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.totalIssues}</div>
                  <div className="text-slate-600">Total Issues</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#fbb034] to-[#ffdd00]" />
                <div className="p-6 text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.resolvedIssues}</div>
                  <div className="text-slate-600">Resolved Issues</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#56ab2f] to-[#a8e063]" />
                <div className="p-6 text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.votesGiven}</div>
                  <div className="text-slate-600">Votes Given</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]" />
                <div className="p-6 text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stats.activeReports}</div>
                  <div className="text-slate-600">Active Reports</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}