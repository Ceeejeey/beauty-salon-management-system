import React, { useState, useEffect } from 'react';
import { FaCalendarCheck } from 'react-icons/fa';
//import axios from 'axios';

// Sample availability data (replace with API call)
const initialAvailability = {
  staffId: 1,
  date: '2025-07-19',
  available: true,
};

const SetAttendance = ({ staffId }) => {
  const [availability, setAvailability] = useState(initialAvailability.available);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch availability (placeholder)
    // axios.get(`/api/staff/${staffId}/availability?date=2025-07-19`).then((response) => {
    //   setAvailability(response.data.available);
    // });
  }, [staffId]);

  const handleToggleAvailability = async () => {
    setLoading(true);
    try {
      // Update availability (placeholder)
      // await axios.put(`/api/staff/${staffId}/availability`, {
      //   date: '2025-07-19',
      //   available: !availability,
      // });
      setAvailability(!availability);
      console.log('Availability updated:', !availability);
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      setLoading(false);
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
      <div className="attendance-scroll max-h-[calc(100vh-5rem)] overflow-y-auto">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100">
          <p className="text-gray-700 text-lg mb-4">
            Set your availability for today (July 19, 2025).
          </p>
          <p className="text-lg font-medium text-gray-700">
            Current Status:{' '}
            <span className={availability ? 'text-green-600' : 'text-red-600'}>
              {availability ? 'Available' : 'Unavailable'}
            </span>
          </p>
          <button
            className={`mt-4 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 hover:shadow-lg transition duration-300 font-poppins ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleToggleAvailability}
            disabled={loading}
          >
            {loading ? 'Updating...' : `Mark as ${availability ? 'Unavailable' : 'Available'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetAttendance;