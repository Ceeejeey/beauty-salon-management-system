const express = require('express');
const { getProfile, updateProfile,updatePassword } = require('../controllers/customerController/customerController');
const { verifyCustomer } = require('../middlewares/verifyUser');

const customerRouter = express.Router();

// Route for getting customer profile
customerRouter.get('/profile', verifyCustomer, getProfile);
// Route for updating customer profile
customerRouter.put('/profile', verifyCustomer, updateProfile);
// Route for updating customer password
customerRouter.put('/update-password', verifyCustomer, updatePassword);

module.exports = customerRouter;
