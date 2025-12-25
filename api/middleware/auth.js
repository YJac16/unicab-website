// Authentication Middleware
// JWT-based authentication with role-based access control

const jwt = require('jsonwebtoken');

// JWT Secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Extract token from Authorization header
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware: Require authentication
const requireAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Token verification failed'
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      guideId: decoded.guideId
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: error.message
    });
  }
};

// Middleware: Require ADMIN role
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
      message: 'This endpoint requires ADMIN role'
    });
  }

  next();
};

// Middleware: Require DRIVER role
const requireDriver = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'DRIVER') {
    return res.status(403).json({
      success: false,
      error: 'Driver access required',
      message: 'This endpoint requires DRIVER role'
    });
  }

  next();
};

// Middleware: Require MEMBER role
const requireMember = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'MEMBER') {
    return res.status(403).json({
      success: false,
      error: 'Member access required',
      message: 'This endpoint requires MEMBER role'
    });
  }

  next();
};

// Helper: Generate JWT token
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name || null,
    role: user.role,
    guideId: user.guide_id || null
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  });
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireDriver,
  requireMember,
  generateToken,
  JWT_SECRET
};

