const express = require('express');
const { getNotifications, markNotificationRead, deleteNotification } = require('../controllers/notificationController/notificationController');
const {  verifyCustomer, verifyCustomerAndStaff } = require('../middlewares/verifyUser'); // Assuming you have a verifyUser middleware
const notificationRouter = express.Router();

// Route for getting notifications
// Only customers can access their notifications
notificationRouter.get('/:user_id', verifyCustomerAndStaff, getNotifications);

// Route for marking a notification as read
// Only customers can mark their notifications as read
notificationRouter.put('/:notification_id/read', verifyCustomerAndStaff, markNotificationRead);

// Route for deleting a notification
// Only customers can delete their notifications
notificationRouter.delete('/:notification_id', verifyCustomerAndStaff, deleteNotification);

module.exports = notificationRouter;

