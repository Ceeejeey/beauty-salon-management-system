const bcrypt = require('bcrypt');
const { pool } = require('../../config/db');

// Create staff
const createStaff = async (req, res) => {
  try {
    const { name, email, role, password, contact, image } = req.body;

    // Input validation
    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: 'Name, email, role, and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (role !== 'staff') {
      return res.status(400).json({ error: 'Role must be "staff"' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate image (Base64, JPEG/PNG)
    let profilePicture = null;
    if (image) {
      if (!image.startsWith('data:image/jpeg;base64,') && !image.startsWith('data:image/png;base64,')) {
        return res.status(400).json({ error: 'Image must be a valid JPEG or PNG Base64 string' });
      }
      const base64Data = image.replace(/^data:image\/(jpeg|png);base64,/, '');
      profilePicture = Buffer.from(base64Data, 'base64');
    }

    // Check if email already exists
    const [existingStaff] = await pool.execute('SELECT * FROM staff WHERE email = ?', [email]);
    if (existingStaff.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert staff into database
    const [result] = await pool.execute(
      `INSERT INTO staff (name, email, password, role, contact, availability, profile_picture)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, contact || null, '1', profilePicture]
    );

    // Fetch created staff for response (exclude password and profile_picture)
    const [newStaff] = await pool.execute(
      `SELECT user_id, name, email, role, contact, availability
       FROM staff WHERE user_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Staff created successfully',
      staff: {
        user_id: newStaff[0].user_id,
        name: newStaff[0].name,
        email: newStaff[0].email,
        role: newStaff[0].role,
        contact: newStaff[0].contact,
        availability: newStaff[0].availability,
      },
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ error: 'Server error during staff creation' });
  }
};

module.exports = {
  createStaff: [createStaff],
};