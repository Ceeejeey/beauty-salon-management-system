const { pool } = require('../../config/db');


const SALON_OPEN_TIME = process.env.SALON_OPEN_TIME || '09:00:00';
const SALON_CLOSE_TIME = process.env.SALON_CLOSE_TIME || '18:00:00';


// Create appointment
const createAppointment = async (req, res) => {
  try {
    const { service, date, time, notes } = req.body;
    const customer_id = req.user.user_id; // From JWT
    console.log('Creating appointment for customer:', customer_id);
    // Validate input
    if (!service || !date || !time) {
      return res.status(400).json({ error: 'Service, date, and time are required' });
    }
    // Input validation
    if (!service || !date || !time) {
      return res.status(400).json({ error: 'Service, date, and time are required' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format (use YYYY-MM-DD)' });
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ error: 'Invalid time format (use HH:MM)' });
    }

    // Validate date >= current date (July 24, 2025)
    const currentDate = new Date('2025-07-24');
    const inputDate = new Date(date);
    if (inputDate < currentDate.setHours(0, 0, 0, 0)) {
      return res.status(400).json({ error: 'Date must be today or in the future' });
    }

    // Validate time within salon hours
    if (time < SALON_OPEN_TIME || time >= SALON_CLOSE_TIME) {
      return res.status(400).json({ error: `Time must be between ${SALON_OPEN_TIME} and ${SALON_CLOSE_TIME}` });
    }

    // Validate service exists
    const [services] = await pool.execute('SELECT * FROM services WHERE service_id = ?', [service]);
    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check customer double booking
    const [customerBookings] = await pool.execute(
      `SELECT * FROM appointments WHERE customer_id = ? AND appointment_date = ? AND appointment_time = ?`,
      [customer_id, date, time]
    );
    if (customerBookings.length > 0) {
      return res.status(400).json({ error: 'You already have a booking at this time' });
    }

    // Create appointment with staff_id as NULL
    const [result] = await pool.execute(
      `INSERT INTO appointments (customer_id, service_id, appointment_date, appointment_time, status, notes)
       VALUES (?, ?, ?, ?, 'Pending', ?)`,
      [customer_id, service, date, time, notes]
    );

    // Fetch created appointment for response
    const [newAppointment] = await pool.execute(
      `SELECT a.appointment_id, a.customer_id, a.staff_id, a.appointment_date, a.appointment_time, a.status, a.notes, s.name as service_name
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       WHERE a.appointment_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: {
        appointment_id: newAppointment[0].appointment_id,
        customer_id: newAppointment[0].customer_id,
        staff_id: newAppointment[0].staff_id,
        service_name: newAppointment[0].service_name,
        date: newAppointment[0].appointment_date,
        time: newAppointment[0].appointment_time,
        status: newAppointment[0].status,
        notes: newAppointment[0].notes || null,
      },
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Server error during appointment creation' });
  }
};

module.exports = {
  createAppointment: [createAppointment],
};