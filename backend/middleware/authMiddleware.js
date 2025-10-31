// // middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/UserModel');

// // Middleware to authenticate JWT token
// const authenticateToken = async (req, res, next) => {
//   try {
//     // Get token from header
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

//     if (!token) {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Access denied. No token provided.' 
//       });
//     }

//     // Verify token
//     const decoded = jwt.verify(
//       token, 
//       process.env.JWT_SECRET || 'your-secret-key-change-in-production'
//     );

//     // Get user from token
//     const user = await User.findById(decoded.userId).select('-password');

//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       });
//     }

//     // Attach user to request object
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Auth middleware error:', error);
    
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Invalid token' 
//       });
//     }
    
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Token expired' 
//       });
//     }

//     res.status(500).json({ 
//       success: false, 
//       message: 'Authentication failed',
//       error: error.message 
//     });
//   }
// };

// // Optional authentication - doesn't fail if no token
// const optionalAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//       req.user = null;
//       return next();
//     }

//     const decoded = jwt.verify(
//       token, 
//       process.env.JWT_SECRET || 'your-secret-key-change-in-production'
//     );

//     const user = await User.findById(decoded.userId).select('-password');
//     req.user = user || null;
//     next();
//   } catch (error) {
//     req.user = null;
//     next();
//   }
// };

// // Middleware to check if user is admin
// const isAdmin = (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ 
//       success: false, 
//       message: 'Access denied. Not authenticated.' 
//     });
//   }

//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ 
//       success: false, 
//       message: 'Access denied. Admin only.' 
//     });
//   }

//   next();
// };

// module.exports = {
//   authenticateToken,
//   optionalAuth,
//   isAdmin
// };



// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader); // DEBUG
    
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('No token provided'); // DEBUG
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    console.log('Token:', token.substring(0, 20) + '...'); // DEBUG - show first 20 chars

    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    
    console.log('Decoded token:', decoded); // DEBUG

    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');
    
    console.log('User found:', user ? 'Yes' : 'No'); // DEBUG
    console.log('User details:', user ? { id: user._id, name: user.name, email: user.email } : 'No user'); // DEBUG

    if (!user) {
      console.log('User not found in database'); // DEBUG
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Attach user to request object
    req.user = user;
    console.log('User attached to req.user:', { id: req.user._id, name: req.user.name }); // DEBUG
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed',
      error: error.message 
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    const user = await User.findById(decoded.userId).select('-password');
    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. Not authenticated.' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin only.' 
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  isAdmin
};