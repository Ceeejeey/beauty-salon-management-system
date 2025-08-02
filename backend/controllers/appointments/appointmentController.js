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

// Update appointment (admin assigns staff and sets status to Approved)
const updateAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { staff_id } = req.body;

    // Input validation
    if (!appointment_id || isNaN(appointment_id)) {
      return res.status(400).json({ error: 'Valid appointment ID is required' });
    }
    if (!staff_id || isNaN(staff_id)) {
      return res.status(400).json({ error: 'Valid staff ID is required' });
    }

    // Check if appointment exists and is Pending
    const [appointments] = await pool.execute(
      `SELECT * FROM appointments WHERE appointment_id = ? AND status = 'Pending'`,
      [appointment_id]
    );
    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or not in Pending status' });
    }

    // Check if staff exists
    const [staff] = await pool.execute('SELECT * FROM staff WHERE user_id = ?', [staff_id]);
    if (staff.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Check staff availability
    const appointment = appointments[0];
    // const [availability] = await pool.execute(
    //   `SELECT * FROM availability WHERE staff_id = ? AND date = ? AND time = ? AND status = 'Available'`,
    //   [staff_id, appointment.appointment_date, appointment.appointment_time]
    // );
    // if (availability.length === 0) {
    //   return res.status(400).json({ error: 'Staff is not available at this time' });
    // }

    // Check for staff double booking
    const [existingAppointments] = await pool.execute(
      `SELECT * FROM appointments WHERE staff_id = ? AND appointment_date = ? AND appointment_time = ?`,
      [staff_id, appointment.appointment_date, appointment.appointment_time]
    );
    if (existingAppointments.length > 0) {
      return res.status(400).json({ error: 'Staff is already booked at this time' });
    }

    // Update appointment with staff_id and status
    await pool.execute(
      `UPDATE appointments SET staff_id = ?, status = 'Approved' WHERE appointment_id = ?`,
      [staff_id, appointment_id]
    );

    // Fetch updated appointment for response
    const [updatedAppointment] = await pool.execute(
      `SELECT a.appointment_id, a.customer_id, a.staff_id, a.appointment_date, a.appointment_time, a.status, a.notes, s.name as service_name
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       WHERE a.appointment_id = ?`,
      [appointment_id]
    );

    res.status(200).json({
      message: 'Appointment updated successfully',
      appointment: {
        appointment_id: updatedAppointment[0].appointment_id,
        customer_id: updatedAppointment[0].customer_id,
        staff_id: updatedAppointment[0].staff_id,
        service_name: updatedAppointment[0].service_name,
        date: updatedAppointment[0].appointment_date,
        time: updatedAppointment[0].appointment_time,
        status: updatedAppointment[0].status,
        notes: updatedAppointment[0].notes || null,
      },
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Server error during appointment update' });
  }
};

// Get completed appointments for a specific customer
const getAppointmentByCustomerId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid customer ID is required' });
    }
    // Ensure customers can only access their own appointments
    if (req.user.role === 'customer' && parseInt(id) !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied: Cannot view other users\' appointments' });
    }
    const [appointments] = await pool.execute(
      `SELECT a.appointment_id, a.customer_id, a.service_id, a.appointment_date, a.appointment_time, a.status, a.notes, s.name AS service_name, u.name AS customer_name
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       JOIN users u ON a.customer_id = u.user_id
       WHERE a.customer_id = ? AND a.status = 'Completed'`,
      [id]
    );
    res.status(200).json({
      message: 'Appointments retrieved successfully',
      appointments,
    });
  } catch (error) {
    console.error('Get appointments by customer ID error:', error);
    res.status(500).json({ error: 'Server error during appointments retrieval' });
  }
};

// Get completed appointments for a specific customer
const getAppointmentByCustomerIdForReschedule = async (req, res) => {
  try {
    const { customer_id } = req.params;
    console.log('Fetching appointments for customer ID:', customer_id);
    if (!customer_id || isNaN(customer_id)) {
      return res.status(400).json({ error: 'Valid customer ID is required' });
    }
    // Ensure customers can only access their own appointments
    if (req.user.role === 'customer' && parseInt(customer_id) !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied: Cannot view other users\' appointments' });
    }
    const [appointments] = await pool.execute(
      `SELECT a.appointment_id, a.customer_id, a.service_id, a.appointment_date, a.appointment_time, a.status, a.notes, s.name AS service_name, u.name AS customer_name
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       JOIN users u ON a.customer_id = u.user_id
       WHERE a.customer_id = ? AND a.status != 'Completed'`,
      [customer_id]
    );
    res.status(200).json({
      message: 'Appointments retrieved successfully',
      appointments,
    });
  } catch (error) {
    console.error('Get appointments by customer ID error:', error);
    res.status(500).json({ error: 'Server error during appointments retrieval' });
  }
};

