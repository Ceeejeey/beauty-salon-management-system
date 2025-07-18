import React from 'react';
import { FaCalendarAlt, FaHistory } from 'react-icons/fa';

// Sample upcoming appointments (replace with API call in production)
const upcomingAppointments = [
  {
    id: 1,
    service: 'Haircut & Styling',
    date: '2025-07-20',
    time: '2:00 PM',
  },
  {
    id: 2,
    service: 'Manicure & Pedicure',
    date: '2025-07-25',
    time: '10:00 AM',
  },
  {
    id: 3,
    service: 'Facial Treatment',
    date: '2025-08-01',
    time: '3:00 PM',
  },
];

const CloseAppointment = ({ setActiveComponent }) => {
  const handleCancel = (id) => {
    // Placeholder for API call (e.g., axios.delete(`/api/appointments/${id}`))
    console.log('Cancel appointment:', id);
    // Optionally update state or show confirmation modal
  };

  const handleReschedule = (appointment) => {
    if (setActiveComponent) {
      setActiveComponent('Book Appointment');
      // Pass appointment data for pre-filling form
      console.log('Reschedule appointment:', appointment);
    }
  };

  const handleViewHistory = () => {
    if (setActiveComponent) {
      setActiveComponent('Appointment History');
    }
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaCalendarAlt className="mr-3 text-pink-500" /> Cancel or Reschedule Appointments
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Manage your upcoming salon appointments with ease. Cancel or reschedule as needed.
      </p>
    
        {upcomingAppointments.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-600 text-lg">No upcoming appointments found.</p>
            <button
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
              onClick={() => setActiveComponent('Book Appointment')}
            >
              Book a New Appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-3xl shadow-xl border border-pink-100 p-6 hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
              >
                <h3 className="text-xl font-semibold text-pink-700 mb-2">{appointment.service}</h3>
                <p className="text-gray-600 text-base mb-1">
                  Date: <span className="font-medium text-pink-500">{appointment.date}</span>
                </p>
                <p className="text-gray-600 text-base mb-4">
                  Time: <span className="font-medium text-pink-500">{appointment.time}</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
                    onClick={() => handleReschedule(appointment)}
                  >
                    Reschedule
                  </button>
                  <button
                    className="flex-1 bg-white text-pink-700 px-4 py-2 rounded-lg border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition font-poppins"
                    onClick={() => handleCancel(appointment.id)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <button
            className="flex items-center justify-center mx-auto bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
            onClick={handleViewHistory}
          >
            <FaHistory className="mr-2 text-pink-500" /> View Appointment History
          </button>
        </div>
      </div>
    
  );
};

export default CloseAppointment;