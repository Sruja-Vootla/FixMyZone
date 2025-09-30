import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaThumbsUp, FaThumbsDown, FaCommentDots, FaArrowLeft, FaClock, FaUser } from "react-icons/fa";
import { issuesAPI, usersAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [userVote, setUserVote] = useState(null); // 'up', 'down', or null

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const data = await issuesAPI.getIssue(id);
      setIssue(data);
      
      // Check if user has voted
      if (user && data.voters) {
        const vote = data.voters[user.id];
        setUserVote(vote);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching issue:", err);
      setError("Failed to load issue details.");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!user) {
      alert("Please login to vote");
      navigate("/login");
      return;
    }

    try {
      let newUpvotes = issue.upvotes || 0;
      let newDownvotes = issue.downvotes || 0;
      const voters = issue.voters || {};

      // Remove previous vote
      if (userVote === 'up') newUpvotes--;
      if (userVote === 'down') newDownvotes--;

      // Add new vote if different
      if (userVote === voteType) {
        // Clicking same vote = remove vote
        delete voters[user.id];
        setUserVote(null);
      } else {
        // New vote
        if (voteType === 'up') newUpvotes++;
        if (voteType === 'down') newDownvotes++;
        voters[user.id] = voteType;
        setUserVote(voteType);
      }

      const updated = await issuesAPI.updateIssue(id, {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        voters
      });

      setIssue(updated);
    } catch (err) {
      console.error("Error voting:", err);
      alert("Failed to register vote");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please login to comment");
      navigate("/login");
      return;
    }

    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      
      const newComment = {
        id: Date.now(),
        userId: user.id,
        userName: user.name,
        text: commentText.trim(),
        createdAt: new Date().toISOString()
      };

      const currentComments = Array.isArray(issue.comments) ? issue.comments : [];
      const updated = await issuesAPI.updateIssue(id, {
        comments: [...currentComments, newComment]
      });

      setIssue(updated);
      setCommentText('');
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getStatusClass = (status) => {
    const normalized = status?.toLowerCase() || 'open';
    switch (normalized) {
      case 'open':
        return 'bg-yellow-500';
      case 'in progress':
      case 'inprogress':
        return 'bg-blue-500';
      case 'resolved':
      case 'closed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      "lighting": "💡",
      "road": "🛣️",
      "waste": "🗑️",
      "water": "💧",
      "traffic": "🚦",
      "safety": "🛡️",
      "other": "📋"
    };
    return iconMap[category?.toLowerCase()] || "📍";
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#43c6ac] to-[#191654] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#43c6ac] to-[#191654] flex items-center justify-center">
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 max-w-md">
          <h2 className="text-2xl font-semibold text-white mb-4">Issue Not Found</h2>
          <p className="text-gray-200 mb-6">{error || "The issue you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate('/issues')}
            className="bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white px-6 py-3 rounded-full font-semibold"
          >
            Back to Issues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#43c6ac] to-[#191654] py-8 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white mb-6 hover:text-cyan-300 transition-colors"
        >
          <FaArrowLeft /> Back
        </button>

        {/* Main Content */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{issue.title}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`${getStatusClass(issue.status)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                    {issue.status || 'Open'}
                  </span>
                  <div className="flex items-center gap-1.5 bg-white/20 text-white rounded-full px-3 py-1">
                    <span>{getCategoryIcon(issue.category)}</span>
                    <span className="text-sm font-medium capitalize">{issue.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt />
                <span>{issue.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock />
                <span>Reported on {formatDate(issue.reportedDate || issue.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUser />
                <span>By {issue.reporterName || 'Anonymous'}</span>
              </div>
            </div>
          </div>

          {/* Images */}
          {issue.images && issue.images.length > 0 && (
            <div className="p-6 border-b border-white/20">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {issue.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Issue ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
            <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
              {issue.description}
            </p>
          </div>

          {/* Voting */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleVote('up')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  userVote === 'up'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <FaThumbsUp />
                <span className="font-semibold">{issue.upvotes || 0}</span>
              </button>
              <button
                onClick={() => handleVote('down')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  userVote === 'down'
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <FaThumbsDown />
                <span className="font-semibold">{issue.downvotes || 0}</span>
              </button>
              <div className="flex items-center gap-2 text-white/80">
                <FaCommentDots />
                <span>{Array.isArray(issue.comments) ? issue.comments.length : 0} Comments</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Comments</h2>
            
            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows="3"
                  className="w-full px-4 py-3 bg-white/20 text-white placeholder-white/60 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#00b4db] resize-vertical"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="mt-2 bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            ) : (
              <div className="bg-white/10 rounded-lg p-4 mb-6 text-white/80 text-center">
                <p>Please <button onClick={() => navigate('/login')} className="text-cyan-300 underline">login</button> to post comments</p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {Array.isArray(issue.comments) && issue.comments.length > 0 ? (
                issue.comments.map((comment) => (
                  <div key={comment.id} className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaUser className="text-white/60" />
                      <span className="text-white font-medium">{comment.userName || 'Anonymous'}</span>
                      <span className="text-white/60 text-sm">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-white/90">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-white/60 text-center py-8">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
