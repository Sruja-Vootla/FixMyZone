
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaThumbsUp, FaThumbsDown, FaCommentDots, FaArrowLeft, FaClock, FaUser } from "react-icons/fa";
import { issuesAPI } from "../../services/api";
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
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchIssue();
    } else {
      setError('Invalid issue ID');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Check if current user has upvoted or downvoted
    if (user && issue) {
      const upvotedBy = issue.upvotedBy || [];
      const downvotedBy = issue.downvotedBy || [];
      const userId = user._id || user.id;
      setHasUpvoted(upvotedBy.includes(userId));
      setHasDownvoted(downvotedBy.includes(userId));
    }
  }, [user, issue]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      console.log('Fetching issue with ID:', id);
      const data = await issuesAPI.getIssue(id);
      console.log('Issue fetched:', data);
      setIssue(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching issue:", err);
      setError("Failed to load issue details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      alert("Please login to vote");
      navigate("/login");
      return;
    }

    try {
      console.log('Toggling upvote for issue:', id);
      const result = await issuesAPI.toggleUpvote(id);
      console.log('Upvote result:', result);
      
      const userId = user._id || user.id;
      
      // Update local state - if upvoting, remove downvote
      setIssue(prev => ({
        ...prev,
        upvotes: result.upvotes,
        upvotedBy: result.action === 'upvoted' 
          ? [...(prev.upvotedBy || []), userId]
          : (prev.upvotedBy || []).filter(uid => uid !== userId),
        // Remove from downvotes if upvoting
        downvotes: result.action === 'upvoted' && hasDownvoted 
          ? Math.max(0, (prev.downvotes || 0) - 1)
          : prev.downvotes,
        downvotedBy: result.action === 'upvoted'
          ? (prev.downvotedBy || []).filter(uid => uid !== userId)
          : prev.downvotedBy
      }));
      
      setHasUpvoted(result.action === 'upvoted');
      if (result.action === 'upvoted') {
        setHasDownvoted(false);
      }
    } catch (err) {
      console.error("Error voting:", err);
      alert(err.message || "Failed to register vote");
    }
  };

  const handleDownvote = async () => {
    if (!user) {
      alert("Please login to vote");
      navigate("/login");
      return;
    }

    try {
      console.log('Toggling downvote for issue:', id);
      const result = await issuesAPI.toggleDownvote(id);
      console.log('Downvote result:', result);
      
      const userId = user._id || user.id;
      
      // Update local state - if downvoting, remove upvote
      setIssue(prev => ({
        ...prev,
        downvotes: result.downvotes,
        downvotedBy: result.action === 'downvoted' 
          ? [...(prev.downvotedBy || []), userId]
          : (prev.downvotedBy || []).filter(uid => uid !== userId),
        // Remove from upvotes if downvoting
        upvotes: result.action === 'downvoted' && hasUpvoted 
          ? Math.max(0, (prev.upvotes || 0) - 1)
          : prev.upvotes,
        upvotedBy: result.action === 'downvoted'
          ? (prev.upvotedBy || []).filter(uid => uid !== userId)
          : prev.upvotedBy
      }));
      
      setHasDownvoted(result.action === 'downvoted');
      if (result.action === 'downvoted') {
        setHasUpvoted(false);
      }
    } catch (err) {
      console.error("Error voting:", err);
      alert(err.message || "Failed to register vote");
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
      console.log('Adding comment to issue:', id);
      
      const newComment = await issuesAPI.addComment(id, commentText.trim());
      console.log('Comment added:', newComment);
      
      // Update local state
      setIssue(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
      
      setCommentText('');
    } catch (err) {
      console.error("Error posting comment:", err);
      alert(err.message || "Failed to post comment");
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  // Loading state
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

  // Error state
  if (error || !issue) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#43c6ac] to-[#191654] flex items-center justify-center">
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 max-w-md">
          <h2 className="text-2xl font-semibold text-white mb-4">Issue Not Found</h2>
          <p className="text-gray-200 mb-6">{error || "The issue you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate('/issues')}
            className="bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
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
                  <span className={`${getStatusClass(issue.status)} text-white px-3 py-1 rounded-full text-sm font-medium capitalize`}>
                    {issue.status || 'Open'}
                  </span>
                  <div className="flex items-center gap-1.5 bg-white/20 text-white rounded-full px-3 py-1">
                    <span className="text-sm font-medium capitalize">{issue.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt />
                <span className="truncate max-w-md">{issue.location}</span>
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

          {/* Images - Only show valid HTTP/HTTPS images */}
          {issue.images && issue.images.length > 0 && (
            <div className="p-6 border-b border-white/20">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {issue.images
                  .filter(img => img && img.startsWith('http'))
                  .map((img, idx) => (
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

          {/* Voting - Upvote and Downvote */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-6">
              <button
                onClick={handleUpvote}
                disabled={!user}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  hasUpvoted
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!user ? 'Login to vote' : hasUpvoted ? 'Remove upvote' : 'Upvote this issue'}
              >
                <FaThumbsUp />
                <span className="font-semibold">{issue.upvotes || 0}</span>
              </button>
              
              <button
                onClick={handleDownvote}
                disabled={!user}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  hasDownvoted
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!user ? 'Login to vote' : hasDownvoted ? 'Remove downvote' : 'Downvote this issue'}
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
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white/60 text-sm">{commentText.length}/500</span>
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
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
                  <div key={comment._id || comment.id} className="bg-white/10 rounded-lg p-4">
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