// Update appointment (reschedule)
const updateAppointmentforCustomer = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    console.log('Updating appointment for customer:', appointment_id);
    const { service_id, appointment_date, appointment_time, notes } = req.body;

    if (!appointment_id || isNaN(appointment_id)) {
      return res.status(400).json({ error: 'Valid appointment ID is required' });
    }
    if (!service_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Service ID, date, and time are required' });
    }
    if (isNaN(service_id) || service_id <= 0) {
      return res.status(400).json({ error: 'Valid service ID is required' });
    }

    // Verify appointment exists and belongs to the customer
    const [appointments] = await pool.execute(
      'SELECT * FROM appointments WHERE appointment_id = ? AND customer_id = ?',
      [appointment_id, req.user.user_id]
    );
    if (appointments.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Appointment not found or not yours' });
    }

    // Validate service exists
    const [services] = await pool.execute('SELECT * FROM services WHERE service_id = ?', [service_id]);
    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Update appointment
    await pool.execute(
      `UPDATE appointments
       SET service_id = ?, appointment_date = ?, appointment_time = ?, notes = ?, status = 'Pending'
       WHERE appointment_id = ?`,
      [service_id, appointment_date, appointment_time, notes || null, appointment_id]
    );

    // Fetch updated appointment
    const [updatedAppointment] = await pool.execute(
      `SELECT a.appointment_id, a.customer_id, a.service_id, a.appointment_date, a.appointment_time, a.status, a.notes, s.name AS service_name, u.name AS customer_name
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       JOIN users u ON a.customer_id = u.user_id
       WHERE a.appointment_id = ?`,
      [appointment_id]
    );

    res.status(200).json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment[0],
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Server error during appointment update' });
  }
};

// Delete appointment (cancel)
const deleteAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;

    if (!appointment_id || isNaN(appointment_id)) {
      return res.status(400).json({ error: 'Valid appointment ID is required' });
    }

    // Verify appointment exists and belongs to the customer
    const [appointments] = await pool.execute(
      'SELECT * FROM appointments WHERE appointment_id = ? AND customer_id = ?',
      [appointment_id, req.user.user_id]
    );
    if (appointments.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Appointment not found or not yours' });
    }

    // Delete appointment
    await pool.execute('DELETE FROM appointments WHERE appointment_id = ?', [appointment_id]);

    res.status(200).json({
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Server error during appointment deletion' });
  }
};
//get appointment by appointment id
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid appointment ID is required' });
    }

    // Fetch appointment details
    const [appointments] = await pool.execute(
      'SELECT * FROM appointments WHERE appointment_id = ? AND customer_id = ?',
      [id, req.user.id]
    );
    if (appointments.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Appointment not found or not yours' });
    }

    res.status(200).json({
      message: 'Appointment fetched successfully',
      appointment: appointments[0],
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Server error during appointment retrieval' });
  }
};

//get pending appointment for admin
const getPendingAppointments = async (req, res) => {
  try {
    const [appointments] = await pool.execute(
      `SELECT a.appointment_id, a.customer_id, a.service_id, a.appointment_date, a.appointment_time, a.status, a.notes, 
              s.name AS service_name, u.name AS customer_name, st.user_id AS staff_id, st.name AS staff_name
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       JOIN users u ON a.customer_id = u.user_id
       LEFT JOIN staff st ON a.staff_id = st.user_id
       WHERE a.status = 'Pending'`
    );
    res.status(200).json({
      message: 'Pending appointments retrieved successfully',
      appointments,
    });
  } catch (error) {
    console.error('Get pending appointments error:', error);
    res.status(500).json({ error: 'Server error during appointments retrieval' });
  }
};

// Reject appointment (admin)
const rejectAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { rejection_note } = req.body;

    if (!appointment_id || isNaN(appointment_id)) {
      return res.status(400).json({ error: 'Valid appointment ID is required' });
    }
    if (!rejection_note) {
      return res.status(400).json({ error: 'Rejection note is required' });
    }

    // Verify appointment exists
    const [appointments] = await pool.execute('SELECT * FROM appointments WHERE appointment_id = ?', [appointment_id]);
    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update appointment
    await pool.execute(
      `UPDATE appointments SET status = 'Rejected', notes = CONCAT(COALESCE(notes, ''), '\nRejection reason: ', ?) 
       WHERE appointment_id = ?`,
      [rejection_note, appointment_id]
    );

    // Fetch updated appointment
    const [updatedAppointment] = await pool.execute(
      `SELECT a.appointment_id, a.customer_id, a.service_id, a.appointment_date, a.appointment_time, a.status, a.notes, 
              s.name AS service_name, u.name AS customer_name, st.user_id AS staff_id, st.name AS staff_name
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       JOIN users u ON a.customer_id = u.user_id
       LEFT JOIN staff st ON a.staff_id = st.user_id
       WHERE a.appointment_id = ?`,
      [appointment_id]
    );

    res.status(200).json({
      message: 'Appointment rejected successfully',
      appointment: updatedAppointment[0],
    });
  } catch (error) {
    console.error('Reject appointment error:', error);
    res.status(500).json({ error: 'Server error during appointment rejection' });
  }
};

module.exports = {
  createAppointment: [createAppointment],
  updateAppointmentforCustomer: [updateAppointmentforCustomer],
  updateAppointment: [updateAppointment],
  getAppointmentByCustomerId: [getAppointmentByCustomerId],
  rejectAppointment: [rejectAppointment],
  getAppointmentByCustomerIdForReschedule: [getAppointmentByCustomerIdForReschedule],
  getAppointmentById: [getAppointmentById],
  deleteAppointment: [deleteAppointment],
  getPendingAppointments: [getPendingAppointments],
};