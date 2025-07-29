const express = require('express');
const { createInvoice, getInvoiceById, getInvoices, updateInvoice, deleteInvoice } = require('../controllers/invoiceController/invoiceController');
const { verifyAdmin } = require('../middlewares/verifyUser'); // Assuming you have a verifyUser middleware
const invoiceRouter = express.Router();

// Route for creating an invoice
invoiceRouter.post('/create-invoice', verifyAdmin, createInvoice);

// Route for getting all invoices
invoiceRouter.get('/get-invoices', verifyAdmin, getInvoices);

// Route for getting an invoice by ID
invoiceRouter.get('/get-invoice/:id', verifyAdmin, getInvoiceById);

// Route for updating an invoice
invoiceRouter.put('/update-invoice/:id', verifyAdmin, updateInvoice);

// Route for deleting an invoice
invoiceRouter.delete('/delete-invoice/:id', verifyAdmin, deleteInvoice);

module.exports = invoiceRouter;
