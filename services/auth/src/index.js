/**
 * Authentication Service Entry Point
 * Handles user authentication, token management, and authorization
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

// In-memory storage (replace with database in production)
const users = [];
const sessions = new Map(); // tokenId -> session data
const passwordResetTokens = new Map(); // email -> reset token

// Generate initial users
(async () => {
  const hashedPassword = await bcrypt.hash('admin123', 12);
  users.push({
    id: '1',
    tenantId: 'tenant-001',
    employeeId: 'EMP001',
    branchId: null,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@nbfc.com',
    phone: '9999999999',
    passwordHash: hashedPassword,
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'manage_users', 'manage_branches'],
    status: 'active',
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const branchHashedPassword = await bcrypt.hash('branch123', 12);
  users.push({
    id: '2',
    tenantId: 'tenant-001',
    employeeId: 'EMP002',
    branchId: '1',
    firstName: 'Branch',
    lastName: 'Manager',
    email: 'bm@nbfc.com',
    phone: '8888888888',
    passwordHash: branchHashedPassword,
    role: 'branch_manager',
    permissions: ['read', 'write', 'manage_customers', 'manage_loans'],
    status: 'active',
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const agentHashedPassword = await bcrypt.hash('agent123', 12);
  users.push({
    id: '3',
    tenantId: 'tenant-001',
    employeeId: 'EMP003',
    branchId: '1',
    firstName: 'Field',
    lastName: 'Agent',
    email: 'agent@nbfc.com',
    phone: '7777777777',
    passwordHash: agentHashedPassword,
    role: 'field_agent',
    permissions: ['read', 'write', 'collect_payments', 'update_customer_info'],
    status: 'active',
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
})();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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