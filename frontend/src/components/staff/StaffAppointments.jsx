import React, { useState, useEffect } from 'react';
import { FaTasks, FaCheckCircle } from 'react-icons/fa';
//import axios from 'axios';

// Sample appointments data (replace with API call)
const initialAppointments = [
  {
    id: 1,
    service: 'Haircut & Styling',
    customerName: 'Jane Doe',
    date: '2025-07-19',
    time: '2:00 PM',
    staffId: 1,
    status: 'Approved',
  },
  {
    id: 2,
    service: 'Manicure & Pedicure',
    customerName: 'Emily Smith',
    date: '2025-07-19',
    time: '10:00 AM',
    staffId: 1,
    status: 'Approved',
  },
];

const StaffAppointments = ({ staffId }) => {
  const [appointments, setAppointments] = useState(initialAppointments);

  useEffect(() => {
    // Fetch appointments (placeholder)
    // axios.get(`/api/appointments?staffId=${staffId}`).then((response) => {
    //   setAppointments(response.data);
    // });
  }, [staffId]);

  const handleCompleteAppointment = async (id) => {
    try {
      // Update appointment status (placeholder)
      // await axios.put(`/api/appointments/${id}`, { status: 'Completed' });
      setAppointments(
        appointments.map((appt) =>
          appt.id === id ? { ...appt, status: 'Completed' } : appt
        )
      );
      console.log('Appointment marked as Completed:', id);
    } catch (error) {
      console.error('Error updating appointment:', error);
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
      <div className="appointments-scroll max-h-[calc(100vh-5rem)] overflow-y-auto">
        {appointments.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-700 text-lg">No appointments assigned.</p>
          </div>
        ) : (
          <div className="table-container">
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
                {appointments.map((appt) => (
                  <tr
                    key={appt.id}
                    className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                  >
                    <td className="px-6 py-4 text-gray-700">{appt.service}</td>
                    <td className="px-6 py-4 text-gray-700">{appt.customerName}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">{appt.date}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">{appt.time}</td>
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
                          onClick={() => handleCompleteAppointment(appt.id)}
                        >
                          <FaCheckCircle className="text-lg" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffAppointments;