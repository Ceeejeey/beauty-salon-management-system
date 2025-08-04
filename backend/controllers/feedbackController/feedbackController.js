const { pool } = require('../../config/db');


// Get feedback for customer's completed appointments
const getFeedback = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [feedback] = await pool.execute(
      `SELECT f.feedback_id, f.appointment_id, f.rating, f.comments, f.created_at,
              a.service_id, a.appointment_date, a.appointment_time,
              s.name AS service_name, st.name AS staff_name
       FROM feedback f
       JOIN appointments a ON f.appointment_id = a.appointment_id
       JOIN services s ON a.service_id = s.service_id
       JOIN staff st ON a.staff_id = st.user_id
       WHERE a.customer_id = ? AND a.status = 'Completed'`,
      [userId]
    );
    res.status(200).json({
      message: 'Feedback retrieved successfully',
      feedback,
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Server error during feedback retrieval' });
  }
};

// Submit feedback for a completed appointment
const submitFeedback = async (req, res) => {
  const { appointment_id, rating, comments } = req.body;
  const userId = req.user.user_id;
  const currentDate = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Colombo',
  });

  if (!appointment_id || !rating) {
    return res.status(400).json({ error: 'Appointment ID and rating are required' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }

  try {
    // Verify appointment is completed and belongs to the customer
    const [appointment] = await pool.execute(
      `SELECT appointment_id
       FROM appointments
       WHERE appointment_id = ? AND customer_id = ? AND status = 'Completed'`,
      [appointment_id, userId]
    );
    if (appointment.length === 0) {
      return res.status(404).json({ error: 'Completed appointment not found for this customer' });
    }

    // Check if feedback already exists
    const [existingFeedback] = await pool.execute(
      'SELECT feedback_id FROM feedback WHERE appointment_id = ?',
      [appointment_id]
    );
    if (existingFeedback.length > 0) {
      return res.status(400).json({ error: 'Feedback already submitted for this appointment' });
    }

    // Insert feedback
    const [result] = await pool.execute(
      'INSERT INTO feedback (appointment_id, rating, comments, created_at) VALUES (?, ?, ?, ?)',
      [appointment_id, rating, comments || null, currentDate]
    );

    // Fetch the inserted feedback with details
    const [newFeedback] = await pool.execute(
      `SELECT f.feedback_id, f.appointment_id, f.rating, f.comments, f.created_at,
              a.service_id, a.appointment_date, a.appointment_time,
              s.name AS service_name, st.name AS staff_name
       FROM feedback f
       JOIN appointments a ON f.appointment_id = a.appointment_id
       JOIN services s ON a.service_id = s.service_id
       JOIN staff st ON a.staff_id = st.user_id
       WHERE f.feedback_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: newFeedback[0],
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Server error during feedback submission' });
  }
};
//get feedback for specific appointment
const getFeedbackByAppointment = async (req, res) => {
  const { appointment_id } = req.params;
  const userId = req.user.user_id;

  try {
    const [feedback] = await pool.execute(
      `SELECT f.feedback_id, f.appointment_id, f.rating, f.comments, f.created_at,
              a.service_id, a.appointment_date, a.appointment_time,
              s.name AS service_name, st.name AS staff_name
       FROM feedback f
       JOIN appointments a ON f.appointment_id = a.appointment_id
       JOIN services s ON a.service_id = s.service_id
       JOIN staff st ON a.staff_id = st.user_id
       WHERE f.appointment_id = ? AND a.customer_id = ?`,
      [appointment_id, userId]
    );

    if (feedback.length === 0) {
      return res.status(404).json({ error: 'Feedback not found for this appointment' });
    }

    res.status(200).json({
      message: 'Feedback retrieved successfully',
      feedback: feedback[0],
    });
  } catch (error) {
    console.error('Get feedback by appointment error:', error);
    res.status(500).json({ error: 'Server error during feedback retrieval' });
  }
};

// Get all feedback for admin
const getAllFeedback = async (req, res) => {
  try {
    const [feedback] = await pool.execute(
      `SELECT f.feedback_id, f.appointment_id, f.rating, f.comments, f.created_at,
              a.service_id, a.appointment_date, a.appointment_time,
              s.name AS service_name, st.name AS staff_name,
              u.name AS customer_name
       FROM feedback f
       JOIN appointments a ON f.appointment_id = a.appointment_id
       JOIN services s ON a.service_id = s.service_id
       JOIN staff st ON a.staff_id = st.user_id
       JOIN users u ON a.customer_id = u.user_id
       ORDER BY f.created_at DESC`
    );
    res.status(200).json({
      message: 'All feedback retrieved successfully',
      feedback,
    });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({ error: 'Server error during feedback retrieval' });
  }
};


// Export the controller functions
module.exports = {
  getFeedback: [getFeedback],
  submitFeedback: [submitFeedback],
  getAllFeedback: [getAllFeedback],
  getFeedbackByAppointment: [getFeedbackByAppointment],
};