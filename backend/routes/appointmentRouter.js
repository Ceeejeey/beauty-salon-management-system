const express = require('express');
const { createAppointment, updateAppointment } = require('../controllers/appointments/appointmentController');
const { verifyCustomer , verifyAdmin} = require('../middlewares/verifyUser');

const appointmentRouter = express.Router();
// Route for creating an appointment
appointmentRouter.post('/create-appointment', verifyCustomer, createAppointment);
// Route for updating an appointment
// Only admin can update appointments
appointmentRouter.put('/update-appointment/:appointment_id', verifyAdmin, updateAppointment);

module.exports = appointmentRouter;