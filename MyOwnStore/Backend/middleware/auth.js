const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Protect routes - Authentication middleware
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers (multiple ways)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      // Also check cookies if available
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database with minimal fields for performance
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not found.',
          code: 'USER_NOT_FOUND'
        });
      }

      // Add complete user info to request (excluding password)
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      next();

    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Invalid token.',
          code: 'INVALID_TOKEN'
        });
      }
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Token expired.',
          code: 'TOKEN_EXPIRED'
        });
      }

      if (jwtError.name === 'NotBeforeError') {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Token not active.',
          code: 'TOKEN_NOT_ACTIVE'
        });
      }

      // Generic JWT error
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token verification failed.',
        code: 'TOKEN_VERIFICATION_FAILED'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      code: 'AUTH_SERVER_ERROR'
    });
  }
};

// @desc    Admin authorization middleware
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      code: 'ADMIN_REQUIRED'
    });
  }

  next();
};

// @desc    User or Admin authorization middleware
const userOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!['user', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. User privileges required.',
      code: 'USER_PRIVILEGES_REQUIRED'
    });
  }

  next();
};

// @desc    Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user) {
          req.user = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            address: user.address
          };
        }
      } catch (error) {
        // Silently fail for optional auth
        console.log('Optional auth failed:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};

module.exports = {
  protect,
  adminOnly,
  userOrAdmin,
  optionalAuth
};