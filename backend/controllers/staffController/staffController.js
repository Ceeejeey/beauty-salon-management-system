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


// Get all staff
const getStaff = async (req, res) => {
  try {
    const [staff] = await pool.execute(
      `SELECT user_id, name, email, role, contact, availability FROM staff`
    );
    res.status(200).json({
      message: 'Staff retrieved successfully',
      staff,
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Server error during staff retrieval' });
  }
};

// Get staff by ID
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid staff ID is required' });
    }

    const [staff] = await pool.execute(
      `SELECT user_id, name, email, role, contact, availability FROM staff WHERE user_id = ?`,
      [id]
    );
    if (staff.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.status(200).json({
      message: 'Staff retrieved successfully',
      staff: staff[0],
    });
  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({ error: 'Server error during staff retrieval' });
  }
};

// Update staff
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, contact, availability, image } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid staff ID is required' });
    }
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password && password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if staff exists
    const [existingStaff] = await pool.execute('SELECT * FROM staff WHERE user_id = ?', [id]);
    if (existingStaff.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Check if email is unique (excluding current staff)
    const [emailCheck] = await pool.execute('SELECT * FROM staff WHERE email = ? AND user_id != ?', [email, id]);
    if (emailCheck.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Validate image (Base64, JPEG/PNG)
    let profilePicture = existingStaff[0].profile_picture;
    if (image) {
      if (!image.startsWith('data:image/jpeg;base64,') && !image.startsWith('data:image/png;base64,')) {
        return res.status(400).json({ error: 'Image must be a valid JPEG or PNG Base64 string' });
      }
      const base64Data = image.replace(/^data:image\/(jpeg|png);base64,/, '');
      profilePicture = Buffer.from(base64Data, 'base64');
    }

    // Hash password if provided
    let hashedPassword = existingStaff[0].password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update staff
    await pool.execute(
      `UPDATE staff SET name = ?, email = ?, password = ?, contact = ?, availability = ?, profile_picture = ? WHERE user_id = ?`,
      [name, email, hashedPassword, contact || null, availability || '1', profilePicture, id]
    );

    // Fetch updated staff
    const [updatedStaff] = await pool.execute(
      `SELECT user_id, name, email, role, contact, availability FROM staff WHERE user_id = ?`,
      [id]
    );

    res.status(200).json({
      message: 'Staff updated successfully',
      staff: updatedStaff[0],
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ error: 'Server error during staff update' });
  }
};

// Delete staff
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid staff ID is required' });
    }

    // Check if staff exists
    const [staff] = await pool.execute('SELECT * FROM staff WHERE user_id = ?', [id]);
    if (staff.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Delete staff (appointments.staff_id will be set to NULL via foreign key)
    await pool.execute('DELETE FROM staff WHERE user_id = ?', [id]);

    res.status(200).json({
      message: 'Staff deleted successfully',
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Server error during staff deletion' });
  }
};

module.exports = {
  createStaff: [createStaff],
  getStaff: [getStaff],
  getStaffById: [getStaffById],
  updateStaff: [updateStaff],
  deleteStaff: [deleteStaff],
};