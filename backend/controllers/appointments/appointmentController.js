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

// Create notification (internal function)
const createNotification = async (user_id, appointment_id, type, message) => {
  try {
    // Fetch customer and appointment details
    const [users] = await pool.execute(
      `SELECT name FROM users WHERE user_id = ?`,
      [user_id]
    );
    if (users.length === 0) {
      throw new Error('User not found');
    }
    const [appointments] = await pool.execute(
      `SELECT appointment_date, appointment_time, service_id FROM appointments WHERE appointment_id = ?`,
      [appointment_id]
    );
    if (appointments.length === 0) {
      throw new Error('Appointment not found');
    }

    const customer = users[0];
    const appointment = appointments[0];

    // Fetch service name
    const [services] = await pool.execute(
      `SELECT name FROM services WHERE service_id = ?`,
      [appointment.service_id]
    );
    const service_name = services[0]?.name || 'Service';

    // Format appointment date and time
    const formattedDate = new Date(appointment.appointment_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = appointment.appointment_time.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Replace placeholders in message
    const finalMessage = message
      .replace('{customer_name}', customer.name)
      .replace('{appointment_date}', formattedDate)
      .replace('{appointment_time}', formattedTime)
      .replace('{service_name}', service_name)
      .replace('{status}', type === 'appointment_approved' ? 'Approved' : 'Rejected');

    // Save notification to database
    await pool.execute(
      `INSERT INTO notifications (user_id, appointment_id, type, message, status, is_read)
       VALUES (?, ?, ?, ?, 'sent', FALSE)`,
      [user_id, appointment_id, type, finalMessage]
    );
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
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
    const [staff] = await pool.execute(
      `SELECT * FROM staff WHERE user_id = ? `,
      [staff_id]
    );
    if (staff.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Check for staff double booking
    const appointment = appointments[0];
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

    // Create notification
    const message = 'Dear {customer_name}, your appointment for {service_name} on {appointment_date} at {appointment_time} has been {status}.';
    await createNotification(appointment.customer_id, appointment_id, 'appointment_approved', message);

    // Fetch updated appointment for response
    const [updatedAppointment] = await pool.execute(
      `SELECT a.appointment_id, a.customer_id, a.staff_id, a.appointment_date, a.appointment_time, a.status, a.notes, s.name
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
    const [appointments] = await pool.execute(
      `SELECT * FROM appointments WHERE appointment_id = ?`,
      [appointment_id]
    );
    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update appointment
    await pool.execute(
      `UPDATE appointments SET status = 'Rejected', notes = CONCAT(COALESCE(notes, ''), '\nRejection reason: ', ?) 
       WHERE appointment_id = ?`,
      [rejection_note, appointment_id]
    );

    // Create notification
    const appointment = appointments[0];
    const message = `Dear {customer_name}, we regret to inform you that your appointment for {service_name} on {appointment_date} at {appointment_time} has been {status}. Reason: ${rejection_note}`;
    await createNotification(appointment.customer_id, appointment_id, 'appointment_rejected', message);

    // Fetch updated appointment
    const [updatedAppointment] = await pool.execute(
      `SELECT a.appointment_id, a.customer_id, a.staff_id, a.appointment_date, a.appointment_time, a.status, a.notes, 
              s.service_name, u.name AS customer_name
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       JOIN users u ON a.customer_id = u.user_id
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
// Get all completed appointments
const getAppointments = async (req, res) => {
  try {
    const [appointments] = await pool.execute(
      `SELECT a.appointment_id, a.service_id, s.name AS service_name, c.name AS customer_name,
              a.appointment_date, a.appointment_time, a.staff_id, a.status
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       JOIN users c ON a.customer_id = c.user_id
       WHERE a.status = 'Completed'`
    );
    res.status(200).json({
      message: 'Appointments retrieved successfully',
      appointments,
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Server error during appointments retrieval' });
  }
};

// Get completed appointments without paid invoices
const getCompletedAppointments = async (req, res) => {
  try {
    const [appointments] = await pool.execute(
      `SELECT a.appointment_id, a.service_id, a.customer_id, a.staff_id, a.appointment_date, a.appointment_time,
              s.name AS service_name, s.price AS service_price,
              u.name AS customer_name, st.name AS staff_name
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       JOIN users u ON a.customer_id = u.user_id
       JOIN staff st ON a.staff_id = st.user_id
       LEFT JOIN invoices i ON a.appointment_id = i.appointment_id
       WHERE a.status = 'Completed' AND (i.invoice_id IS NULL OR i.is_payed = 0)`
    );
    res.status(200).json({
      message: 'Completed appointments without paid invoices retrieved successfully',
      appointments,
    });
  } catch (error) {
    console.error('Get completed appointments error:', error);
    res.status(500).json({ error: 'Server error during appointments retrieval' });
  }
};
const getStaffAppointments = async (req, res) => {
  const { staffId } = req.params;
  try {
    console.log('staff id from params', staffId)
    const userId = req.user.user_id;
    console.log('user staff id', userId)
    if (parseInt(staffId) !== userId) {
      return res.status(403).json({ error: 'Access restricted to your own appointments' });
    }
    const [appointments] = await pool.execute(
      `SELECT a.appointment_id, a.service_id, a.customer_id, a.staff_id, a.appointment_date, a.appointment_time, a.status,
              s.name AS service_name, st.name AS staff_name, u.name AS customer_name
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       JOIN staff st ON a.staff_id = st.user_id
       JOIN users u ON a.customer_id = u.user_id
       WHERE a.staff_id = ? AND a.status IN ('Approved')
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [staffId]
    );
    res.status(200).json({
      message: 'Staff appointments retrieved successfully',
      appointments,
    });
  } catch (error) {
    console.error('Get staff appointments error:', error);
    res.status(500).json({ error: 'Server error during appointment retrieval' });
  }
};

// Complete appointment (staff)
const completeAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const user = req.user;

    // Input validation
    if (!appointment_id || isNaN(appointment_id)) {
      return res.status(400).json({ error: 'Valid appointment ID is required' });
    }

    // Verify appointment exists and is Approved
    const [appointments] = await pool.execute(
      `SELECT * FROM appointments WHERE appointment_id = ? AND status = 'Approved' AND staff_id = ?`,
      [appointment_id, user.user_id]
    );
    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found, not in Approved status, or not assigned to this staff' });
    }

    // Update appointment status to Completed
    await pool.execute(
      `UPDATE appointments SET status = 'Completed' WHERE appointment_id = ?`,
      [appointment_id]
    );

    // Create customer notification
    const appointment = appointments[0];
    const message = `Dear {customer_name}, your appointment for {service_name} on {appointment_date} at {appointment_time} has been Completed.`;
    await createNotification(appointment.customer_id, appointment_id, 'appointment_completed', message);

    // Fetch updated appointment for response
    const [updatedAppointment] = await pool.execute(
      `SELECT a.appointment_id, a.customer_id, a.staff_id, a.appointment_date, a.appointment_time, a.status, a.notes, s.name
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       WHERE a.appointment_id = ?`,
      [appointment_id]
    );

    res.status(200).json({
      message: 'Appointment marked as completed successfully',
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
    console.error('Complete appointment error:', error);
    res.status(500).json({ error: 'Server error during appointment completion' });
  }
};
// Get available time slots for a date
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Fetch booked time slots
    const [appointments] = await pool.execute(
      `SELECT appointment_time FROM appointments WHERE appointment_date = ? AND status IN ('Pending', 'Approved')`,
      [date]
    );
    const bookedSlots = appointments.map((appt) =>
      appt.appointment_time.toString().slice(0, 5) // Return HH:MM
    );

    // Fetch blocked slots and dates
    const [blocked] = await pool.execute(
      `SELECT block_date, block_time, reason, isEntireDayBlocked FROM blocked_slots WHERE block_date = ?`,
      [date]
    );
    const blockedSlots = blocked.map((slot) => ({
      block_date: slot.block_date,
      block_time: slot.block_time ? slot.block_time.toString().slice(0, 5) : null,
      reason: slot.reason || null,
      isEntireDayBlocked: slot.isEntireDayBlocked,
    }));

    res.status(200).json({ bookedSlots, blockedSlots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Server error during fetching available slots' });
  }
};

// Get all blocked slots for calendar
const getAllBlockedSlots = async (req, res) => {
  try {
    const [blocked] = await pool.execute(
      `SELECT block_date, block_time, isEntireDayBlocked FROM blocked_slots`
    );
    const blockedSlots = blocked.map((slot) => ({
      block_date: slot.block_date,
      block_time: slot.block_time ? slot.block_time.toString().slice(0, 5) : null,
      isEntireDayBlocked: slot.isEntireDayBlocked,
    }));
    res.status(200).json({ blockedSlots });
  } catch (error) {
    console.error('Get all blocked slots error:', error);
    res.status(500).json({ error: 'Server error during fetching all blocked slots' });
  }
};

// Block date or time slot (admin)
const blockSlots = async (req, res) => {
  try {
    const { date, time, reason, isEntireDayBlocked } = req.body;

    // Input validation
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    if (time && !/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ error: 'Invalid time format. Use HH:MM' });
    }

    // Validate date is in the future (Sri Lanka time)
    const sriLankaNow = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })
    );
    const blockDate = new Date(date);
    if (blockDate.toISOString().split('T')[0] < sriLankaNow.toISOString().split('T')[0]) {
      return res.status(400).json({ error: 'Cannot block past dates' });
    }

    // Check if slot/date is already blocked
    const dbTime = time ? `${time}:00` : null;
    const [existingBlocks] = await pool.execute(
      `SELECT * FROM blocked_slots WHERE block_date = ? AND (block_time = ? OR (? IS NULL AND block_time IS NULL))`,
      [date, dbTime, dbTime]
    );
    if (existingBlocks.length > 0) {
      return res.status(400).json({ error: 'Date or time slot is already blocked' });
    }

    // Insert block
    await pool.execute(
      `INSERT INTO blocked_slots (block_date, block_time, reason, isEntireDayBlocked) VALUES (?, ?, ?, ?)`,
      [date, dbTime, reason || null, isEntireDayBlocked || false]
    );

    res.status(201).json({ message: `Successfully blocked ${isEntireDayBlocked ? 'date' : 'time slot'}` });
  } catch (error) {
    console.error('Block slots error:', error);
    res.status(500).json({ error: 'Server error during blocking slots' });
  }
};

// Unblock time slot (admin)
const unblockSlots = async (req, res) => {
  try {
    const { date, time } = req.body;

    // Input validation
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ error: 'Time is required and must be in HH:MM format' });
    }

    // Construct dbTime
    const dbTime = `${time}:00`;

    // Check if block exists
    const [existingBlocks] = await pool.execute(
      `SELECT * FROM blocked_slots WHERE block_date = ? AND block_time = ? AND isEntireDayBlocked = FALSE`,
      [date, dbTime]
    );
    if (existingBlocks.length === 0) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    // Delete block
    await pool.execute(
      `DELETE FROM blocked_slots WHERE block_date = ? AND block_time = ? AND isEntireDayBlocked = FALSE`,
      [date, dbTime]
    );

    res.status(200).json({ message: 'Successfully unblocked time slot' });
  } catch (error) {
    console.error('Unblock slots error:', error);
    res.status(500).json({ error: 'Server error during unblocking slots' });
  }
};

// Unblock entire date (admin)
const unblockDate = async (req, res) => {
  try {
    const { date, isEntireDayBlocked } = req.body;

    // Input validation
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    if (isEntireDayBlocked !== true) {
      return res.status(400).json({ error: 'isEntireDayBlocked must be true for unblocking an entire date' });
    }

    // Check if block exists
    const [existingBlocks] = await pool.execute(
      `SELECT * FROM blocked_slots WHERE block_date = ? AND isEntireDayBlocked = TRUE`,
      [date]
    );
    if (existingBlocks.length === 0) {
      return res.status(404).json({ error: 'Blocked date not found' });
    }

    // Delete block
    await pool.execute(
      `DELETE FROM blocked_slots WHERE block_date = ? AND isEntireDayBlocked = TRUE`,
      [date]
    );

    res.status(200).json({ message: 'Successfully unblocked date' });
  } catch (error) {
    console.error('Unblock date error:', error);
    res.status(500).json({ error: 'Server error during unblocking date' });
  }
};

// Get completed appointments (admin) with filtering
// Get completed appointments (admin) with filtering
const getAllCompletedAppointments = async (req, res) => {
  try {
    const { date, customer_name, staff_id } = req.query;

    // Build SQL query for appointments
    let query = `
      SELECT 
        a.appointment_id,
        a.customer_id,
        a.staff_id,
        a.appointment_date,
        a.appointment_time,
        a.notes,
        s.name AS service_name,
        uc.name AS customer_name,
        st.name AS staff_name
      FROM appointments a
      JOIN services s ON a.service_id = s.service_id
      JOIN users uc ON a.customer_id = uc.user_id
      LEFT JOIN staff st ON a.staff_id = st.user_id
      LEFT JOIN users us ON a.staff_id = us.user_id
      WHERE a.status = 'Completed'
    `;
    const params = [];

    // Apply filters
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
  query += ` AND DATE(a.appointment_date) = ?`;
  params.push(`${date}`);
    }

    if (customer_name) {
      query += ` AND uc.name LIKE ?`;
      params.push(`%${customer_name}%`);
    }
    if (staff_id && !isNaN(staff_id)) {
      query += ` AND a.staff_id = ?`;
      params.push(staff_id);
    }

    // Order by date and time
    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    // Execute query for appointments
    const [appointments] = await pool.execute(query, params);

    // Format appointments
    const formattedAppointments = appointments.map((appt) => ({
      appointment_id: appt.appointment_id,
      customer_id: appt.customer_id,
      staff_id: appt.staff_id,
      customer_name: appt.customer_name,
      staff_name: appt.staff_name || 'Unassigned',
      service_name: appt.service_name,
      date: appt.appointment_date,
      time: appt.appointment_time.toString().slice(0, 5),
      notes: appt.notes || null,
    }));

    // Fetch all staff for filter dropdown
    const [staff] = await pool.execute(
      `SELECT s.user_id, s.name 
       FROM staff s 
       ORDER BY s.name`
       
    );

    res.status(200).json({
      appointments: formattedAppointments,
      staff: staff.map(s => ({ user_id: s.user_id, name: s.name })),
    });
  } catch (error) {
    console.error('Get completed appointments error:', error);
    res.status(500).json({ error: 'Server error during fetching completed appointments' });
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
  getAppointments: [getAppointments],
  getCompletedAppointments: [getCompletedAppointments],
  getStaffAppointments: [getStaffAppointments],
  completeAppointment: [completeAppointment],
  getAvailableSlots: [getAvailableSlots],
  blockSlots: [blockSlots],
  unblockSlots: [unblockSlots],
  getAllBlockedSlots: [getAllBlockedSlots],
  unblockDate: [unblockDate],
  getAllCompletedAppointments: [getAllCompletedAppointments],
};