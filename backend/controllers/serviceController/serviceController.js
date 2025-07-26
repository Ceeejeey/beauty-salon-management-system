const { pool } = require('../../config/db');


// Create service
const createService = async (req, res) => {
  try {
    const { name, category, description, price, duration } = req.body;

    // Input validation
    if (!name || !category || !price || !duration) {
      return res.status(400).json({ error: 'Name, category, price, and duration are required' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    if (typeof duration !== 'string' || duration.trim() === '') {
      return res.status(400).json({ error: 'Duration must be a non-empty string' });
    }

    // Check if service name already exists
    const [existingServices] = await pool.execute('SELECT * FROM services WHERE name = ?', [name]);
    if (existingServices.length > 0) {
      return res.status(400).json({ error: 'Service name already exists' });
    }

    // Insert service
    const [result] = await pool.execute(
      `INSERT INTO services (name, category, description, price, duration)
       VALUES (?, ?, ?, ?, ?)`,
      [name, category || null, description || null, price, duration]
    );

    // Fetch created service
    const [newService] = await pool.execute('SELECT * FROM services WHERE service_id = ?', [result.insertId]);

    res.status(201).json({
      message: 'Service created successfully',
      service: newService[0],
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Server error during service creation' });
  }
};

// Get all services
const getServices = async (req, res) => {
  try {
    const [services] = await pool.execute('SELECT * FROM services');
    res.status(200).json({
      message: 'Services retrieved successfully',
      services,
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Server error during services retrieval' });
  }
};

// Get service by ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid service ID is required' });
    }

    const [services] = await pool.execute('SELECT * FROM services WHERE service_id = ?', [id]);
    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.status(200).json({
      message: 'Service retrieved successfully',
      service: services[0],
    });
  } catch (error) {
    console.error('Get service by ID:', error);
    res.status(500).json({ error: 'Server error during service retrieval' });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, price, duration } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid service ID is required' });
    }
    if (!name || !category || !price || !duration) {
      return res.status(400).json({ error: 'Name, category, price, and duration are required' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    if (typeof duration !== 'string' || duration.trim() === '') {
      return res.status(400).json({ error: 'Duration must be a non-empty string' });
    }

    // Check if service exists
    const [services] = await pool.execute('SELECT * FROM services WHERE service_id = ?', [id]);
    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if new name is unique (excluding current service)
    const [existingServices] = await pool.execute('SELECT * FROM services WHERE name = ? AND service_id != ?', [name, id]);
    if (existingServices.length > 0) {
      return res.status(400).json({ error: 'Service name already exists' });
    }

    // Update service
    await pool.execute(
      `UPDATE services SET name = ?, category = ?, description = ?, price = ?, duration = ? WHERE service_id = ?`,
      [name, category || null, description || null, price, duration, id]
    );

    // Fetch updated service
    const [updatedService] = await pool.execute('SELECT * FROM services WHERE service_id = ?', [id]);

    res.status(200).json({
      message: 'Service updated successfully',
      service: updatedService[0],
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Server error during service update' });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid service ID is required' });
    }

    // Check if service exists
    const [services] = await pool.execute('SELECT * FROM services WHERE service_id = ?', [id]);
    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if service is referenced in appointments
    const [appointments] = await pool.execute('SELECT * FROM appointments WHERE service_id = ?', [id]);
    if (appointments.length > 0) {
      return res.status(400).json({ error: 'Cannot delete service with associated appointments' });
    }

    // Delete service
    await pool.execute('DELETE FROM services WHERE service_id = ?', [id]);

    res.status(200).json({
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Server error during service deletion' });
  }
};

module.exports = {
  createService: [ createService],
  getServices: [ getServices],
  getServiceById: [ getServiceById],
  updateService: [ updateService],
  deleteService: [ deleteService],
};