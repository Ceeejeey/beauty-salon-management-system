const { pool } = require('../../config/db');
const jwt = require('jsonwebtoken');


// Fetch customer notifications
const getNotifications = async (req, res) => {
  const { user_id } = req.params;
  const user = req.user;

  try {
    let notifications = [];
    
    if (user.email?.toLowerCase().startsWith('staff')) {
      // Fetch notifications for staff by joining appointments where staff_id matches user_id
      const [results] = await pool.execute(
        `SELECT n.notification_id, n.user_id, n.appointment_id, n.type, n.status, n.is_read, n.created_at,
                a.customer_id, a.appointment_date, a.appointment_time, a.service_id,
                u.name AS customer_name, s.name, st.name AS staff_name
         FROM notifications n
         JOIN appointments a ON n.appointment_id = a.appointment_id
         JOIN users u ON a.customer_id = u.user_id
         JOIN services s ON a.service_id = s.service_id
         JOIN staff st ON a.staff_id = st.user_id
         WHERE a.staff_id = ? AND n.type = 'appointment_approved'
         ORDER BY n.created_at DESC`,
        [user_id]
      );

      // Format staff-specific message
      notifications = results.map(notification => ({
        notification_id: notification.notification_id,
        user_id: notification.user_id,
        appointment_id: notification.appointment_id,
        type: notification.type,
        status: notification.status,
        is_read: notification.is_read,
        created_at: notification.created_at,
        message: `Dear ${notification.staff_name}, you have been assigned to an appointment for ${notification.name} with ${notification.customer_name} on ${new Date(notification.appointment_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })} at ${notification.appointment_time.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })}.`,
      }));
    } else {
      // Fetch customer notifications
      const [results] = await pool.execute(
        `SELECT notification_id, user_id, appointment_id, type, message, status, is_read, created_at
         FROM notifications
         WHERE user_id = ? AND status = 'sent'
         ORDER BY created_at DESC`,
        [user_id]
      );
      notifications = results;
    }

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error during notification retrieval' });
  }
};

// Mark notification as read
const markNotificationRead = async (req, res) => {
  const { notification_id } = req.params;

  try {
    const [result] = await pool.execute(
      `UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND is_read = FALSE`,
      [notification_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found or already read' });
    }
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Server error during notification update' });
  }
};

module.exports = {
  
  getNotifications: [getNotifications],
  markNotificationRead: [markNotificationRead],
};