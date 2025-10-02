import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import { issuesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminEditIssue() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    status: 'open',
    reporterName: ''
  });

  const [originalData, setOriginalData] = useState({
    location: '',
    reporterName: ''
  });

  const categories = [
    { value: 'lighting', label: 'Lighting' },
    { value: 'road', label: 'Road & Infrastructure' },
    { value: 'waste', label: 'Waste Management' },
    { value: 'water', label: 'Water Supply' },
    { value: 'traffic', label: 'Traffic & Parking' },
    { value: 'safety', label: 'Public Safety' },
    { value: 'other', label: 'Other' }
  ];

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if user has admin role
    if (user.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      navigate('/issues');
      return;
    }
    
    fetchIssue();
  }, [id, user]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const data = await issuesAPI.getIssue(id);
      
      setFormData({
        title: data.title || '',
        category: data.category || '',
        description: data.description || '',
        location: data.location || '',
        status: data.status || 'open',
        reporterName: data.reporterName || ''
      });
      
      // Store original values that shouldn't be changed
      setOriginalData({
        location: data.location || '',
        reporterName: data.reporterName || ''
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching issue:', err);
      setError('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    if (!formData.category) {
      alert('Category is required');
      return;
    }
    if (!formData.description.trim()) {
      alert('Description is required');
      return;
    }
    if (!formData.location.trim()) {
      alert('Location is required');
      return;
    }

    try {
      setSaving(true);
      
      await issuesAPI.updateIssue(id, {
        ...formData,
        updatedAt: new Date().toISOString(),
        updatedBy: user.name
      });
      
      setSuccessMessage('Issue updated successfully!');
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating issue:', err);
      alert('Failed to update issue. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    // Delete functionality removed - admin cannot delete issues
    alert('Delete functionality is not available. Contact system administrator if issue needs to be removed.');
  };

  const handleCancel = () => {
    if (window.confirm('Discard changes?')) {
      navigate('/admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#43c6ac] to-[#191654] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading issue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#43c6ac] to-[#191654] flex items-center justify-center">
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 max-w-md">
          <h2 className="text-2xl font-semibold text-white mb-4">Error</h2>
          <p className="text-gray-200 mb-6">{error}</p>
          <button
            onClick={() => navigate('/admin')}
            className="bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white px-6 py-3 rounded-full font-semibold"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-white hover:text-cyan-300 transition-colors"
          >
            <FaArrowLeft /> Back to Admin
          </button>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              ADMIN MODE
            </span>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500 rounded-xl p-4 mb-6 text-white text-center">
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white/15 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Issue</h1>
          <p className="text-gray-200 mb-6">Make changes to the issue details below</p>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">
              Issue Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
              required
            />
          </div>

          {/* Category and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Category */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Status <span className="text-red-400">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
                required
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Location - Read Only */}
          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              className="w-full px-4 py-3 bg-gray-200 rounded-lg text-gray-600 border border-gray-300 cursor-not-allowed"
              disabled
              readOnly
            />
            <p className="text-xs text-gray-300 mt-1">Location cannot be modified</p>
          </div>

          {/* Reporter Name - Read Only */}
          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">
              Reporter Name
            </label>
            <input
              type="text"
              name="reporterName"
              value={formData.reporterName}
              className="w-full px-4 py-3 bg-gray-200 rounded-lg text-gray-600 border border-gray-300 cursor-not-allowed"
              disabled
              readOnly
            />
            <p className="text-xs text-gray-300 mt-1">Reporter information cannot be modified</p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="6"
              className="w-full px-4 py-3 bg-white rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db] resize-vertical"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/20">

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-semibold transition-colors"
              >
                <FaTimes /> Cancel
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white rounded-full font-semibold shadow-lg transition-all ${
                  saving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
              >
                <FaSave /> {saving ? 'Updating...' : 'Update Issue'}
              </button>
            </div>
          </div>
        </form>

        
      </div>
    </div>
  );
}