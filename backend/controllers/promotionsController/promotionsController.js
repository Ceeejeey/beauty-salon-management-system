const { pool } = require('../../config/db');
const multer = require('multer');



// Validate date format (YYYY-MM-DD)
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};
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
}).single('image');

// Get all active promotions (public)
const getActivePromotions = async (req, res) => {
  try {
    const [promotions] = await pool.execute(
      `SELECT p.promo_id, p.service_id, s.name AS service_name, p.title, p.code, p.description, 
              p.discount_type, p.value, p.start_date, p.end_date, p.usage_limit, p.image
       FROM promotions p
       JOIN services s ON p.service_id = s.service_id
       WHERE p.start_date <= CURDATE() AND p.end_date >= CURDATE() AND p.usage_limit > 0`
    );
    // Convert images to base64
    const formattedPromotions = promotions.map((promo) => ({
      ...promo,
      image: promo.image ? `data:image/jpeg;base64,${Buffer.from(promo.image).toString('base64')}` : null,
    }));
    res.status(200).json({
      message: 'Active promotions retrieved successfully',
      promotions: formattedPromotions,
    });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ error: 'Server error during promotions retrieval' });
  }
};
// Create promotion
const createPromotion = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { service_id, title, code, description, discount_type, value, start_date, end_date, usage_limit } = req.body;
      if (!service_id || !title || !code || !discount_type || !value || !start_date || !end_date || !usage_limit) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      if (!['fixed', 'percentage'].includes(discount_type)) {
        return res.status(400).json({ error: 'Invalid discount type' });
      }
      if (isNaN(value) || value <= 0) {
        return res.status(400).json({ error: 'Valid discount value is required' });
      }
      if (isNaN(usage_limit) || usage_limit <= 0) {
        return res.status(400).json({ error: 'Valid usage limit is required' });
      }
      if (!/^[A-Z0-9]+$/.test(code)) {
        return res.status(400).json({ error: 'Code must be uppercase alphanumeric' });
      }
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      if (startDate >= endDate) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }

      // Validate service_id
      const [services] = await pool.execute('SELECT * FROM services WHERE service_id = ?', [service_id]);
      if (services.length === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }

      // Check code uniqueness
      const [existingCode] = await pool.execute('SELECT * FROM promotions WHERE code = ?', [code]);
      if (existingCode.length > 0) {
        return res.status(400).json({ error: 'Promotion code already exists' });
      }

      const image = req.file ? req.file.buffer : null;

      const [result] = await pool.execute(
        `INSERT INTO promotions (service_id, title, code, description, discount_type, value, start_date, end_date, usage_limit, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [service_id, title, code, description || null, discount_type, parseFloat(value), start_date, end_date, usage_limit, image]
      );

      const [newPromotion] = await pool.execute(
        `SELECT p.promo_id, p.service_id, s.name AS service_name, p.title, p.code, p.description, 
                p.discount_type, p.value, p.start_date, p.end_date, p.usage_limit, p.image
         FROM promotions p
         JOIN services s ON p.service_id = s.service_id
         WHERE p.promo_id = ?`,
        [result.insertId]
      );

      const formattedPromotion = {
        ...newPromotion[0],
        image: newPromotion[0].image ? `data:image/jpeg;base64,${Buffer.from(newPromotion[0].image).toString('base64')}` : null,
      };

      res.status(201).json({
        message: 'Promotion created successfully',
        promotion: formattedPromotion,
      });
    } catch (error) {
      console.error('Create promotion error:', error);
      res.status(500).json({ error: 'Server error during promotion creation' });
    }
  });
};
// Get all promotions
const getPromotions = async (req, res) => {
  try {
    const [promotions] = await pool.execute(
      `SELECT p.*, s.name as service_name 
       FROM promotions p 
       JOIN services s ON p.service_id = s.service_id`
    );

    // Convert LONGBLOB images to Base64
    const formattedPromotions = promotions.map((promo) => ({
      ...promo,
      image: promo.image ? promo.image.toString('base64') : null, // 🔑 Convert to Base64
    }));

    res.status(200).json({
      message: 'Promotions retrieved successfully',
      promotions: formattedPromotions,
    });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ error: 'Server error during promotions retrieval' });
  }
};


// Get promotion by ID
const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid promotion ID is required' });
    }

    const [promotions] = await pool.execute(
      `SELECT p.*, s.name as service_name FROM promotions p JOIN services s ON p.service_id = s.service_id WHERE p.promo_id = ?`,
      [id]
    );
    if (promotions.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    res.status(200).json({
      message: 'Promotion retrieved successfully',
      promotion: promotions[0],
    });
  } catch (error) {
    console.error('Get promotion by ID error:', error);
    res.status(500).json({ error: 'Server error during promotion retrieval' });
  }
};

// Update promotion
const updatePromotion = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { id } = req.params;
      const { service_id, title, code, description, discount_type, value, start_date, end_date, usage_limit } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Valid promotion ID is required' });
      }

      const [promotions] = await pool.execute('SELECT * FROM promotions WHERE promo_id = ?', [id]);
      if (promotions.length === 0) {
        return res.status(404).json({ error: 'Promotion not found' });
      }

      const updateFields = [];
      const updateValues = [];
      if (service_id) {
        const [services] = await pool.execute('SELECT * FROM services WHERE service_id = ?', [service_id]);
        if (services.length === 0) {
          return res.status(404).json({ error: 'Service not found' });
        }
        updateFields.push('service_id = ?');
        updateValues.push(service_id);
      }
      if (title) {
        updateFields.push('title = ?');
        updateValues.push(title);
      }
      if (code) {
        if (!/^[A-Z0-9]+$/.test(code)) {
          return res.status(400).json({ error: 'Code must be uppercase alphanumeric' });
        }
        const [existingCode] = await pool.execute('SELECT * FROM promotions WHERE code = ? AND promo_id != ?', [code, id]);
        if (existingCode.length > 0) {
          return res.status(400).json({ error: 'Promotion code already exists' });
        }
        updateFields.push('code = ?');
        updateValues.push(code);
      }
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description || null);
      }
      if (discount_type) {
        if (!['fixed', 'percentage'].includes(discount_type)) {
          return res.status(400).json({ error: 'Invalid discount type' });
        }
        updateFields.push('discount_type = ?');
        updateValues.push(discount_type);
      }
      if (value) {
        if (isNaN(value) || value <= 0) {
          return res.status(400).json({ error: 'Valid discount value is required' });
        }
        updateFields.push('value = ?');
        updateValues.push(parseFloat(value));
      }
      if (start_date) {
        updateFields.push('start_date = ?');
        updateValues.push(start_date);
      }
      if (end_date) {
        updateFields.push('end_date = ?');
        updateValues.push(end_date);
      }
      if (usage_limit) {
        if (isNaN(usage_limit) || usage_limit <= 0) {
          return res.status(400).json({ error: 'Valid usage limit is required' });
        }
        updateFields.push('usage_limit = ?');
        updateValues.push(usage_limit);
      }
      if (req.file) {
        updateFields.push('image = ?');
        updateValues.push(req.file.buffer);
      } else if (req.body.image === 'null') {
        updateFields.push('image = NULL');
      }
      updateValues.push(id);

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
      }

      await pool.execute(
        `UPDATE promotions SET ${updateFields.join(', ')} WHERE promo_id = ?`,
        updateValues
      );

      const [updatedPromotion] = await pool.execute(
        `SELECT p.promo_id, p.service_id, s.name AS service_name, p.title, p.code, p.description, 
                p.discount_type, p.value, p.start_date, p.end_date, p.usage_limit, p.image
         FROM promotions p
         JOIN services s ON p.service_id = s.service_id
         WHERE p.promo_id = ?`,
        [id]
      );

      const formattedPromotion = {
        ...updatedPromotion[0],
        image: updatedPromotion[0].image ? `data:image/jpeg;base64,${Buffer.from(updatedPromotion[0].image).toString('base64')}` : null,
      };

      res.status(200).json({
        message: 'Promotion updated successfully',
        promotion: formattedPromotion,
      });
    } catch (error) {
      console.error('Update promotion error:', error);
      res.status(500).json({ error: 'Server error during promotion update' });
    }
  });
};

// Delete promotion
const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid promotion ID is required' });
    }

    // Check if promotion exists
    const [promotions] = await pool.execute('SELECT * FROM promotions WHERE promo_id = ?', [id]);
    if (promotions.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    // Delete promotion
    await pool.execute('DELETE FROM promotions WHERE promo_id = ?', [id]);

    res.status(200).json({
      message: 'Promotion deleted successfully',
    });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({ error: 'Server error during promotion deletion' });
  }
};



module.exports = {
  createPromotion: [createPromotion],
  getPromotions: [getPromotions],
  getPromotionById: [getPromotionById],
  updatePromotion: [updatePromotion],
  deletePromotion: [deletePromotion],
  getActivePromotions: [getActivePromotions],
};