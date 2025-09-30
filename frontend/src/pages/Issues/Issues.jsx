import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaThumbsUp, FaCommentDots, FaPlus, FaMinus } from 'react-icons/fa';
import { issuesAPI } from "../../services/api";

export default function Issues() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredPin, setHoveredPin] = useState(null);
  const [activePopover, setActivePopover] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await issuesAPI.getIssues();
        setIssues(data);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIssues();
  }, []);

  // Mock data for issues with pin positions
  const mockIssues = [
    {
      id: 1,
      title: "Pothole near Main Street",
      category: "Road",
      location: "Downtown, Block A",
      status: "Open",
      votes: 12,
      comments: 5,
      timeAgo: "2d ago",
      image: null
    },
    {
      id: 2,
      title: "Pothole near Main Street",
      category: "Road", 
      location: "Downtown, Block A",
      status: "In Progress",
      votes: 12,
      comments: 5,
      timeAgo: "2d ago",
      image: null
    }
  ];
  

  // Map pins data with positions and issue details
  const mapPins = [
    {
      id: 1,
      position: { top: '272px', left: '968px' },
      status: 'Open',
      title: 'Pothole near Main Road',
      category: 'Road',
      location: 'Downtown, Block A',
      description: 'Large pothole causing traffic issues...',
      votes: 24,
      comments: 8
    },
    {
      id: 2,
      position: { top: '388px', left: '673px' },
      status: 'Resolved',
      title: 'Broken Street Light Fixed',
      category: 'Lighting',
      location: 'Park Avenue, Sector 12',
      description: 'Street light has been repaired and working...',
      votes: 15,
      comments: 3
    },
    {
      id: 3,
      position: { top: '244px', left: '542px' },
      status: 'In Progress',
      title: 'Water Supply Disruption',
      category: 'Water Supply',
      location: 'Residential Area, Phase 2',
      description: 'Water supply restoration work in progress...',
      votes: 32,
      comments: 12
    },
    {
      id: 4,
      position: { top: '538px', left: '673px' },
      status: 'Open',
      title: 'Garbage Collection Issue',
      category: 'Waste',
      location: 'Market Street, Near Mall',
      description: 'Overflowing bins need immediate attention...',
      votes: 18,
      comments: 6
    },
    {
      id: 5,
      position: { top: '483px', left: '849px' },
      status: 'In Progress',
      title: 'Road Construction Delay',
      category: 'Road',
      location: 'Highway Junction, Exit 4',
      description: 'Construction causing traffic delays...',
      votes: 41,
      comments: 15
    }
  ];

  // Category data
  const categories = [
    { name: "Lighting", icon: "💡" },
    { name: "Road", icon: "🛣️" },
    { name: "Waste", icon: "🗑️" },
    { name: "Water Supply", icon: "💧" }
  ];

  // Improved hover logic for stable popovers
  const handlePinEnter = (pin) => {
    setHoveredPin(pin);
    setActivePopover(pin.id);
  };

  const handlePinLeave = () => {
    // Don't close immediately - wait for potential popover hover
    setTimeout(() => {
      if (activePopover === null) {
        setHoveredPin(null);
      }
    }, 150);
  };

  const handlePopoverEnter = (pinId) => {
    setActivePopover(pinId);
  };

  const handlePopoverLeave = () => {
    setActivePopover(null);
    setHoveredPin(null);
  };
  const getCategoryIcon = (category) => {
    const iconMap = {
      "Lighting": "💡",
      "Road": "🛣️", 
      "Waste": "🗑️",
      "Water Supply": "💧",
      "Infrastructure": "🏗️"
    };
    return iconMap[category] || "📍";
  };

  // Status badge styling for pins
  const getPinBadgeClass = (status) => {
    switch (status) {
      case "Open":
        return "bg-gradient-to-b from-yellow-400 to-yellow-500";
      case "In Progress":
        return "bg-gradient-to-b from-blue-400 to-blue-600";
      case "Resolved":
        return "bg-gradient-to-b from-green-400 to-green-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-tr from-[#43c6ac] to-[#191654] text-white font-inter">
      {/* Main Content Area */}
      <div className="flex w-full">
        {/* Sidebar */}
        <div className="w-[400px] h-screen backdrop-blur-xl bg-white/10 border-r border-white/20 flex flex-col p-6 gap-6 overflow-y-auto">
          {/* Search Field */}
          <div className="w-full">
            <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 h-12 flex items-center px-4 gap-2">
              <FaSearch className="text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Issues"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-gray-900 placeholder-gray-500 text-base leading-6 outline-none"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 p-2">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 bg-gray-100 text-slate-900 rounded-full px-2.5 py-1 cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <span className="text-base">{category.icon}</span>
                <span className="text-xs font-medium leading-4">{category.name}</span>
              </div>
            ))}
          </div>

          {/* Issues List */}
          <div className="flex flex-col gap-4 p-2.5">
            {mockIssues.map((issue) => (
              <div key={issue.id} className="w-80 bg-white rounded-xl shadow-sm p-3 flex flex-col gap-2">
                {/* Image Wrapper */}
                <div className="relative h-35 overflow-hidden rounded-t-xl">
                  <div className="w-full h-35 bg-gray-300 rounded-xl"></div>
                  <div className={`absolute top-2 left-2 ${getPinBadgeClass(issue.status)} text-white rounded-full px-3 py-1 text-xs font-medium leading-4`}>
                    {issue.status}
                  </div>
                </div>

                {/* Title Block */}
                <div className="flex flex-col gap-1">
                  <h3 className="text-slate-900 text-base leading-6 font-medium">{issue.title}</h3>
                  <div className="flex items-center gap-1.5 bg-gray-100 text-slate-900 rounded-full px-2.5 py-1 w-fit">
                    <span className="text-base">🛣️</span>
                    <span className="text-xs font-medium leading-4">{issue.category}</span>
                  </div>
                </div>

                {/* Meta Row */}
                <div className="flex items-center justify-between text-slate-500 text-xs leading-4 font-medium">
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="w-4 h-4" />
                    <span>{issue.location}</span>
                  </div>
                  <span>{issue.timeAgo}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <Link 
                    to={`/issues/${issue.id}`}
                    className="text-[#0083b0] text-xs leading-4 font-medium cursor-pointer hover:underline"
                  >
                    View
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-slate-500">
                      <FaThumbsUp className="w-4 h-4" />
                      <span className="text-xs leading-4 font-medium">{issue.votes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <FaCommentDots className="w-4 h-4" />
                      <span className="text-xs leading-4 font-medium">{issue.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative h-screen overflow-hidden">
          {/* Map Image Placeholder */}
          <div className="w-full h-full bg-gray-600"></div>

          {/* Map Popover - Shows when hovering over a pin */}
          {hoveredPin && (
            <div 
              className="absolute w-60 bg-white rounded-xl shadow-lg p-3 flex flex-col gap-2 z-50 transition-all duration-200 transform scale-100"
              style={{
                top: `calc(${hoveredPin.position.top} - 120px)`,
                left: parseInt(hoveredPin.position.left) > 800 
                  ? `calc(${hoveredPin.position.left} - 270px)` 
                  : `calc(${hoveredPin.position.left} + 30px)`,
                transform: parseInt(hoveredPin.position.top) < 120 
                  ? `translateY(140px)` 
                  : 'none'
              }}
              onMouseEnter={() => handlePopoverEnter(hoveredPin.id)}
              onMouseLeave={handlePopoverLeave}
            >
              <h4 className="text-slate-900 text-xl leading-7 font-semibold">{hoveredPin.title}</h4>
              
              <div className="flex items-center gap-2 bg-white p-2.5">
                <div className={`${getPinBadgeClass(hoveredPin.status)} text-white rounded-full px-3 py-1 text-xs font-medium leading-4`}>
                  {hoveredPin.status}
                </div>
                <div className="flex items-center gap-1.5 bg-gray-100 text-slate-900 rounded-full px-2.5 py-1">
                  <span className="text-base">{getCategoryIcon(hoveredPin.category)}</span>
                  <span className="text-xs font-medium leading-4">{hoveredPin.category}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-slate-500 text-sm">
                <FaMapMarkerAlt className="w-3 h-3" />
                <span>{hoveredPin.location}</span>
              </div>
              
              <p className="text-slate-500 text-base leading-6">{hoveredPin.description}</p>
              
              <div className="flex items-center justify-between">
                <Link
                  to={`/issues/${hoveredPin.id}`}
                  className="text-base leading-6 font-semibold bg-gradient-to-b from-[#00b4db] to-[#0083b0] bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform"
                >
                  View Details →
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-slate-500">
                    <FaThumbsUp className="w-3 h-3" />
                    <span className="text-xs">{hoveredPin.votes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <FaCommentDots className="w-3 h-3" />
                    <span className="text-xs">{hoveredPin.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Map Pins */}
          {mapPins.map((pin) => (
            <div
              key={pin.id}
              className={`absolute w-6 h-6 ${getPinBadgeClass(pin.status)} rounded-xl flex items-center justify-center p-1.5 cursor-pointer hover:scale-110 transition-all duration-200 hover:shadow-lg z-40`}
              style={{ top: pin.position.top, left: pin.position.left }}
              onMouseEnter={() => handlePinEnter(pin)}
              onMouseLeave={handlePinLeave}
            >
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          ))}

          {/* Zoom Controls */}
          <div className="absolute bottom-3 right-4 bg-white rounded-lg h-22.5 flex flex-col gap-2.5">
            <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
              <FaPlus className="text-black text-base font-medium" />
            </button>
            <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
              <FaMinus className="text-black text-base font-medium" />
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-32 left-26 bg-white/80 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center p-1.5">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span className="text-slate-900 text-xs leading-4 font-medium">Open</span>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl flex items-center justify-center p-1.5">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span className="text-slate-900 text-xs leading-4 font-medium">In Progress</span>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-gradient-to-b from-green-400 to-green-500 rounded-xl flex items-center justify-center p-1.5">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span className="text-slate-900 text-xs leading-4 font-medium">Resolved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}