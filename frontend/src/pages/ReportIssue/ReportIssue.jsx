import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaUpload, FaMapMarkerAlt, FaTimes, FaCheck, FaSearch } from 'react-icons/fa';
import { issuesAPI, usersAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to update map view
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

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
  
  const [mapPosition, setMapPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]); // Mumbai
  const [mapZoom, setMapZoom] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'lighting', label: 'Lighting'},
    { value: 'road', label: 'Road & Infrastructure'},
    { value: 'waste', label: 'Waste Management' },
    { value: 'water', label: 'Water Supply'},
    { value: 'traffic', label: 'Traffic & Parking' },
    { value: 'safety', label: 'Public Safety' },
    { value: 'other', label: 'Other'}
  ];

  // Search for location using Nominatim (OpenStreetMap)
  const searchLocation = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search location');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchLocation(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLocationSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setMapPosition({ lat, lng });
    setMapCenter([lat, lng]);
    setMapZoom(16);
    setFormData(prev => ({ ...prev, location: result.display_name }));
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
  };

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
    if (!mapPosition) {
      setError('Please search and select a location');
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
        coordinates: mapPosition,
        status: 'Open',
        upvotes: 0,
        downvotes: 0,
        reporterName: user?.name || 'Anonymous',
        reporterId: user?.id || null,
        reportedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        images: formData.images.map(img => img.preview),
        comments: [],
        voters: {}
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
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapPosition({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setMapZoom(16);
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setFormData(prev => ({ ...prev, location: data.display_name }));
        } catch (err) {
          setFormData(prev => ({ 
            ...prev, 
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
          }));
        }
        
        setError('');
      },
      (err) => {
        console.error('Location error:', err);
        setError('Unable to get your location.');
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

        
          {/* Form Section */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-lg">
            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-white text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
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
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
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

              {/* Location Search */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Search Location <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for street, area, landmark..."
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db] placeholder-gray-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="px-4 py-3 bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white rounded-lg hover:scale-105 transition-transform flex items-center gap-2 whitespace-nowrap"
                    >
                      <FaMapMarkerAlt />
                      <span className="hidden sm:inline">GPS</span>
                    </button>
                  </div>

                  {/* Search Results Dropdown */}
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          onClick={() => handleLocationSelect(result)}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start gap-2">
                            <FaMapMarkerAlt className="text-blue-500 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{result.display_name}</p>
                              <p className="text-xs text-gray-500">{result.type}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isSearching && (
                    <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Searching...</p>
                    </div>
                  )}
                </div>

                {formData.location && (
                  <div className="mt-2 p-3 bg-white/20 rounded-lg">
                    <p className="text-white text-sm">
                      <strong>Selected:</strong> {formData.location}
                    </p>
                    {mapPosition && (
                      <p className="text-white/70 text-xs mt-1">
                        {mapPosition.lat.toFixed(6)}, {mapPosition.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Map Preview */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg flex flex-col">
            <h3 className="text-white text-lg font-semibold mb-3">Location Preview</h3>
            <div className="h-[500px] rounded-lg overflow-hidden border-2 border-white/30">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
              >
                <ChangeView center={mapCenter} zoom={mapZoom} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapPosition && <Marker position={[mapPosition.lat, mapPosition.lng]} />}
              </MapContainer>
            </div>
            <p className="text-white/70 text-sm mt-3">
              Search for a location above to preview it on the map
            </p>
          </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Images (Optional)
                </label>
                <div className="border-2 border-dashed border-white/30 rounded-lg p-4 text-center">
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
                      <FaUpload className="text-white/60 text-2xl mx-auto mb-2" />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        Choose Files
                      </button>
                      <p className="text-white/60 text-xs mt-2">Max 5 images</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.images.map((image) => (
                          <div key={image.id} className="relative">
                            <img
                              src={image.preview}
                              alt="Upload preview"
                              className="w-16 h-16 object-cover rounded-lg border border-white/30"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                      {formData.images.length < 5 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          Add More
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-2">
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
    </div>
  );
}