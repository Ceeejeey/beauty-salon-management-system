const express = require('express');
const { createInvoice, getInvoiceById, getInvoices, updateInvoice, deleteInvoice } = require('../controllers/invoiceController/invoiceController');

const invoiceRouter = express.Router();

// Route for creating an invoice
invoiceRouter.post('/create-invoice', createInvoice);

// Route for getting all invoices
invoiceRouter.get('/get-invoices', getInvoices);

// Route for getting an invoice by ID
invoiceRouter.get('/get-invoice/:id', getInvoiceById);

// Route for updating an invoice
invoiceRouter.put('/update-invoice/:id', updateInvoice);

// Route for deleting an invoice
invoiceRouter.delete('/delete-invoice/:id', deleteInvoice);

module.exports = invoiceRouter;
