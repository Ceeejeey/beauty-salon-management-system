const express = require('express');
const { getProfile, updateProfile,updatePassword, getAllCustomers } = require('../controllers/customerController/customerController');
const { verifyCustomer, verifyAdmin } = require('../middlewares/verifyUser');

const customerRouter = express.Router();

// Route for getting customer profile
customerRouter.get('/profile', verifyCustomer, getProfile);
// Route for updating customer profile
customerRouter.put('/profile', verifyCustomer, updateProfile);
// Route for updating customer password
customerRouter.put('/update-password', verifyCustomer, updatePassword);
// Route for getting all customers (admin access)
customerRouter.get('/customers', verifyAdmin, getAllCustomers);

module.exports = customerRouter;
