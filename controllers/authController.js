const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Login Admin
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Default admin fallback for easy testing
    if (email.toLowerCase() === 'admin@universebyte.in' && password === 'admin123') {
      const token = jwt.sign(
        { id: 'admin_default', email: 'admin@universebyte.in', role: 'SuperAdmin', name: 'UniverseByte Admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({
        success: true,
        message: 'Admin authentication successful',
        token,
        admin: {
          email: 'admin@universebyte.in',
          name: 'UniverseByte Admin',
          role: 'SuperAdmin'
        }
      });
    }

    // Attempt MongoDB authentication if connection established
    try {
      const admin = await Admin.findOne({ email: email.toLowerCase() });
      if (admin && (await admin.comparePassword(password))) {
        const token = jwt.sign(
          { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          message: 'Admin authentication successful',
          token,
          admin: {
            email: admin.email,
            name: admin.name,
            role: admin.role
          }
        });
      }
    } catch (dbErr) {
      console.log('MongoDB auth check skipped/failed, using fallback check.');
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password credentials' });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login authentication' });
  }
};

// Validate token / Current user
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
};
