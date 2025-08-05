const bcrypt = require('bcrypt');
const { pool } = require('../../config/db');
const multer = require('multer');

const SALT_ROUNDS = 10;

// Multer configuration for memory storage (for LONGBLOB)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .jpg, .jpeg, and .png images are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single('profile_picture');
// Create staff
const createStaff = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { name, email, password, role, contact, availability } = req.body;
      if (!name || !email || !password || !role || !contact || availability === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      if (!/^\+?\d{10,15}$/.test(contact.replace(/[\s-]/g, ''))) {
        return res.status(400).json({ error: 'Invalid contact number' });
      }
      if (![0, 1].includes(parseInt(availability))) {
        return res.status(400).json({ error: 'Availability must be 0 or 1' });
      }

      // Check email uniqueness
      const [existingEmail] = await pool.execute('SELECT * FROM staff WHERE email = ?', [email]);
      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const profile_picture = req.file ? req.file.buffer : null;

      const [result] = await pool.execute(
        'INSERT INTO staff (name, email, password, role, contact, availability, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, role, contact, parseInt(availability), profile_picture]
      );

      const [newStaff] = await pool.execute(
        'SELECT user_id, name, email, role, contact, availability, profile_picture FROM staff WHERE user_id = ?',
        [result.insertId]
      );

      const formattedStaff = {
        ...newStaff[0],
        profile_picture: newStaff[0].profile_picture ? `data:image/jpeg;base64,${Buffer.from(newStaff[0].profile_picture).toString('base64')}` : null,
      };

      res.status(201).json({
        message: 'Staff created successfully',
        staff: formattedStaff,
      });
    } catch (error) {
      console.error('Create staff error:', error);
      res.status(500).json({ error: 'Server error during staff creation' });
    }
  });
};

// Update staff
const updateStaff = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { id } = req.params;
      const { name, email, password, role, contact, availability } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Valid user ID is required' });
      }

      const [staff] = await pool.execute('SELECT * FROM staff WHERE user_id = ?', [id]);
      if (staff.length === 0) {
        return res.status(404).json({ error: 'Staff not found' });
      }

      const updateFields = [];
      const updateValues = [];
      if (name) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      if (email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }
        const [existingEmail] = await pool.execute('SELECT * FROM staff WHERE email = ? AND user_id != ?', [email, id]);
        if (existingEmail.length > 0) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        updateFields.push('email = ?');
        updateValues.push(email);
      }
      if (password) {
        if (password.length < 8) {
          return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        updateFields.push('password = ?');
        updateValues.push(hashedPassword);
      }
      if (role) {
        updateFields.push('role = ?');
        updateValues.push(role);
      }
      if (contact) {
        if (!/^\+?\d{10,15}$/.test(contact.replace(/[\s-]/g, ''))) {
          return res.status(400).json({ error: 'Invalid contact number' });
        }
        updateFields.push('contact = ?');
        updateValues.push(contact);
      }
      if (availability !== undefined) {
        if (![0, 1].includes(parseInt(availability))) {
          return res.status(400).json({ error: 'Availability must be 0 or 1' });
        }
        updateFields.push('availability = ?');
        updateValues.push(parseInt(availability));
      }
      if (req.file) {
        updateFields.push('profile_picture = ?');
        updateValues.push(req.file.buffer);
      } else if (req.body.profile_picture === 'null') {
        updateFields.push('profile_picture = NULL');
      }
      updateValues.push(id);

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
      }

      await pool.execute(
        `UPDATE staff SET ${updateFields.join(', ')} WHERE user_id = ?`,
        updateValues
      );

      const [updatedStaff] = await pool.execute(
        'SELECT user_id, name, email, role, contact, availability, profile_picture FROM staff WHERE user_id = ?',
        [id]
      );

      const formattedStaff = {
        ...updatedStaff[0],
        profile_picture: updatedStaff[0].profile_picture ? `data:image/jpeg;base64,${Buffer.from(updatedStaff[0].profile_picture).toString('base64')}` : null,
      };

      res.status(200).json({
        message: 'Staff updated successfully',
        staff: formattedStaff,
      });
    } catch (error) {
      console.error('Update staff error:', error);
      res.status(500).json({ error: 'Server error during staff update' });
    }
  });
};

// Delete staff
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }

    const [staff] = await pool.execute('SELECT * FROM staff WHERE user_id = ?', [id]);
    if (staff.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    await pool.execute('DELETE FROM staff WHERE user_id = ?', [id]);

    res.status(200).json({
      message: 'Staff deleted successfully',
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Server error during staff deletion' });
  }
};

// Get all staff
const getStaff = async (req, res) => {
  try {
    const [staff] = await pool.execute(
      'SELECT user_id, name, email, role, contact, availability, profile_picture FROM staff'
    );
    // Convert images to base64
    const formattedStaff = staff.map((s) => ({
      ...s,
      profile_picture: s.profile_picture ? `data:image/jpeg;base64,${Buffer.from(s.profile_picture).toString('base64')}` : null,
    }));
    res.status(200).json({
      message: 'Staff retrieved successfully',
      staff: formattedStaff,
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

// Get staff attendance for today
const getStaffAttendance = async (req, res) => {
  const { staffId } = req.params;
  const currentDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
  try {
    const userId = req.user.user_id;
    if (parseInt(staffId) !== userId) {
      return res.status(403).json({ error: 'Access restricted to your own attendance' });
    }
    const [attendance] = await pool.execute(
      `SELECT present
       FROM staff_attendance
       WHERE staff_id = ? AND date = ?`,
      [staffId, currentDate]
    );
    res.status(200).json({
      message: 'Attendance retrieved successfully',
      present: attendance.length > 0 ? attendance[0].present : 0, // Default to Absent
    });
  } catch (error) {
    console.error('Get staff attendance error:', error);
    res.status(500).json({ error: 'Server error during attendance retrieval' });
  }
};

// Set staff attendance for today
const setStaffAttendance = async (req, res) => {
  const { staffId } = req.params;
  const { date, present } = req.body;
  const currentDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
  if (date !== currentDate) {
    return res.status(400).json({ error: 'Attendance can only be set for today' });
  }
  if (![0, 1].includes(present)) {
    return res.status(400).json({ error: 'Present must be 0 (Absent) or 1 (Present)' });
  }
  try {
    const userId = req.user.user_id;
    if (parseInt(staffId) !== userId) {
      return res.status(403).json({ error: 'Access restricted to your own attendance' });
    }
    const [existing] = await pool.execute(
      `SELECT attendance_id
       FROM staff_attendance
       WHERE staff_id = ? AND date = ?`,
      [staffId, date]
    );
    if (existing.length > 0) {
      await pool.execute(
        `UPDATE staff_attendance
         SET present = ?
         WHERE staff_id = ? AND date = ?`,
        [present, staffId, date]
      );
    } else {
      await pool.execute(
        `INSERT INTO staff_attendance (staff_id, date, present)
         VALUES (?, ?, ?)`,
        [staffId, date, present]
      );
    }
    res.status(200).json({ message: 'Attendance updated successfully', present });
  } catch (error) {
    console.error('Set staff attendance error:', error);
    res.status(500).json({ error: 'Server error during attendance update' });
  }
};

module.exports = {
  createStaff: [createStaff],
  getStaff: [getStaff],
  getStaffById: [getStaffById],
  updateStaff: [updateStaff],
  getStaffAttendance: [getStaffAttendance],
  setStaffAttendance: [setStaffAttendance],
  deleteStaff: [deleteStaff],
};