import React from 'react';
import { FaCalendarAlt, FaPlus } from 'react-icons/fa';

// Sample completed appointments (replace with API call in production)
const completedAppointments = [
  {
    id: 1,
    service: 'Haircut & Styling',
    date: '2025-07-10',
    time: '2:00 PM',
    notes: 'Preferred stylist: Emma',
  },
  {
    id: 2,
    service: 'Manicure & Pedicure',
    date: '2025-06-15',
    time: '10:00 AM',
    notes: 'Used gel polish',
  },
  {
    id: 3,
    service: 'Facial Treatment',
    date: '2025-05-20',
    time: '3:00 PM',
    notes: 'Hydrating mask applied',
  },
  {
    id: 4,
    service: 'Hair Coloring',
    date: '2025-04-10',
    time: '1:00 PM',
    notes: 'Blonde highlights',
  },
];

const AppointmentHistory = ({ setActiveComponent }) => {
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
      
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaCalendarAlt className="mr-3 text-pink-500" /> Appointment History
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Review your past salon visits and their details.
      </p>
     
        {completedAppointments.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-600 text-lg">No completed appointments found.</p>
            <button
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
              onClick={handleBookNew}
            >
              Book a New Appointment
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
              <thead>
                <tr className="bg-pink-100 text-pink-700">
                  <th className="px-6 py-4 text-left font-semibold text-base">Service</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Time</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Notes</th>
                </tr>
              </thead>
              <tbody>
                {completedAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                  >
                    <td className="px-6 py-4 text-gray-700">{appointment.service}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">{appointment.date}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">{appointment.time}</td>
                    <td className="px-6 py-4 text-gray-600">{appointment.notes || 'No notes'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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