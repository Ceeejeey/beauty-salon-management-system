import React, { useState, useEffect } from 'react';
import { FaHome, FaStar } from 'react-icons/fa';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';

const AdminFeedback = ({ setActiveComponent }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Fetch all feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view feedback');
          setLoading(false);
          return;
        }
        const decoded = jwtDecode(token);
        if (decoded.role !== 'admin') {
          setError('Access restricted to administrators');
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/feedback/get-all-feedback', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeedbackList(response.data.feedback);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch feedback');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

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
        <FaStar className="mr-3 text-pink-500" /> Customer Feedback
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        View all feedback submitted by customers.
      </p>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <>
        <table className="w-full bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
          <thead>
            <tr className="bg-pink-100 text-pink-700">
              <th className="py-6 px-4 text-pink-700 font-semibold text-left text-base">Customer</th>
              <th className="py-6 px-4 text-pink-700 font-semibold text-left text-base">Service</th>
              <th className="py-6 px-4 text-pink-700 font-semibold text-left text-base">Appointment Date</th>
              <th className="py-6 px-4 text-pink-700 font-semibold text-left text-base">Time</th>
              <th className="py-6 px-4 text-pink-700 font-semibold text-left text-base">Rating</th>
              <th className="py-6 px-4 text-pink-700 font-semibold text-left text-base">Comments</th>
              <th className="py-6 px-4 text-pink-700 font-semibold text-left text-base">Feedback Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="py-3 px-4 text-gray-700 text-center">
                  Loading feedback...
                </td>
              </tr>
            ) : feedbackList.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-3 px-4 text-gray-700 text-center">
                  No feedback available
                </td>
              </tr>
            ) : (
              feedbackList.map((fb) => (
                <tr
                  key={fb.feedback_id}
                  className="border-b border-pink-100 hover:bg-pink-50 transition duration-200"
                >
                  <td className="py-6 px-4 text-gray-700">{fb.customer_name}</td>
                  <td className="py-6 px-4 text-gray-700">{fb.service_name}</td>
                  <td className="py-6 px-4 text-gray-700">{formatDate(fb.appointment_date)}</td>
                  <td className="py-6 px-4 text-gray-700">{fb.appointment_time}</td>
                  <td className="py-6 px-4 text-gray-700">
                    <div className="flex">
                      {[...Array(fb.rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400" />
                      ))}
                    </div>
                  </td>
                  <td className="py-6 px-4 text-gray-700">{fb.comments || 'N/A'}</td>
                  <td className="py-6 px-4 text-gray-700">{formatDate(fb.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </>
      <div className="mt-8 flex justify-center">
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

export default AdminFeedback;