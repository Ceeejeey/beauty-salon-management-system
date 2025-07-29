const express = require('express');
const { createExpense, getExpenseById, getExpenses, updateExpense, deleteExpense} = require('../controllers/expenseController/expenseController');
const { verifyAdmin } = require('../middlewares/verifyUser'); // Assuming you have a verifyUser middleware
const expenseRouter = express.Router();

// Route for creating an expense
expenseRouter.post('/create-expense', verifyAdmin, createExpense);

// Route for getting all expenses
expenseRouter.get('/get-expenses', verifyAdmin, getExpenses);

// Route for getting an expense by ID
expenseRouter.get('/get-expense/:id', verifyAdmin, getExpenseById);

// Route for updating an expense
expenseRouter.put('/update-expense/:id', verifyAdmin, updateExpense);

// Route for deleting an expense
expenseRouter.delete('/delete-expense/:id', verifyAdmin, deleteExpense);

module.exports = expenseRouter;
