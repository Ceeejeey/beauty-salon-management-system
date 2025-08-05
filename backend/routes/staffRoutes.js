const express = require('express');
const { createStaff, getStaff, getStaffById, updateStaff, deleteStaff, getStaffAttendance, setStaffAttendance } = require('../controllers/staffController/staffController');
const { verifyAdmin, verifyStaff } = require('../middlewares/verifyUser');

const staffRouter = express.Router();
// Route for add staff
// Only admin can create staff
staffRouter.post('/create-staff', verifyAdmin, createStaff);
// Route for get all staff
staffRouter.get('/get-staff', getStaff);
// Route for get staff by id
staffRouter.get('/get-staff/:id', getStaffById);
// Route for update staff
// Only admin can update staff
staffRouter.put('/update-staff/:id', verifyAdmin, updateStaff);
// Route for delete staff
// Only admin can delete staff
staffRouter.delete('/delete-staff/:id', verifyAdmin, deleteStaff);

// Route for getting staff attendance
staffRouter.get('/attendance/:staffId', verifyStaff, getStaffAttendance);
// Route for setting staff attendance
staffRouter.put('/attendance/:staffId', verifyStaff, setStaffAttendance);



module.exports = staffRouter;