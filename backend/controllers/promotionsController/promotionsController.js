const { pool } = require('../../config/db');


// Validate date format (YYYY-MM-DD)
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Create promotion
const createPromotion = async (req, res) => {
  try {
    const { service_id, title, code, description, discount_type, value, start_date, end_date, usage_limit } = req.body;

    // Input validation
    if (!service_id || !title || !code || !discount_type || !value || !start_date || !end_date || !usage_limit) {
      return res.status(400).json({ error: 'All fields except description are required' });
    }
    if (!Number.isInteger(service_id) || service_id <= 0) {
      return res.status(400).json({ error: 'Valid service_id is required' });
    }
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }
    if (typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({ error: 'Code must be a non-empty string' });
    }
    if (discount_type !== 'fixed' && discount_type !== 'percentage') {
      return res.status(400).json({ error: 'Discount type must be "fixed" or "percentage"' });
    }
    if (typeof value !== 'number' || value <= 0) {
      return res.status(400).json({ error: 'Value must be a positive number' });
    }
    if (!isValidDate(start_date) || !isValidDate(end_date)) {
      return res.status(400).json({ error: 'Start and end dates must be valid (YYYY-MM-DD)' });
    }
    if (!Number.isInteger(usage_limit) || usage_limit <= 0) {
      return res.status(400).json({ error: 'Usage limit must be a positive integer' });
    }

    // Date logic
    const currentDate = new Date('2025-07-26');
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (startDate < currentDate.setHours(0, 0, 0, 0)) {
      return res.status(400).json({ error: 'Start date must be today or in the future' });
    }
    if (endDate < startDate) {
      return res.status(400).json({ error: 'End date must be on or after start date' });
    }

    // Check if service exists
    const [services] = await pool.execute('SELECT * FROM services WHERE service_id = ?', [service_id]);
    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if promo code is unique
    const [existingPromos] = await pool.execute('SELECT * FROM promotions WHERE code = ?', [code]);
    if (existingPromos.length > 0) {
      return res.status(400).json({ error: 'Promo code already exists' });
    }

    // Insert promotion
    const [result] = await pool.execute(
      `INSERT INTO promotions (service_id, title, code, description, discount_type, value, start_date, end_date, usage_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [service_id, title, code, description || null, discount_type, value, start_date, end_date, usage_limit]
    );

    // Fetch created promotion
    const [newPromotion] = await pool.execute(
      `SELECT p.*, s.name as service_name FROM promotions p JOIN services s ON p.service_id = s.service_id WHERE p.promo_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Promotion created successfully',
      promotion: newPromotion[0],
    });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ error: 'Server error during promotion creation' });
  }
};

// Get all promotions
const getPromotions = async (req, res) => {
  try {
    const [promotions] = await pool.execute(
      `SELECT p.*, s.name as service_name FROM promotions p JOIN services s ON p.service_id = s.service_id`
    );
    res.status(200).json({
      message: 'Promotions retrieved successfully',
      promotions,
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
  try {
    const { id } = req.params;
    const { service_id, title, code, description, discount_type, value, start_date, end_date, usage_limit } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid promotion ID is required' });
    }
    if (!service_id || !title || !code || !discount_type || !value || !start_date || !end_date || !usage_limit) {
      return res.status(400).json({ error: 'All fields except description are required' });
    }
    if (!Number.isInteger(service_id) || service_id <= 0) {
      return res.status(400).json({ error: 'Valid service_id is required' });
    }
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }
    if (typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({ error: 'Code must be a non-empty string' });
    }
    if (discount_type !== 'fixed' && discount_type !== 'percentage') {
      return res.status(400).json({ error: 'Discount type must be "fixed" or "percentage"' });
    }
    if (typeof value !== 'number' || value <= 0) {
      return res.status(400).json({ error: 'Value must be a positive number' });
    }
    if (!isValidDate(start_date) || !isValidDate(end_date)) {
      return res.status(400).json({ error: 'Start and end dates must be valid (YYYY-MM-DD)' });
    }
    if (!Number.isInteger(usage_limit) || usage_limit <= 0) {
      return res.status(400).json({ error: 'Usage limit must be a positive integer' });
    }

    // Date logic
    const currentDate = new Date('2025-07-26');
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (startDate < currentDate.setHours(0, 0, 0, 0)) {
      return res.status(400).json({ error: 'Start date must be today or in the future' });
    }
    if (endDate < startDate) {
      return res.status(400).json({ error: 'End date must be on or after start date' });
    }

    // Check if promotion exists
    const [promotions] = await pool.execute('SELECT * FROM promotions WHERE promo_id = ?', [id]);
    if (promotions.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    // Check if service exists
    const [services] = await pool.execute('SELECT * FROM services WHERE service_id = ?', [service_id]);
    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if promo code is unique (excluding current promotion)
    const [existingPromos] = await pool.execute('SELECT * FROM promotions WHERE code = ? AND promo_id != ?', [code, id]);
    if (existingPromos.length > 0) {
      return res.status(400).json({ error: 'Promo code already exists' });
    }

    // Update promotion
    await pool.execute(
      `UPDATE promotions SET service_id = ?, title = ?, code = ?, description = ?, discount_type = ?, value = ?, start_date = ?, end_date = ?, usage_limit = ? WHERE promo_id = ?`,
      [service_id, title, code, description || null, discount_type, value, start_date, end_date, usage_limit, id]
    );

    // Fetch updated promotion
    const [updatedPromotion] = await pool.execute(
      `SELECT p.*, s.name as service_name FROM promotions p JOIN services s ON p.service_id = s.service_id WHERE p.promo_id = ?`,
      [id]
    );

    res.status(200).json({
      message: 'Promotion updated successfully',
      promotion: updatedPromotion[0],
    });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({ error: 'Server error during promotion update' });
  }
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
};