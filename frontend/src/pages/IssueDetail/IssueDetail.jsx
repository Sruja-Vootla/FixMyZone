import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown, FaMapMarkerAlt, FaUser, FaComment, FaClock } from 'react-icons/fa';

export default function IssueDetail() {
  const { id } = useParams();
  const [newComment, setNewComment] = useState('');
  const [userVote, setUserVote] = useState(null); // 'up', 'down', or null
  const [issue, setIssue] = useState(null);

  // Mock issue data - replace with API call later
  useEffect(() => {
    // Simulate API call based on ID
    const mockIssue = {
      id: id,
      title: "Broken Streetlight at Main Road",
      status: "Open",
      category: "Lighting",
      location: "Main Road, Ward 5", 
      reportedDate: "Aug 12, 2025",
      reporter: "Ananya",
      description: "Streetlight near the bus stop has been out for two weeks. Area is very dark at night and unsafe for pedestrians.",
      upvotes: 124,
      downvotes: 6,
      images: [
        "/api/placeholder/960/540", // Main image
        "/api/placeholder/120/80",  // Thumbnail 1
        "/api/placeholder/120/80",  // Thumbnail 2
        "/api/placeholder/120/80",  // Thumbnail 3
        "/api/placeholder/120/80",  // Thumbnail 4
        "/api/placeholder/120/80"   // Thumbnail 5
      ],
      mapImage: "/api/placeholder/360/220",
      comments: [
        {
          id: 1,
          userName: "John Doe",
          timeAgo: "2h ago",
          text: "I've also noticed this issue. It's really dangerous for evening walkers.",
          upvotes: 5,
          isReply: false
        },
        {
          id: 2,
          userName: "Sarah Wilson", 
          timeAgo: "1h ago",
          text: "Completely agree! Someone should contact the municipal office.",
          upvotes: 3,
          isReply: true
        },
        {
          id: 3,
          userName: "Mike Johnson",
          timeAgo: "45m ago", 
          text: "I'll try to escalate this to the ward councillor tomorrow.",
          upvotes: 8,
          isReply: false
        }
      ]
    };
    setIssue(mockIssue);
  }, [id]);

  // Status badge styling
  const getStatusBadgeClass = (status) => {
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

  const handleVote = (type) => {
    if (userVote === type) {
      setUserVote(null); // Remove vote if same type clicked
    } else {
      setUserVote(type); // Set new vote
    }
    // TODO: Send vote to API
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      // TODO: Send comment to API
      console.log('New comment:', newComment);
      setNewComment('');
    }
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

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-tr from-[#43c6ac] to-[#191654] text-white font-inter flex flex-col items-center gap-10 py-8">
      
      {/* Issue Header */}
      <div className="w-full max-w-6xl backdrop-blur-md bg-white/10 rounded-xl shadow-lg border border-white/15 p-6 flex flex-col gap-3">
        {/* Header Row */}
        <div className="flex items-center justify-between relative">
          <h1 className="text-3xl font-semibold leading-9 flex-1">
            {issue.title}
          </h1>
          <div className={`${getStatusBadgeClass(issue.status)} text-white rounded-full px-3 py-1 text-xs font-medium`}>
            {issue.status}
          </div>
        </div>

        {/* Meta Row */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-gray-100 text-slate-900 rounded-full px-2.5 py-1">
            <span className="text-base">{getCategoryIcon(issue.category)}</span>
            <span className="font-medium">{issue.category}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 text-slate-900 rounded-full px-2.5 py-1">
            <FaMapMarkerAlt className="w-4 h-4" />
            <span className="font-medium">{issue.location}</span>
          </div>
          <span className="text-slate-400 font-medium">Reported on {issue.reportedDate}</span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="w-full max-w-6xl flex flex-col items-center gap-3">
        {/* Main Image */}
        <img 
          src={issue.images[0]} 
          alt="Issue main image"
          className="w-full max-w-4xl h-[540px] rounded-xl object-cover bg-gray-300"
        />
        
        {/* Thumbnails */}
        <div className="flex items-center justify-center gap-3">
          {issue.images.slice(1).map((image, index) => (
            <div key={index} className="w-30 h-20 rounded-lg bg-gray-300 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-full h-full bg-gray-400"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Section */}
      <div className="w-full max-w-4xl backdrop-blur-md bg-white/15 rounded-xl shadow-lg border border-white/15 p-6 flex flex-col gap-4">
        {/* Description */}
        <p className="text-base leading-6">{issue.description}</p>

        {/* Info Row */}
        <div className="flex items-start gap-6 py-2.5">
          {/* Location Block */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <h3 className="text-xl font-semibold leading-7 text-slate-900">Location</h3>
            <img 
              src={issue.mapImage} 
              alt="Location map"
              className="w-90 h-55 rounded-xl object-cover bg-gray-300"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-full bg-gray-300"></div>

          {/* Meta Block */}
          <div className="flex-1 flex flex-col gap-2">
            <h3 className="text-xl font-semibold leading-7 text-slate-900">Details</h3>
            
            <div className="rounded-lg overflow-hidden flex items-center justify-center p-2 gap-4">
              <span className="w-30 text-base leading-6 text-white">Category</span>
              <span className="w-27 text-base leading-6 text-white">{issue.category}</span>
            </div>
            
            <div className="rounded-lg overflow-hidden flex items-center justify-center p-2 gap-4">
              <span className="w-30 text-base leading-6 text-white">Reported on</span>
              <span className="w-27 text-base leading-6 text-white">{issue.reportedDate}</span>
            </div>
            
            <div className="rounded-lg overflow-hidden flex items-center justify-center p-2 gap-4">
              <span className="w-30 text-base leading-6 text-white">Reporter</span>
              <span className="w-27 text-base leading-6 text-white">{issue.reporter}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="w-full flex items-center justify-center gap-6 py-4">
        {/* Upvote */}
        <button
          onClick={() => handleVote('up')}
          className={`w-22.5 rounded-full border border-white/15 overflow-hidden flex items-center justify-center p-2 gap-2 transition-all ${
            userVote === 'up' 
              ? 'bg-green-500/20 border-green-400' 
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <FaThumbsUp className={`w-6 h-6 ${userVote === 'up' ? 'text-green-400' : 'text-white'}`} />
          <span className={`text-base font-semibold ${userVote === 'up' ? 'text-green-400' : 'text-slate-900'}`}>
            {issue.upvotes + (userVote === 'up' ? 1 : 0)}
          </span>
        </button>

        {/* Downvote */}
        <button
          onClick={() => handleVote('down')}
          className={`w-22.5 rounded-full border border-white/15 overflow-hidden flex items-center justify-center p-2 gap-2 transition-all ${
            userVote === 'down' 
              ? 'bg-red-500/20 border-red-400' 
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <FaThumbsDown className={`w-6 h-6 ${userVote === 'down' ? 'text-red-400' : 'text-white'}`} />
          <span className={`text-base font-semibold ${userVote === 'down' ? 'text-red-400' : 'text-slate-900'}`}>
            {issue.downvotes + (userVote === 'down' ? 1 : 0)}
          </span>
        </button>

        {/* Secondary Button */}
        <div className="rounded-full bg-gradient-to-b from-[#00b4db] to-[#0083b0] p-0.5 shadow-lg">
          <div className="bg-white rounded-full px-5 py-3">
            <span className="text-slate-900 text-base font-semibold">Share Issue</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4">
        <h3 className="text-xl font-semibold leading-7 text-slate-900">Discussion</h3>

        {/* Comment Items */}
        {issue.comments.map((comment) => (
          <div 
            key={comment.id} 
            className={`bg-white rounded-lg flex items-start gap-3 p-3 ${
              comment.isReply ? 'ml-12' : ''
            }`}
          >
            <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
              <FaUser className="text-gray-600 w-4 h-4" />
            </div>
            
            <div className="flex-1 flex flex-col gap-2.5 py-2.5">
              {/* Meta Row */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-base font-semibold leading-6 text-black">{comment.userName}</span>
                <span className="text-xs font-medium leading-4 text-slate-500">{comment.timeAgo}</span>
              </div>

              {/* Comment Text */}
              <div className="flex flex-col items-start justify-center px-1.5">
                <p className="text-base leading-6 text-black">{comment.text}</p>
              </div>

              {/* Actions */}
              <div className="overflow-hidden flex items-start p-2.5 gap-4 text-xs text-slate-500">
                <button className="hover:text-slate-700 transition-colors">Reply</button>
                <button className="hover:text-slate-700 transition-colors">
                  Upvote ({comment.upvotes})
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* New Comment */}
        <div className="flex items-end gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-medium leading-4 text-slate-500">
              Write a comment...
            </label>
            <div className="rounded-xl bg-white border border-gray-300 shadow-lg h-12 flex items-center px-4">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Your comment here..."
                className="flex-1 text-base text-slate-900 placeholder-slate-400 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
              />
            </div>
          </div>
          
          <button
            onClick={handleCommentSubmit}
            className="rounded-full bg-gradient-to-b from-[#00b4db] to-[#0083b0] overflow-hidden flex items-center justify-center px-5 py-3 shadow-lg hover:scale-105 transition-transform"
          >
            <span className="text-base font-semibold leading-5 text-white">Post</span>
          </button>
        </div>
      </div>
    </div>
  );
}