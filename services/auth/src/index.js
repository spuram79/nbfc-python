/**
 * Authentication Service Entry Point
 * Handles user authentication, token management, and authorization
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory user storage (replace with database in production)
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'admin123'
    role: 'admin',
    branchId: null
  },
  {
    id: 2,
    username: 'branch_manager',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'branch123'
    role: 'branch_manager',
    branchId: 1
  },
  {
    id: 3,
    username: 'field_agent',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'agent123'
    role: 'field_agent',
    branchId: 1
  }
];

// Routes
/**
 * @route POST /api/auth/login
 * @desc Authenticate user and return JWT token
 */
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role, branchId: user.branchId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        branchId: user.branchId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/auth/verify
 * @desc Verify JWT token
 */
app.post('/api/auth/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

/**
 * @route GET /api/auth/profile
 * @desc Get user profile (requires authentication)
 */
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role,
    branchId: req.user.branchId
  });
});

/**
 * @route GET /api/auth/permissions
 * @desc Get user permissions
 */
app.get('/api/auth/permissions', authenticateToken, (req, res) => {
  const permissions = getPermissions(req.user.role);
  res.json({ permissions });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});

/**
 * Authentication middleware
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

/**
 * Get role-based permissions
 */
function getPermissions(role) {
  const permissionMap = {
    admin: ['read', 'write', 'delete', 'manage_users', 'manage_branches'],
    branch_manager: ['read', 'write', 'manage_customers', 'manage_loans'],
    field_agent: ['read', 'write', 'collect_payments', 'update_customer_info'],
    customer: ['read', 'make_payments'],
    collections: ['read', 'collect_payments', 'view_delinquent_accounts']
  };
  return permissionMap[role] || [];
}

module.exports = app;