const express = require('express');
const {getFeedback, submitFeedback, getFeedbackByAppointment, getAllFeedback} = require('../controllers/feedbackController/feedbackController');
const feedbackRouter = express.Router();
const { verifyCustomer, verifyAdmin } = require('../middlewares/verifyUser');

// Route for getting feedback
feedbackRouter.get('/get-feedback', verifyCustomer, getFeedback);
// Route for getting feedback by appointment ID
feedbackRouter.get('/get-feedback/:appointment_id', verifyCustomer, getFeedbackByAppointment);
// Route for getting all feedback (admin only)
feedbackRouter.get('/get-all-feedback', verifyAdmin, getAllFeedback);

// Route for submitting feedback
feedbackRouter.post('/submit-feedback', verifyCustomer, submitFeedback);

module.exports = feedbackRouter;
