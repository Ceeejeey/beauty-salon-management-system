import React, { useState, useEffect } from 'react';
import { FaFileInvoiceDollar, FaDownload } from 'react-icons/fa';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';
import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';

const GenerateInvoice = ({ setActiveComponent }) => {
  const [appointments, setAppointments] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [formData, setFormData] = useState({
    appointment_id: '',
    payment_method: '',
    promo_id: '',
  });
  const [invoices, setInvoices] = useState([]);

  // Get current date in Sri Lanka (2025-08-04)
  const currentDate = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // Fetch completed appointments and active promotions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in as an admin to generate invoices');
          return;
        }
        const decoded = jwtDecode(token);
        if (decoded.role !== 'admin') {
          toast.error('Access restricted to admins');
          return;
        }

        const [appointmentsResponse, promotionsResponse, invoicesResponse] = await Promise.all([
          axios.get('/api/appointments/get-completed-appointments', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/promotions/active-promotions', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/invoices/get-invoices', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setAppointments(appointmentsResponse.data.appointments);
        setPromotions(promotionsResponse.data.promotions);
        setInvoices(invoicesResponse.data.invoices);
        toast.success('Data retrieved successfully');
        console.log('Appointments:', appointmentsResponse.data.appointments);
        console.log('Promotions:', promotionsResponse.data.promotions);
        console.log('Invoices:', invoicesResponse.data.invoices);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

   const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.appointment_id || !formData.payment_method) {
      toast.error('Appointment and payment method are required');
      return;
    }
    if (!['cash', 'card', 'online'].includes(formData.payment_method)) {
      toast.error('Invalid payment method');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const data = {
        appointment_id: parseInt(formData.appointment_id),
        payment_method: formData.payment_method,
        promo_id: formData.promo_id ? parseInt(formData.promo_id) : null,
      };
      const response = await axios.post('/api/invoices/create-invoice', data, {
        headers: { Authorization: `Bearer ${token}` } },
      );
      setInvoices([...invoices, response.data.invoice]);
      toast.success('Invoice created successfully');
      setFormData({ appointment_id: '', payment_method: '', promo_id: '' });
      // Refresh appointments and invoices after creating a new invoice
      const [appointmentsResponse, invoicesResponse] = await Promise.all([
        axios.get('/api/appointments/get-completed-appointments', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/invoices/get-invoices', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setAppointments(appointmentsResponse.data.appointments);
      setInvoices(invoicesResponse.data.invoices);
      handleDownloadInvoice(response.data.invoice);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create invoice');
    }
  };
  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-CA', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Generate PDF invoice
  const handleDownloadInvoice = (invoice) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');

    // Title
    doc.setFontSize(20);
    doc.setTextColor(219, 39, 119); // pink-600
    doc.text(`Invoice #${invoice.invoice_id} - ${formatDate(invoice.date_issued)}`, 20, 20);

    // Invoice Details
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); // Black
    doc.text('Invoice Details', 20, 40);
    doc.setFontSize(12);
    doc.text(`Customer: ${invoice.customer_name}`, 20, 50);
    doc.text(`Service: ${invoice.service_name}`, 20, 60);
    doc.text(`Staff: ${invoice.staff_name}`, 20, 70);
    doc.text(`Date: ${formatDate(invoice.date)}`, 20, 80);
    doc.text(`Time: ${invoice.appointment_time}`, 20, 90);
    doc.text(`Payment Method: ${invoice.payment_method}`, 20, 100);
    doc.text(`Original Amount: LKR ${parseFloat(invoice.amount).toFixed(2)}`, 20, 110);
    if (invoice.promo_id) {
      doc.text(`Promotion: ${invoice.promo_title} (${invoice.discount_percentage}% off)`, 20, 120);
      doc.text(`Total Amount: LKR ${parseFloat(invoice.total_amount).toFixed(2)}`, 20, 130);
    } else {
      doc.text(`Total Amount: LKR ${parseFloat(invoice.total_amount).toFixed(2)}`, 20, 120);
    }

    // Save PDF
    doc.save(`Invoice_${invoice.invoice_id}_${currentDate}.pdf`);
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
          .invoices-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .invoices-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .invoices-scroll::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .invoices-scroll::-webkit-scrollbar-thumb:hover {
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
        <FaFileInvoiceDollar className="mr-3 text-pink-500" /> Generate Invoice
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Create invoices for completed appointments and process payments.
      </p>
      <div className="invoices-scroll">
        {/* Invoice Generation Form */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4">Create New Invoice</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Select Appointment</label>
              <select
                name="appointment_id"
                value={formData.appointment_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="" disabled>
                  Select Appointment
                </option>
                {appointments.map((appt) => (
                  <option key={appt.appointment_id} value={appt.appointment_id}>
                    {appt.service_name} - {appt.customer_name} ({formatDate(appt.appointment_date)} {appt.time})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Payment Method</label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="" disabled>
                  Select Payment Method
                </option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Promotion (Optional)</label>
              <select
                name="promo_id"
                value={formData.promo_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">No Promotion</option>
                {promotions.map((promo) => (
                  <option key={promo.promo_id} value={promo.promo_id}>
                    {promo.title} ({promo.discount_type === 'percentage'
                        ? `${promo.value}% off`
                        : `$${promo.value} off`})
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
        </div>

        {/* Invoices List */}
        {invoices.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-700 text-lg">No invoices generated. Create an invoice to get started.</p>
            <button
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
              onClick={() => setActiveComponent('Admin Home')}
            >
              Back to Admin Home
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-semibold text-pink-700 mb-4">Generated Invoices</h3>
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
                  <th className="px-6 py-4 text-left font-semibold text-base">Promo</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Total (LKR)</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Payment Method</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
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
                    <td className="px-6 py-4 text-pink-500 font-medium">LKR {parseFloat(invoice.amount)}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {invoice.promo_id ? `${invoice.promo_title} ` : 'None'}
                    </td>
                    <td className="px-6 py-4 text-pink-500 font-medium">LKR {parseFloat(invoice.total_amount)}</td>
                    <td className="px-6 py-4 text-gray-700">{invoice.payment_method}</td>
                    <td className="px-6 py-4">
                      <button
                        className="text-pink-500 hover:text-pink-600 transition"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <FaDownload className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <div className="mt-8 text-center">
          <button
            className="flex items-center justify-center mx-auto bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setActiveComponent('Admin Home')}
          >
            <FaFileInvoiceDollar className="mr-2 text-pink-500" /> Back to Admin Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateInvoice;