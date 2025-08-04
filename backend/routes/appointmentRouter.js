const express = require('express');
const { createAppointment, updateAppointment, getAppointmentByCustomerId, updateAppointmentforCustomer, deleteAppointment
, getAppointmentById, getAppointmentByCustomerIdForReschedule, getPendingAppointments, rejectAppointment, getAppointments } = require('../controllers/appointments/appointmentController');

const { verifyCustomer , verifyAdmin} = require('../middlewares/verifyUser');

const appointmentRouter = express.Router();
// Route for creating an appointment
appointmentRouter.post('/create-appointment', verifyCustomer, createAppointment);

// Route for getting completed appointments by customer ID
appointmentRouter.get('/get-appointment/:id', verifyCustomer, getAppointmentByCustomerId);
// Route for updating an appointment
// Only admin can update appointments
appointmentRouter.put('/update-appointment/:appointment_id', verifyAdmin, updateAppointment);
// Route for updating an appointment for customer
appointmentRouter.put('/update-appointment-for-customer/:appointment_id', verifyCustomer, updateAppointmentforCustomer);

// Route for deleting an appointment
appointmentRouter.delete('/delete-appointment/:appointment_id', verifyCustomer, deleteAppointment);

// Route for getting appointment by ID
appointmentRouter.get('/get-appointment-by-id/:appointment_id', verifyCustomer, getAppointmentById);

// Route for getting appointment by customer ID for reschedule
appointmentRouter.get('/get-appointment-by-customer-id/:customer_id', verifyCustomer, getAppointmentByCustomerIdForReschedule);

// Route for getting pending appointments
appointmentRouter.get('/get-pending-appointments', verifyAdmin, getPendingAppointments);
// Route for rejecting an appointment
appointmentRouter.put('/reject-appointment/:appointment_id', verifyAdmin, rejectAppointment);

// Route for getting all completed appointments
appointmentRouter.get('/get-appointments', verifyAdmin, getAppointments);

module.exports = appointmentRouter;