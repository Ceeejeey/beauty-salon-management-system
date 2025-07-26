const express = require('express');
const { createStaff, getStaff, getStaffById, updateStaff, deleteStaff } = require('../controllers/staffController/staffController');
const { verifyAdmin } = require('../middlewares/verifyUser');

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



module.exports = staffRouter;