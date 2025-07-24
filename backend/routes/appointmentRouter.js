const express = require('express');
const { createAppointment } = require('../controllers/appointments/appointmentController');
const verifyCustomer = require('../middlewares/verifyCustomer');

const appointmentRouter = express.Router();
// Route for creating an appointment
appointmentRouter.post('/create-appointment', verifyCustomer, createAppointment);

module.exports = appointmentRouter;