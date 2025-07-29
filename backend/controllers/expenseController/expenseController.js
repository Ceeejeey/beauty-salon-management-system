const { pool } = require('../../config/db');


// Validate date format (YYYY-MM-DD)
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Create expense
const createExpense = async (req, res) => {
  try {
    const { date, description, amount, category } = req.body;

    // Input validation
    if (!date || !description || !amount || !category) {
      return res.status(400).json({ error: 'Date, description, amount, and category are required' });
    }
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'Date must be valid (YYYY-MM-DD)' });
    }
    if (typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'Description must be a non-empty string' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    if (typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ error: 'Category must be a non-empty string' });
    }

    // Insert expense
    const [result] = await pool.execute(
      `INSERT INTO expenses (date, description, amount, category)
       VALUES (?, ?, ?, ?)`,
      [date, description, amount, category]
    );

    // Fetch created expense
    const [newExpense] = await pool.execute(
      `SELECT * FROM expenses WHERE expense_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Expense created successfully',
      expense: newExpense[0],
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Server error during expense creation' });
  }
};

// Get all expenses
const getExpenses = async (req, res) => {
  try {
    const [expenses] = await pool.execute(`SELECT * FROM expenses`);
    res.status(200).json({
      message: 'Expenses retrieved successfully',
      expenses,
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Server error during expenses retrieval' });
  }
};

// Get expense by ID
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid expense ID is required' });
    }

    const [expenses] = await pool.execute(
      `SELECT * FROM expenses WHERE expense_id = ?`,
      [id]
    );
    if (expenses.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(200).json({
      message: 'Expense retrieved successfully',
      expense: expenses[0],
    });
  } catch (error) {
    console.error('Get expense by ID error:', error);
    res.status(500).json({ error: 'Server error during expense retrieval' });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, amount, category } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid expense ID is required' });
    }
    if (!date || !description || !amount || !category) {
      return res.status(400).json({ error: 'Date, description, amount, and category are required' });
    }
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'Date must be valid (YYYY-MM-DD)' });
    }
    if (typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'Description must be a non-empty string' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    if (typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ error: 'Category must be a non-empty string' });
    }

    // Check if expense exists
    const [expenses] = await pool.execute(
      `SELECT * FROM expenses WHERE expense_id = ?`,
      [id]
    );
    if (expenses.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Update expense
    await pool.execute(
      `UPDATE expenses SET date = ?, description = ?, amount = ?, category = ? WHERE expense_id = ?`,
      [date, description, amount, category, id]
    );

    // Fetch updated expense
    const [updatedExpense] = await pool.execute(
      `SELECT * FROM expenses WHERE expense_id = ?`,
      [id]
    );

    res.status(200).json({
      message: 'Expense updated successfully',
      expense: updatedExpense[0],
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Server error during expense update' });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid expense ID is required' });
    }

    // Check if expense exists
    const [expenses] = await pool.execute(
      `SELECT * FROM expenses WHERE expense_id = ?`,
      [id]
    );
    if (expenses.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Delete expense
    await pool.execute(`DELETE FROM expenses WHERE expense_id = ?`, [id]);

    res.status(200).json({
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Server error during expense deletion' });
  }
};

module.exports = {
  createExpense: [createExpense],
  getExpenses: [getExpenses],
  getExpenseById: [getExpenseById],
  updateExpense: [updateExpense],
  deleteExpense: [deleteExpense],
};