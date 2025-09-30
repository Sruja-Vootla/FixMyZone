import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaMapMarkerAlt, FaTimes, FaCheck } from 'react-icons/fa';
import { issuesAPI, usersAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ReportIssue() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    images: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'lighting', label: 'Lighting', icon: '💡' },
    { value: 'road', label: 'Road & Infrastructure', icon: '🛣️' },
    { value: 'waste', label: 'Waste Management', icon: '🗑️' },
    { value: 'water', label: 'Water Supply', icon: '💧' },
    { value: 'traffic', label: 'Traffic & Parking', icon: '🚦' },
    { value: 'safety', label: 'Public Safety', icon: '🛡️' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024;
    
    if (formData.images.length + files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} images`);
      return;
    }

    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError('Some files are too large. Maximum size is 10MB per image.');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    e.target.value = '';
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Please enter an issue title');
      return false;
    }
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Please provide a description');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Please enter a location');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const newIssue = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        location: formData.location.trim(),
        status: 'Open',
        upvotes: 0,
        downvotes: 0,
        reporterName: user?.name || 'Anonymous',
        reporterId: user?.id || null,
        reportedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        images: formData.images.map(img => img.preview),
        comments: []
      };

      const created = await issuesAPI.createIssue(newIssue);
      
      if (user && user.id) {
        try {
          const currentReportedIssues = user.reportedIssues || [];
          await usersAPI.updateUser(user.id, {
            reportedIssues: [...currentReportedIssues, created.id]
          });
        } catch (err) {
          console.error('Failed to update user reports:', err);
        }
      }

      setShowSuccess(true);
      setTimeout(() => navigate('/issues'), 2000);
      
    } catch (error) {
      console.error('Error creating issue:', error);
      setError('Failed to submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setError('Getting your location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
        setError('');
      },
      (err) => {
        console.error('Location error:', err);
        setError('Unable to get your location. Please enter manually.');
      }
    );
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#43c6ac] to-[#191654]">
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 max-w-md">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Issue Reported Successfully!</h2>
          <p className="text-gray-200">Your issue has been submitted and will be reviewed by the community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#43c6ac] to-[#191654] py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Report an Issue</h1>
          <p className="text-gray-200">Help improve your community by reporting local problems</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/15 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-lg">
          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-white text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">
              Issue Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief description of the issue"
              className="w-full px-4 py-3 bg-white rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db] placeholder-gray-500"
              required
            />
          </div>

          <div className="mb-6">
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
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide detailed description of the issue..."
              rows="4"
              className="w-full px-4 py-3 bg-white rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db] placeholder-gray-500 resize-vertical"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">
              Location <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location or address"
                className="flex-1 px-4 py-3 bg-white rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db] placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                className="px-4 py-3 bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                <FaMapMarkerAlt />
                <span className="hidden sm:inline">Current Location</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">
              Images (Optional)
            </label>
            <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {formData.images.length === 0 ? (
                <div>
                  <FaUpload className="text-white/60 text-3xl mx-auto mb-2" />
                  <p className="text-white/80 mb-2">Upload photos of the issue</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Choose Files
                  </button>
                  <p className="text-white/60 text-xs mt-2">Max 5 images, up to 10MB each</p>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {formData.images.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.preview}
                          alt="Upload preview"
                          className="w-20 h-20 object-cover rounded-lg border border-white/30"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {formData.images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Add More Images
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white rounded-full font-semibold shadow-lg transition-all ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}