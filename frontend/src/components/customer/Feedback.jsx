import React, { useState, useEffect } from 'react';
import { FaStar, FaPlus, FaHome } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import axios from '../../api/axios';

const Feedback = ({ setActiveComponent }) => {
  const [appointments, setAppointments] = useState([]);
  const [feedbackData, setFeedbackData] = useState({});
  const [formData, setFormData] = useState({
    appointment_id: '',
    rating: '',
    comments: '',
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [customerId, setCustomerId] = useState(null);

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Fetch customer ID, completed appointments, and feedback
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get customer ID from token
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your appointments');
          return;
        }
        const decoded = jwtDecode(token);
        const customer = decoded.user_id;
        console.log('Customer ID:', customer);
        setCustomerId(customer);

        // Fetch completed appointments
        const apptResponse = await axios.get(`/api/appointments/get-appointment/${customer}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const completedAppointments = Array.isArray(apptResponse.data.appointments)
          ? apptResponse.data.appointments.filter((appt) => appt.status === 'Completed')
          : [];
        setAppointments(completedAppointments);
        console.log('Completed Appointments:', completedAppointments);

        // Fetch feedback for all appointments
        const feedbackResponse = await axios.get('/api/feedback/get-feedback', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const feedbackMap = feedbackResponse.data.feedback.reduce(
          (map, fb) => ({
            ...map,
            [fb.appointment_id]: fb,
          }),
          {}
        );
        setFeedbackData(feedbackMap);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' || name === 'appointment_id' ? parseInt(value) || '' : value,
    }));
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!formData.appointment_id || !formData.rating) {
      setError('Please select an appointment and a rating');
      return;
    }

    try {
      const payload = {
        appointment_id: formData.appointment_id,
        rating: formData.rating,
        comments: formData.comments || null,
      };
      const response = await axios.post('/api/feedback/submit-feedback', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFeedbackData((prev) => ({
        ...prev,
        [formData.appointment_id]: response.data.feedback,
      }));
      setSuccess(response.data.message);
      setFormData({ appointment_id: '', rating: '', comments: '' });
      // Refresh appointments to exclude those with feedback
      const apptResponse = await axios.get(`/api/appointments/get-appointment/${customerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const completedAppointments = Array.isArray(apptResponse.data.appointments)
        ? apptResponse.data.appointments.filter((appt) => appt.status === 'Completed')
        : [];
      setAppointments(completedAppointments);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  const handleResetForm = () => {
    setFormData({ appointment_id: '', rating: '', comments: '' });
    setSuccess(null);
    setError(null);
  };

  const handleBookNew = () => {
    if (setActiveComponent) {
      setActiveComponent('Book Appointment');
      console.log('Navigate to Book Appointment');
    }
  };

  const handleBackToDashboard = () => {
    if (setActiveComponent) {
      setActiveComponent('Dashboard');
      console.log('Navigate to Dashboard');
    }
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
          .table-container::-webkit-scrollbar {
            width: 8px;
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
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaStar className="mr-3 text-pink-500" /> Submit Feedback
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Share your experience for a past appointment.
      </p>
      {success && <div className="text-green-500 mb-4">{success}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 mb-8 hover:shadow-2xl transition duration-300">
        <form onSubmit={handleSubmitFeedback} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Select Appointment</label>
            <select
              name="appointment_id"
              value={formData.appointment_id}
              onChange={handleInputChange}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
              required
            >
              <option value="" disabled>Select an appointment</option>
              {appointments
                .filter((appt) => !feedbackData[appt.appointment_id])
                .map((appt) => (
                  <option key={appt.appointment_id} value={appt.appointment_id}>
                    {appt.service_name} - {formatDate(appt.appointment_date)} {appt.appointment_time} with {appt.staff_name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Rating (1-5)</label>
            <select
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
              required
            >
              <option value="" disabled>Select a rating</option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} Star{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white resize-none"
              rows="4"
              placeholder="Share your feedback (optional)"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="w-full sm:w-auto bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Submit Feedback
            </button>
            <button
              type="button"
              className="w-full sm:w-auto bg-white text-pink-700 px-6 py-3 rounded-xl font-semibold border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition duration-300 ease-in-out transform hover:scale-105"
              onClick={handleResetForm}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          className="flex items-center justify-center bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleBookNew}
        >
          <FaPlus className="mr-2" /> Book New Appointment
        </button>
        <button
          className="flex items-center justify-center bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleBackToDashboard}
        >
          <FaHome className="mr-2" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Feedback;