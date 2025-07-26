const express = require('express');
const { createService, getServiceById, getServices, updateService, deleteService} = require('../controllers/serviceController/serviceController');
const { verifyAdmin, verifyCustomer } = require('../middlewares/verifyUser');

const serviceRouter = express.Router();
// Route for add service
// Only admin can create service
serviceRouter.post('/create-service', verifyAdmin, createService);
// Route for get all services
serviceRouter.get('/get-services',  getServices);
// Route for get service by id
serviceRouter.get('/get-service/:id', getServiceById);
// Route for update service
// Only admin can update service
serviceRouter.put('/update-service/:id', verifyAdmin, updateService);
// Route for delete service
// Only admin can delete service
serviceRouter.delete('/delete-service/:id', verifyAdmin, deleteService);
// Export the service router



module.exports = serviceRouter;