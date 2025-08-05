import React, { useState, useEffect } from 'react';
import { FaTasks, FaCheckCircle } from 'react-icons/fa';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';

const StaffAppointments = ({ setActiveComponent }) => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-CA', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Fetch staff appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view appointments');
          setLoading(false);
          return;
        }
        const decoded = jwtDecode(token);
        
        const staffId = decoded.user_id;

        const response = await axios.get(`/api/appointments/staff/${staffId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(response.data.appointments);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch appointments');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleCompleteAppointment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/appointments/complete-appointment/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(
        appointments.map((appt) =>
          appt.appointment_id === id ? { ...appt, status: 'Completed' } : appt
        )
      );
      console.log('Appointment marked as Completed:', id);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to complete appointment');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
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
          .appointments-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .appointments-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .appointments-scroll::-webkit-scrollbar-thumb {
            background: #ec4899;
            border-radius: 4px;
          }
          .appointments-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777;
          }
          .table-container {
            overflow-x: auto;
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6 flex items-center">
        <FaTasks className="mr-3 text-pink-500" /> Assigned Appointments
      </h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
     
        <>
          <table className="w-full bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
            <thead>
              <tr className="bg-pink-100 text-pink-700">
                <th className="px-6 py-4 text-left font-semibold text-base">Service</th>
                <th className="px-6 py-4 text-left font-semibold text-base">Customer</th>
                <th className="px-6 py-4 text-left font-semibold text-base">Date</th>
                <th className="px-6 py-4 text-left font-semibold text-base">Time</th>
                <th className="px-6 py-4 text-left font-semibold text-base">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-base">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-gray-700 text-center">
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-gray-700 text-center">
                    No appointments assigned
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr
                    key={appt.appointment_id}
                    className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                  >
                    <td className="px-6 py-4 text-gray-700">{appt.service_name}</td>
                    <td className="px-6 py-4 text-gray-700">{appt.customer_name}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">
                      {formatDate(appt.appointment_date)}
                    </td>
                    <td className="px-6 py-4 text-pink-500 font-medium">{appt.appointment_time}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`${
                          appt.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                        } font-medium`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {appt.status === 'Approved' && (
                        <button
                          className="text-pink-500 hover:text-pink-600 transition"
                          onClick={() => handleCompleteAppointment(appt.appointment_id)}
                          title="Mark as Completed"
                        >
                          <FaCheckCircle className="text-lg" />
                        </button>
                      )}
                    </td>
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
          <FaTasks className="mr-2" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default StaffAppointments;