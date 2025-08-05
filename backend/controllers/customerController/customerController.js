const { pool } = require('../../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profile_pictures';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `user-${req.user.user_id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG or PNG images are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single('profile_picture');



const getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [users] = await pool.execute(
      `SELECT user_id, name, email, phone, DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday, profile_picture, role
       FROM users
       WHERE user_id = ?`,
      [userId]
    );
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      message: 'Profile retrieved successfully',
      user: users[0],
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error during profile retrieval' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    const userId = req.user.user_id;
    const { name, email, phone, birthday } = req.body;

    // Validation
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!/^\+?\d{10,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      return res.status(400).json({ error: 'Invalid birthday format (YYYY-MM-DD)' });
    }

    try {
      // Check email uniqueness
      const [existingEmail] = await pool.execute(
        `SELECT user_id FROM users WHERE email = ? AND user_id != ?`,
        [email, userId]
      );
      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      // Handle profile picture
      let profilePicturePath = null;
      if (req.file) {
        profilePicturePath = `/uploads/profile_pictures/${req.file.filename}`;
        // Delete old profile picture if exists
        const [user] = await pool.execute(
          `SELECT profile_picture FROM users WHERE user_id = ?`,
          [userId]
        );
        if (user[0].profile_picture && fs.existsSync(user[0].profile_picture)) {
          fs.unlinkSync(user[0].profile_picture);
        }
      }

      // Update user
      const updateFields = [
        name,
        email,
        phone,
        birthday || null,
        profilePicturePath || null,
        userId,
      ];
      await pool.execute(
        `UPDATE users
         SET name = ?, email = ?, phone = ?, birthday = ?, profile_picture = COALESCE(?, profile_picture)
         WHERE user_id = ?`,
        updateFields
      );

      const [updatedUser] = await pool.execute(
        `SELECT user_id, name, email, phone, DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday, profile_picture, role
         FROM users
         WHERE user_id = ?`,
        [userId]
      );

      res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser[0],
      });
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already in use' });
      }
      res.status(500).json({ error: 'Server error during profile update' });
    }
  });
};


// Update user password
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.user_id;

  // Validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New password and confirm password do not match' });
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(newPassword)) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long and include uppercase, lowercase, number, and special character' });
  }

  try {
    // Fetch current user
    const [users] = await pool.execute(
      `SELECT password FROM users WHERE user_id = ?`,
      [userId]
    );
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.execute(
      `UPDATE users SET password = ? WHERE user_id = ?`,
      [hashedPassword, userId]
    );

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Server error during password update' });
  }
};
module.exports = {
  getProfile: [getProfile],
  updateProfile: [updateProfile],
updatePassword: [updatePassword],
};