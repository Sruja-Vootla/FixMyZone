// backend/routes/uploadRoutes.js - WITH DETAILED LOGGING
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

// Import after checking if file exists
let upload, cloudinary;
try {
  const cloudinaryConfig = require('../config/cloudinary');
  upload = cloudinaryConfig.upload;
  cloudinary = cloudinaryConfig.cloudinary;
  console.log('✅ Cloudinary config loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Cloudinary config:', error.message);
}

// Test route - no auth required
router.get('/test', (req, res) => {
  console.log('Upload test route hit');
  res.json({
    success: true,
    message: 'Upload routes are working',
    cloudinaryConfigured: !!upload && !!cloudinary
  });
});

// @route   POST /api/upload/images
// @desc    Upload multiple images to Cloudinary
// @access  Private
router.post('/images', (req, res, next) => {
  console.log('\n📸 === IMAGE UPLOAD REQUEST ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Auth header present:', !!req.headers.authorization);
  
  // First authenticate
  authenticateToken(req, res, (err) => {
    if (err) {
      console.error('❌ Authentication failed:', err);
      return next(err);
    }
    
    console.log('✅ User authenticated:', req.user?.email);
    
    // Then handle upload
    if (!upload) {
      console.error('❌ Upload middleware not configured');
      return res.status(500).json({
        success: false,
        message: 'Image upload not configured. Check Cloudinary settings.'
      });
    }
    
    console.log('📤 Processing file upload...');
    
    upload.array('images', 5)(req, res, async (err) => {
      if (err) {
        console.error('❌ Multer error:', err);
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      }
      
      console.log('Files received:', req.files ? req.files.length : 0);
      
      if (!req.files || req.files.length === 0) {
        console.log('❌ No files in request');
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }
      
      try {
        const imageUrls = req.files.map(file => {
          console.log('  - File uploaded:', file.originalname, '→', file.path);
          return file.path;
        });
        
        console.log('✅ Upload successful! URLs:', imageUrls);
        
        res.status(200).json({
          success: true,
          message: 'Images uploaded successfully',
          data: {
            images: imageUrls,
            count: imageUrls.length
          }
        });
      } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({
          success: false,
          message: 'Error processing upload',
          error: error.message
        });
      }
    });
  });
});

// @route   DELETE /api/upload/images
// @desc    Delete image from Cloudinary
// @access  Private
router.delete('/images', authenticateToken, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }
    
    if (!cloudinary) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary not configured'
      });
    }
    
    // Extract public_id from URL
    const urlParts = imageUrl.split('/');
    const fileWithExtension = urlParts[urlParts.length - 1];
    const filename = fileWithExtension.split('.')[0];
    const folder = urlParts[urlParts.length - 2];
    const publicId = `${folder}/${filename}`;
    
    console.log('Deleting image:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
});

module.exports = router;