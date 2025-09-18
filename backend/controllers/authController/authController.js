const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { pool } = require('../../config/db');

// Environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '1234';

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Signup function (for customers only)
const signup = async (req, res) => {
  try {
    const { fullName, phone, email, birthday, password } = req.body;
    const profilePicture = req.file ? req.file.buffer : null; // get binary data

    // Input validation
    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!/^\+?\d{10,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      return res.status(400).json({ error: 'Invalid birthday format (use YYYY-MM-DD)' });
    }
    if (email === ADMIN_EMAIL || email.startsWith('staff.')) {
      return res.status(403).json({ error: 'Cannot signup as admin or staff' });
    }

    // Check duplicate email in users table
    const [existingUsers] = await pool.execute('SELECT email FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      `INSERT INTO users (name, email, phone, birthday, profile_picture, password, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fullName, email, phone, birthday || null, profilePicture, hashedPassword, 'customer']
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
};


// Sign-in function
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    let user;
    let role;
    

    // Check for admin
    if (email === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      role = 'admin';
      user = {
        user_id: 0, // Special ID for admin
        name: 'Admin',
        email: ADMIN_EMAIL,
        phone: null,
        birthday: null,
        profile_picture: null,
        role: 'admin',
      };
    } else if (email.startsWith('staff.')) {
      // Check staff table
      const [staff] = await pool.execute('SELECT * FROM staff WHERE email = ?', [email]);
      if (staff.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      user = staff[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      role = 'staff';
      // Ensure role is set
      if (user.role !== 'staff') {
        await pool.execute('UPDATE staff SET role = ? WHERE user_id = ?', ['staff', user.user_id]);
        user.role = 'staff';
      }
    } else {
      // Check users table
      const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      user = users[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      role = 'customer';
      // Ensure role is set
      if (user.role !== 'customer') {
        await pool.execute('UPDATE users SET role = ? WHERE user_id = ?', ['customer', user.user_id]);
        user.role = 'customer';
      }
    }

    // Create JWT Token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        birthday: user.birthday || null,
        profilePicture: user.profile_picture || null,
        role: role,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Server error during signin' });
  }
};

module.exports = {
  signup: upload.single('profilePicture'),
  signupHandler: signup,
  signin,
};