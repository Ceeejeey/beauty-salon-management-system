import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaEdit, FaTrash, FaPlus, FaDownload } from 'react-icons/fa';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const TrackExpenses = ({ setActiveComponent }) => {
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    date: '2025-08-04',
    description: '',
    amount: '',
    category: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Get current date in Sri Lanka (2025-08-04)
  const currentDate = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
 const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };
  // Fetch expenses and paid invoices
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in as an admin to manage expenses');
          return;
        }
        const decoded = jwtDecode(token);
        if (decoded.role !== 'admin') {
          setError('Access restricted to admins');
          return;
        }

        const [expensesResponse, invoicesResponse] = await Promise.all([
          axios.get('/api/expenses/get-expenses', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/invoices/get-paid-invoices', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setExpenses(expensesResponse.data.expenses);
        setInvoices(invoicesResponse.data.invoices);
        setSuccess('Data retrieved successfully');
        console.log('Expenses:', expensesResponse.data.expenses);
        console.log('Invoices:', invoicesResponse.data.invoices);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  // Calculate daily financial report for today
  const getDailyReport = () => {
    console.log('Calculating daily report for:', currentDate);
    console.log('Expenses:', expenses);
    console.log('expenses for today:', expenses.filter((exp) => exp.date === currentDate));
    const todayExpenses = expenses
      .filter((exp) => formatDate(exp.date) === currentDate)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    console.log('Today Expenses:', todayExpenses);
    const todayRevenue = invoices
      .filter((inv) => formatDate(inv.date_issued) === currentDate)
      .reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
    const netProfit = todayRevenue - todayExpenses;
    return { todayExpenses, todayRevenue, netProfit };
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission (add/edit expense)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    // Client-side validation
    if (!formData.date || !formData.description || !formData.amount || !formData.category) {
      setError('All fields are required');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      setError('Invalid date format');
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (!['Supplies', 'Utilities', 'Rent', 'Other'].includes(formData.category)) {
      setError('Invalid category');
      return;
    }

    const data = {
      date: formData.date,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
    };

    try {
      const token = localStorage.getItem('token');
      if (isEditing) {
        const response = await axios.put(`/api/expenses/update-expense/${formData.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(
          expenses.map((exp) =>
            exp.expense_id === formData.id ? response.data.expense : exp
          )
        );
        setSuccess('Expense updated successfully');
      } else {
        const response = await axios.post('/api/expenses/create-expense', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses([...expenses, response.data.expense]);
        setSuccess('Expense created successfully');
      }
      // Reset form
      setFormData({ id: null, date: currentDate, description: '', amount: '', category: '' });
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save expense');
    }
  };

  // Handle edit button click
  const handleEdit = (expense) => {
    setFormData({
      id: expense.expense_id,
      date: expense.date,
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
    });
    setIsEditing(true);
    setSuccess(null);
    setError(null);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/expenses/delete-expense/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(expenses.filter((exp) => exp.expense_id !== id));
      setSuccess('Expense deleted successfully');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete expense');
    }
  };



  // Generate PDF report using jsPDF
 // Generate PDF report using jsPDF
const handleDownloadReport = () => {
  const { todayExpenses, todayRevenue, netProfit } = getDailyReport();
  const formattedDate = formatDate(currentDate);
  const doc = new jsPDF();

  // Set font to Helvetica (Poppins not supported in jsPDF)
  doc.setFont('helvetica', 'normal');

  // Title
  doc.setFontSize(20);
  doc.setTextColor(219, 39, 119); // pink-600
  doc.text(`Daily Financial Report - ${formattedDate}`, 20, 20);

  // Financial Summary
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0); // Black
  doc.text('Financial Summary', 20, 40);
  doc.setFontSize(12);
  doc.text(`Total Expenses: LKR ${todayExpenses}`, 20, 50);
  doc.text(`Total Revenue: LKR ${todayRevenue}`, 20, 60);
  doc.text(`Net Profit: LKR ${netProfit}`, 20, 70);

  // Expenses Table
  doc.setFontSize(14);
  doc.text('Expenses', 20, 90);
  if (expenses.length === 0) {
    doc.setFontSize(12);
    doc.text('No expenses recorded for today.', 20, 100);
  } else {
    autoTable(doc, {
      startY: 100,
      head: [['ID', 'Date', 'Description', 'Amount (LKR)', 'Category']],
      body: expenses
        .filter((exp) => formatDate(exp.date) === currentDate)
        .map((exp) => [
          exp.expense_id,
          formatDate(exp.date),
          exp.description,
          parseFloat(exp.amount),
          exp.category,
        ]),
      headStyles: { fillColor: [236, 72, 153] }, // pink-500
      bodyStyles: { textColor: [55, 65, 81] }, // gray-700
      alternateRowStyles: { fillColor: [255, 245, 247] }, // pink-50
      margin: { left: 20, right: 20 },
    });
  }

  // Paid Invoices Table
  const expensesTableEndY = expenses.length === 0 ? 100 : doc.lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text('Paid Invoices', 20, expensesTableEndY + 10);
  if (invoices.length === 0) {
    doc.setFontSize(12);
    doc.text('No paid invoices recorded for today.', 20, expensesTableEndY + 20);
  } else {
    autoTable(doc, {
      startY: expensesTableEndY + 20,
      head: [['Invoice ID', 'Service', 'Customer', 'Staff', 'Date', 'Time', 'Amount (LKR)', 'Payment Method']],
      body: invoices
        .filter((inv) => inv.date_issued === currentDate)
        .map((inv) => [
          inv.invoice_id,
          inv.service_name,
          inv.customer_name,
          inv.staff_name,
          formatDate(inv.date_issued),
          inv.appointment_time,
          parseFloat(inv.total_amount).toFixed(2),
          inv.payment_method,
        ]),
      headStyles: { fillColor: [236, 72, 153] }, // pink-500
      bodyStyles: { textColor: [55, 65, 81] }, // gray-700
      alternateRowStyles: { fillColor: [255, 245, 247] }, // pink-50
      margin: { left: 20, right: 20 },
    });
  }

  // Save PDF
  doc.save(`Financial_Report_${currentDate}.pdf`);
};

  const { todayExpenses, todayRevenue, netProfit } = getDailyReport();

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
          .expenses-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .expenses-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .expenses-scroll::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .expenses-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
          .table-container {
            overflow-x: auto;
          }
          .table-container::-webkit-scrollbar {
            height: 8px;
          }
          .table-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .table-container::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .table-container::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6 flex items-center">
        <FaDollarSign className="mr-3 text-pink-500" /> Track Expenses
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Manage expenses, view paid invoices, and track daily financial reports.
      </p>
      {success && <div className="text-green-500 mb-4">{success}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="expenses-scroll">
        {/* Daily Financial Report */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4">Daily Financial Report ({formatDate(currentDate)})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-gray-700 font-medium">Total Expenses</p>
              <p className="text-pink-500 text-xl font-semibold">LKR {todayExpenses.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-gray-700 font-medium">Total Revenue</p>
              <p className="text-pink-500 text-xl font-semibold">LKR {todayRevenue.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-gray-700 font-medium">Net Profit</p>
              <p className={`text-xl font-semibold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                LKR {netProfit.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 hover:shadow-lg transition duration-300 font-poppins flex items-center mx-auto"
              onClick={handleDownloadReport}
            >
              <FaDownload className="mr-2" /> Download Reports
            </button>
          </div>
        </div>

        {/* Add/Edit Expense Form */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4">
            {isEditing ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter expense description"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Amount (LKR)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter amount"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                <option value="Supplies">Supplies</option>
                <option value="Utilities">Utilities</option>
                <option value="Rent">Rent</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 hover:shadow-lg transition duration-300 font-poppins"
              >
                {isEditing ? 'Update Expense' : 'Add Expense'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="bg-white text-pink-700 px-4 py-2 rounded-lg border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition font-poppins"
                  onClick={() => {
                    setFormData({ id: null, date: currentDate, description: '', amount: '', category: '' });
                    setIsEditing(false);
                    setSuccess(null);
                    setError(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Paid Invoices List */}
        {invoices.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8 text-center">
            <p className="text-gray-700 text-lg">No paid invoices recorded for today.</p>
          </div>
        ) : (
          <div className="table-container mb-8">
            <h3 className="text-2xl font-semibold text-pink-700 mb-4">Paid Invoices ({formatDate(currentDate)})</h3>
            <table className="w-full bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
              <thead>
                <tr className="bg-pink-100 text-pink-700">
                  <th className="px-6 py-4 text-left font-semibold text-base">Invoice ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Service</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Customer</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Staff</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Time</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Amount (LKR)</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {invoices
                  .filter((inv) => inv.date_issued === currentDate)
                  .map((invoice) => (
                    <tr
                      key={invoice.invoice_id}
                      className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                    >
                      <td className="px-6 py-4 text-pink-500 font-medium">{invoice.invoice_id}</td>
                      <td className="px-6 py-4 text-gray-700">{invoice.service_name}</td>
                      <td className="px-6 py-4 text-gray-700">{invoice.customer_name}</td>
                      <td className="px-6 py-4 text-gray-700">{invoice.staff_name}</td>
                      <td className="px-6 py-4 text-pink-500 font-medium">{formatDate(invoice.date_issued)}</td>
                      <td className="px-6 py-4 text-gray-700">{invoice.appointment_time}</td>
                      <td className="px-6 py-4 text-pink-500 font-medium">LKR {parseFloat(invoice.total_amount).toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-700">{invoice.payment_method}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-700 text-lg">No expenses recorded. Add an expense to get started.</p>
            <button
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
              onClick={() => setActiveComponent('Admin Home')}
            >
              Back to Admin Home
            </button>
          </div>
        ) : (
          <div className="table-container">
            <h3 className="text-2xl font-semibold text-pink-700 mb-4">Expenses</h3>
            <table className="w-full bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
              <thead>
                <tr className="bg-pink-100 text-pink-700">
                  <th className="px-6 py-4 text-left font-semibold text-base">Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Description</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Amount (LKR)</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Category</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.expense_id}
                    className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                  >
                    <td className="px-6 py-4 text-pink-500 font-medium">{formatDate(expense.date)}</td>
                    <td className="px-6 py-4 text-gray-700">{expense.description}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">LKR {parseFloat(expense.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-700">{expense.category}</td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        className="text-pink-500 hover:text-pink-600 transition"
                        onClick={() => handleEdit(expense)}
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        className="text-pink-500 hover:text-pink-600 transition"
                        onClick={() => handleDelete(expense.expense_id)}
                      >
                        <FaTrash className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-8 text-center">
          <button
            className="flex items-center justify-center mx-auto bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setActiveComponent('Admin Home')}
          >
            <FaDollarSign className="mr-2 text-pink-500" /> Back to Admin Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackExpenses;