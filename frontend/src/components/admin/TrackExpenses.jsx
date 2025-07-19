import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaEdit, FaTrash, FaPlus, FaFileInvoice } from 'react-icons/fa';
import axios from 'axios';

// Sample expenses data (replace with API call)
const initialExpenses = [
  {
    id: 1,
    date: '2025-07-19',
    description: 'Hair Products',
    amount: 150.00,
    category: 'Supplies',
  },
  {
    id: 2,
    date: '2025-07-19',
    description: 'Electricity Bill',
    amount: 200.00,
    category: 'Utilities',
  },
  {
    id: 3,
    date: '2025-07-18',
    description: 'Rent',
    amount: 1000.00,
    category: 'Rent',
  },
];

// Sample appointments data (replace with API call)
const initialAppointments = [
  {
    id: 1,
    service: 'Haircut & Styling',
    customerName: 'Jane Doe',
    date: '2025-07-19',
    time: '2:00 PM',
    staffId: 1,
    staffName: 'Emma Johnson',
    status: 'Approved',
    price: 50.00,
  },
  {
    id: 2,
    service: 'Manicure & Pedicure',
    customerName: 'Emily Smith',
    date: '2025-07-19',
    time: '10:00 AM',
    staffId: 1,
    staffName: 'Emma Johnson',
    status: 'Approved',
    price: 40.00,
  },
  {
    id: 3,
    service: 'Facial Treatment',
    customerName: 'Sarah Brown',
    date: '2025-07-19',
    time: '3:00 PM',
    staffId: 2,
    staffName: 'Liam Davis',
    status: 'Approved',
    price: 60.00,
  },
];

const TrackExpenses = ({ setActiveComponent }) => {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [formData, setFormData] = useState({
    id: null,
    date: '2025-07-19',
    description: '',
    amount: '',
    category: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState('');
  const [invoice, setInvoice] = useState(null);

  // Fetch expenses and appointments (placeholder for API calls)
  useEffect(() => {
    // axios.get('/api/expenses').then((response) => setExpenses(response.data));
    // axios.get('/api/appointments').then((response) => setAppointments(response.data));
  }, []);

  // Calculate daily financial report for today (July 19, 2025)
  const getDailyReport = () => {
    const todayExpenses = expenses
      .filter((exp) => exp.date === '2025-07-19')
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const todayRevenue = appointments
      .filter((appt) => appt.date === '2025-07-19' && appt.status === 'Approved')
      .reduce((sum, appt) => sum + parseFloat(appt.price), 0);
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
    const data = {
      date: formData.date,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
    };

    try {
      if (isEditing) {
        // Update expense (placeholder)
        // await axios.put(`/api/expenses/${formData.id}`, data);
        setExpenses(
          expenses.map((exp) =>
            exp.id === formData.id ? { ...exp, ...data } : exp
          )
        );
        console.log('Expense updated:', data);
      } else {
        // Add expense (placeholder)
        // await axios.post('/api/expenses', data);
        const newExpense = { id: expenses.length + 1, ...data };
        setExpenses([...expenses, newExpense]);
        console.log('Expense added:', newExpense);
      }
      // Reset form
      setFormData({ id: null, date: '2025-07-19', description: '', amount: '', category: '' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  // Handle edit button click
  const handleEdit = (expense) => {
    setFormData({
      id: expense.id,
      date: expense.date,
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
    });
    setIsEditing(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      // await axios.delete(`/api/expenses/${id}`);
      setExpenses(expenses.filter((exp) => exp.id !== id));
      console.log('Expense deleted:', id);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Handle invoice generation
  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    if (!selectedAppointment) {
      console.log('No appointment selected for invoice');
      return;
    }
    const appt = appointments.find((a) => a.id === parseInt(selectedAppointment));
    if (appt) {
      const invoiceData = {
        invoiceId: `INV-${appt.id}-${Date.now()}`,
        customerName: appt.customerName,
        service: appt.service,
        date: appt.date,
        time: appt.time,
        staffName: appt.staffName,
        amount: appt.price,
        issuedDate: '2025-07-19',
      };
      setInvoice(invoiceData);
      console.log('Invoice generated:', invoiceData);
      // Placeholder for PDF generation (e.g., using jsPDF)
    }
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
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6 flex items-center">
        <FaDollarSign className="mr-3 text-pink-500" /> Track Expenses
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Manage expenses, view daily financial reports, and generate invoices for appointments.
      </p>
      
        {/* Daily Financial Report */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4">Daily Financial Report (July 19, 2025)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-gray-700 font-medium">Total Expenses</p>
              <p className="text-pink-500 text-xl font-semibold">${todayExpenses.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-gray-700 font-medium">Total Revenue</p>
              <p className="text-pink-500 text-xl font-semibold">${todayRevenue.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-gray-700 font-medium">Net Profit</p>
              <p className={`text-xl font-semibold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netProfit.toFixed(2)}
              </p>
            </div>
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
              <label className="block text-gray-700 font-medium mb-1">Amount ($)</label>
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
                    setFormData({ id: null, date: '2025-07-19', description: '', amount: '', category: '' });
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Generate Invoice Form */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4">Generate Invoice</h3>
          <form onSubmit={handleGenerateInvoice} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Select Appointment</label>
              <select
                value={selectedAppointment}
                onChange={(e) => setSelectedAppointment(e.target.value)}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="" disabled>
                  Select Appointment
                </option>
                {appointments
                  .filter((appt) => appt.status === 'Approved')
                  .map((appt) => (
                    <option key={appt.id} value={appt.id}>
                      {appt.service} - {appt.customerName} ({appt.date}, {appt.time})
                    </option>
                  ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 hover:shadow-lg transition duration-300 font-poppins"
            >
              Generate Invoice
            </button>
          </form>
          {invoice && (
            <div className="mt-4 p-4 bg-pink-50 rounded-lg">
              <h4 className="text-lg font-semibold text-pink-700">Invoice Details</h4>
              <p className="text-gray-700">Invoice ID: {invoice.invoiceId}</p>
              <p className="text-gray-700">Customer: {invoice.customerName}</p>
              <p className="text-gray-700">Service: {invoice.service}</p>
              <p className="text-gray-700">Date: {invoice.date}</p>
              <p className="text-gray-700">Time: {invoice.time}</p>
              <p className="text-gray-700">Staff: {invoice.staffName}</p>
              <p className="text-pink-500 font-semibold">Amount: ${invoice.amount.toFixed(2)}</p>
              <p className="text-gray-700">Issued: {invoice.issuedDate}</p>
            </div>
          )}
        </div>

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
            <table className="w-full bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
              <thead>
                <tr className="bg-pink-100 text-pink-700">
                  <th className="px-6 py-4 text-left font-semibold text-base">Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Description</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Amount</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Category</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                  >
                    <td className="px-6 py-4 text-pink-500 font-medium">{expense.date}</td>
                    <td className="px-6 py-4 text-gray-700">{expense.description}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">${expense.amount.toFixed(2)}</td>
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
                        onClick={() => handleDelete(expense.id)}
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
    
  );
};

export default TrackExpenses;