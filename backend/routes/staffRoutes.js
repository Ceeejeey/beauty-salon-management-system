const express = require('express');
const { createStaff } = require('../controllers/staffController/staffController');
const { verifyAdmin } = require('../middlewares/verifyUser');

const staffRouter = express.Router();
// Route for add staff
// Only admin can create staff
staffRouter.post('/create-staff', verifyAdmin, createStaff);



module.exports = staffRouter;