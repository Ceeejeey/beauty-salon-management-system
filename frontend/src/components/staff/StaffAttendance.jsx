import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaTasks } from 'react-icons/fa';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';

const SetAttendance = ({ setActiveComponent }) => {
  const [present, setPresent] = useState(0); // 0 for Absent, 1 for Present
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });

  // Fetch attendance for today
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to set attendance');
          setLoading(false);
          return;
        }
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);
        if (!decoded.email || !decoded.email.startsWith('staff')) {
          setError('Access restricted to staff');
          setLoading(false);
          return;
        }
        const staffId = decoded.user_id;

        const response = await axios.get(`/api/staff/attendance/${staffId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPresent(response.data.present || 0); // Default to Absent if no record
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch attendance');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const handleToggleAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const staffId = decoded.user_id;
      const newStatus = present === 1 ? 0 : 1;

      await axios.put(
        `/api/staff/attendance/${staffId}`,
        { date: currentDate, present: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPresent(newStatus);
      console.log('Attendance updated:', newStatus === 1 ? 'Present' : 'Absent');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update attendance');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
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
          .attendance-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .attendance-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .attendance-scroll::-webkit-scrollbar-thumb {
            background: #ec4899;
            border-radius: 4px;
          }
          .attendance-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777;
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6 flex items-center">
        <FaCalendarCheck className="mr-3 text-pink-500" /> Set Attendance
      </h2>
      
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {loading ? (
            <p className="text-gray-700 text-lg">Loading attendance...</p>
          ) : (
            <>
              <p className="text-gray-700 text-lg mb-4">
                Set your attendance for today ({new Date(currentDate).toLocaleDateString('en-CA', {
                  timeZone: 'Asia/Colombo',
                })}).
              </p>
              <p className="text-lg font-medium text-gray-700">
                Current Status:{' '}
                <span className={present === 1 ? 'text-green-600' : 'text-red-600'}>
                  {present === 1 ? 'Present' : 'Absent'}
                </span>
              </p>
              <button
                className={`mt-4 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 hover:shadow-lg transition duration-300 font-poppins ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleToggleAttendance}
                disabled={loading}
              >
                {loading ? 'Updating...' : `Mark as ${present === 1 ? 'Absent' : 'Present'}`}
              </button>
            </>
          )}
        </div>
      
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

export default SetAttendance;