const { pool } = require('../../config/db');



// Create invoice
const createInvoice = async (req, res) => {
  try {
    const { appointment_id, promo_id, payment_method } = req.body;
    if (!appointment_id || !payment_method) {
      return res.status(400).json({ error: 'Appointment ID and payment method are required' });
    }
    if (!['cash', 'card', 'online'].includes(payment_method)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Verify appointment
    const [appointment] = await pool.execute(
      `SELECT a.appointment_id, a.service_id, s.price
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       WHERE a.appointment_id = ? AND a.status = 'Completed'`,
      [appointment_id]
    );
    if (appointment.length === 0) {
      return res.status(404).json({ error: 'Completed appointment not found' });
    }

    let total_amount = parseFloat(appointment[0].price);
    let promo = null;
    const currentDate = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Colombo',
    });

    // Apply promo if provided
    if (promo_id) {
      const [promotion] = await pool.execute(
        `SELECT promo_id, title, discount_type, value, service_id
         FROM promotions
         WHERE promo_id = ? AND start_date <= ? AND end_date >= ? AND service_id = ?`,
        [promo_id, currentDate, currentDate, appointment[0].service_id]
      );
      if (promotion.length === 0) {
        return res.status(404).json({ error: 'Valid promotion not found or not applicable to this service' });
      }
      const { discount_type, value } = promotion[0];
      if (discount_type === 'percentage') {
        total_amount = total_amount * (1 - value / 100);
      } else if (discount_type === 'fixed') {
        total_amount = Math.max(0, total_amount - value);
      }
      promo = promotion[0];
    }

    const [result] = await pool.execute(
      'INSERT INTO invoices (appointment_id, promo_id, amount, total_amount, payment_method, date_issued, is_payed) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [appointment_id, promo_id || null, parseFloat(appointment[0].price), total_amount, payment_method, currentDate, 1]
    );

    const [newInvoice] = await pool.execute(
      `SELECT i.invoice_id, i.appointment_id, i.promo_id, i.amount, i.total_amount, i.payment_method, i.date_issued,
              s.name AS service_name, u.name AS customer_name, st.name AS staff_name, a.appointment_date, a.appointment_time,
              p.title AS promo_title, p.discount_type, p.value AS discount_value
       FROM invoices i
       JOIN appointments a ON i.appointment_id = a.appointment_id
       JOIN services s ON a.service_id = s.service_id
       JOIN users u ON a.customer_id = u.user_id
       JOIN staff st ON a.staff_id = st.user_id
       LEFT JOIN promotions p ON i.promo_id = p.promo_id
       WHERE i.invoice_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: newInvoice[0],
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Server error during invoice creation' });
  }
};

// Get all invoices
const getInvoices = async (req, res) => {
  try {
    const [invoices] = await pool.execute(
      `SELECT i.invoice_id, i.appointment_id, i.promo_id, i.amount, i.total_amount, i.payment_method, i.date_issued,
              s.name AS service_name, u.name AS customer_name, st.name AS staff_name, a.appointment_date, a.appointment_time,
              p.title AS promo_title, p.discount_type, p.value AS discount_value
       FROM invoices i
       JOIN appointments a ON i.appointment_id = a.appointment_id
       JOIN services s ON a.service_id = s.service_id
       JOIN users u ON a.customer_id = u.user_id
       JOIN staff st ON a.staff_id = st.user_id
       LEFT JOIN promotions p ON i.promo_id = p.promo_id`
    );
    res.status(200).json({
      message: 'Invoices retrieved successfully',
      invoices,
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Server error during invoices retrieval' });
  }
};
// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid invoice ID is required' });
    }

    const [invoices] = await pool.execute(
      `SELECT i.*, a.customer_id, a.service_id, a.appointment_date, a.appointment_time, 
              u.name as customer_name, s.name as service_name, p.code as promotion_code
       FROM invoices i
       LEFT JOIN appointments a ON i.appointment_id = a.appointment_id
       LEFT JOIN users u ON a.customer_id = u.user_id
       LEFT JOIN services s ON a.service_id = s.service_id
       LEFT JOIN promotions p ON i.promo_id = p.promo_id
       WHERE i.invoice_id = ?`,
      [id]
    );
    if (invoices.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.status(200).json({
      message: 'Invoice retrieved successfully',
      invoice: invoices[0],
    });
  } catch (error) {
    console.error('Get invoice by ID error:', error);
    res.status(500).json({ error: 'Server error during invoice retrieval' });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { promo_id, payment_method, is_payed } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid invoice ID is required' });
    }
    if (!payment_method || is_payed === undefined) {
      return res.status(400).json({ error: 'Payment method and payment status are required' });
    }
    if (payment_method !== 'cash' && payment_method !== 'card' && payment_method !== 'online') {
      return res.status(400).json({ error: 'Payment method must be cash, card, or online' });
    }
    if (typeof is_payed !== 'boolean') {
      return res.status(400).json({ error: 'Payment status must be a boolean' });
    }
    if (promo_id && (!Number.isInteger(promo_id) || promo_id <= 0)) {
      return res.status(400).json({ error: 'Valid promotion ID is required' });
    }

    // Check if invoice exists and get appointment details
    const [invoices] = await pool.execute(
      `SELECT i.*, a.service_id, s.price 
       FROM invoices i 
       JOIN appointments a ON i.appointment_id = a.appointment_id 
       JOIN services s ON a.service_id = s.service_id 
       WHERE i.invoice_id = ?`,
      [id]
    );
    if (invoices.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Calculate amount and total_amount
    const amount = invoices[0].amount;
    let total_amount = amount;

    if (promo_id) {
      // Check if promotion exists and is valid
      const [promotions] = await pool.execute(
        'SELECT * FROM promotions WHERE promo_id = ? AND start_date <= ? AND end_date >= ? AND usage_limit > 0',
        [promo_id, '2025-07-26', '2025-07-26']
      );
      if (promotions.length === 0) {
        return res.status(404).json({ error: 'Valid promotion not found' });
      }

      const promo = promotions[0];
      if (promo.discount_type === 'percentage') {
        total_amount = amount * (1 - promo.value / 100);
      } else if (promo.discount_type === 'fixed') {
        total_amount = amount - promo.value;
      }
      total_amount = Math.max(0, total_amount.toFixed(2)); // Ensure non-negative
    }

    // Update invoice
    await pool.execute(
      `UPDATE invoices SET promo_id = ?, payment_method = ?, total_amount = ?, is_payed = ? WHERE invoice_id = ?`,
      [promo_id || null, payment_method, total_amount, is_payed, id]
    );

    // Fetch updated invoice
    const [updatedInvoice] = await pool.execute(
      `SELECT i.*, a.customer_id, a.service_id, a.appointment_date, a.appointment_time, 
              u.name as customer_name, s.name as service_name, p.code as promotion_code
       FROM invoices i
       LEFT JOIN appointments a ON i.appointment_id = a.appointment_id
       LEFT JOIN users u ON a.customer_id = u.user_id
       LEFT JOIN services s ON a.service_id = s.service_id
       LEFT JOIN promotions p ON i.promo_id = p.promo_id
       WHERE i.invoice_id = ?`,
      [id]
    );

    res.status(200).json({
      message: 'Invoice updated successfully',
      invoice: updatedInvoice[0],
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Server error during invoice update' });
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid invoice ID is required' });
    }

    // Check if invoice exists
    const [invoices] = await pool.execute('SELECT * FROM invoices WHERE invoice_id = ?', [id]);
    if (invoices.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Delete invoice
    await pool.execute('DELETE FROM invoices WHERE invoice_id = ?', [id]);

    res.status(200).json({
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Server error during invoice deletion' });
  }
};
// Get paid invoices
const getPaidInvoices = async (req, res) => {
  try {
    const [invoices] = await pool.execute(
      `SELECT i.invoice_id, i.appointment_id, s.name AS service_name, c.name AS customer_name,
              st.name AS staff_name, a.appointment_date, a.appointment_time, i.amount, i.total_amount, i.payment_method, i.date_issued
       FROM invoices i
       JOIN appointments a ON i.appointment_id = a.appointment_id
       JOIN services s ON a.service_id = s.service_id
       JOIN users c ON a.customer_id = c.user_id
       JOIN staff st ON a.staff_id = st.user_id
       WHERE i.is_payed = 1`
    );
    console.log('Paid invoices retrieved:', invoices);
    res.status(200).json({
      message: 'Paid invoices retrieved successfully',
      invoices,
    });
  } catch (error) {
    console.error('Get paid invoices error:', error);
    res.status(500).json({ error: 'Server error during paid invoices retrieval' });
  }
};


module.exports = {
  createInvoice: [createInvoice],
  getInvoices: [getInvoices],
  getInvoiceById: [getInvoiceById],
  updateInvoice: [updateInvoice],
  deleteInvoice: [deleteInvoice],
  getPaidInvoices: [getPaidInvoices],
};