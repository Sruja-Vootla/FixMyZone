import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaMapMarkerAlt, FaTimes, FaCheck } from 'react-icons/fa';
import { issuesAPI } from "../../services/api";

export default function ReportIssue() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    images: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Categories with icons
  const categories = [
    { value: 'lighting', label: 'Lighting', icon: '💡' },
    { value: 'road', label: 'Road & Infrastructure', icon: '🛣️' },
    { value: 'waste', label: 'Waste Management', icon: '🗑️' },
    { value: 'water', label: 'Water Supply', icon: '💧' },
    { value: 'traffic', label: 'Traffic & Parking', icon: '🚦' },
    { value: 'safety', label: 'Public Safety', icon: '🛡️' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    
    if (formData.images.length + files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images`);
      return;
    }

    // Create preview URLs for selected files
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));

    // Reset file input
    e.target.value = '';
  };

  // Remove uploaded image
  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    const newIssue = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      location: formData.location,
      status: 'open',
      upvotes: 0,
      downvotes: 0,
      reporterName: 'Current User', // Replace with actual user
      reportedDate: new Date().toISOString().split('T')[0],
      images: []
    };
    
    await issuesAPI.createIssue(newIssue);
    setShowSuccess(true);
    
  } catch (error) {
    console.error('Error creating issue:', error);
    alert('Error submitting issue');
  } finally {
    setIsSubmitting(false);
  }
};

  // Get location (simplified - in real app would use geolocation API)
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // TODO: Use reverse geocoding to get address
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Report an Issue</h1>
          <p className="text-gray-200">Help improve your community by reporting local problems</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/15 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-lg">
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
              placeholder="Brief description of the issue"
              className="w-full px-4 py-3 bg-white rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db] placeholder-gray-500"
              required
            />
          </div>

          {/* Category */}
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

          {/* Description */}
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

          {/* Location */}
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

          {/* Image Upload */}
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

          {/* Submit Button */}
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
                isSubmitting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105'
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