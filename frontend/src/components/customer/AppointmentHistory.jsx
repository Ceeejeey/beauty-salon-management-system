import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus } from 'react-icons/fa';
import axios from '../../api/axios';
import {jwtDecode} from 'jwt-decode';

const AppointmentHistory = ({ setActiveComponent }) => {
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Fetch completed appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your appointment history');
          return;
        }
        const decoded = jwtDecode(token);
        const customerId = decoded.user_id;
        console.log(decoded)
        const response = await axios.get(`/api/appointments/get-appointment/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompletedAppointments(response.data.appointments);
        setSuccess(response.data.message);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch appointment history');
      }
    };
    fetchAppointments();
  }, []);

  // Format time to 12-hour format
  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleBookNew = () => {
    if (setActiveComponent) {
      setActiveComponent('Book Appointment');
    }
  };

  const handleBackToDashboard = () => {
    if (setActiveComponent) {
      setActiveComponent('Dashboard');
    }
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
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
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaCalendarAlt className="mr-3 text-pink-500" /> Appointment History
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Review your past salon visits and their details.
      </p>
      {success && <div className="text-green-500 mb-4">{success}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
        {completedAppointments.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl  border border-pink-100 text-center">
            <p className="text-gray-600 text-lg">No completed appointments found.</p>
            <button
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
              onClick={handleBookNew}
            >
              Book a New Appointment
            </button>
          </div>
        ) : (
          <table className="w-full bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
            <thead>
              <tr className="bg-pink-100 text-pink-700">
                <th className="px-6 py-4 text-left font-semibold text-base">Service</th>
                <th className="px-6 py-4 text-left font-semibold text-base">Date</th>
                <th className="px-6 py-4 text-left font-semibold text-base">Time</th>
                <th className="px-6 py-4 text-left font-semibold text-base">Notes</th>
                <th className="px-6 py-4 text-left font-semibold text-base">Status</th>
              </tr>
            </thead>
            <tbody>
              {completedAppointments.map((appointment) => (
                <tr
                  key={appointment.appointment_id}
                  className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                >
                  <td className="px-6 py-4 text-gray-700">{appointment.service_name}</td>
                  <td className="px-6 py-4 text-pink-500 font-medium">{formatDate(appointment.appointment_date)}</td>
                  <td className="px-6 py-4 text-pink-500 font-medium">{formatTime(appointment.appointment_time)}</td>
                  <td className="px-6 py-4 text-gray-600">{appointment.notes || 'No notes'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      appointment.status === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : appointment.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {appointment.status}
                    </span>
                  </td> 
                </tr>
              ))}
            </tbody>
          </table>
        )}
      
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
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AppointmentHistory;