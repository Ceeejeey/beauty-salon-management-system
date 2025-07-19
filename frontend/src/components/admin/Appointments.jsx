import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaCheck, FaEye } from 'react-icons/fa';
//import axios from 'axios';

// Sample appointments data (replace with API call)
const initialAppointments = [
  {
    id: 1,
    service: 'Haircut & Styling',
    customerName: 'Jane Doe',
    date: '2025-07-20',
    time: '2:00 PM',
    staffId: null,
    staffName: null,
    status: 'Pending',
  },
  {
    id: 2,
    service: 'Manicure & Pedicure',
    customerName: 'Emily Smith',
    date: '2025-07-25',
    time: '10:00 AM',
    staffId: 1,
    staffName: 'Emma Johnson',
    status: 'Approved',
  },
  {
    id: 3,
    service: 'Facial Treatment',
    customerName: 'Sarah Brown',
    date: '2025-08-01',
    time: '3:00 PM',
    staffId: null,
    staffName: null,
    status: 'Pending',
  },
];

// Sample staff data (replace with API call)
const initialStaff = [
  { id: 1, name: 'Emma Johnson' },
  { id: 2, name: 'Liam Davis' },
  { id: 3, name: 'Olivia Wilson' },
];

const ViewAssignAppointments = ({ setActiveComponent }) => {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [staff, setStaff] = useState(initialStaff);
  const [selectedStaff, setSelectedStaff] = useState({});

  // Fetch appointments and staff (placeholder for API calls)
  useEffect(() => {
    // axios.get('/api/appointments').then((response) => setAppointments(response.data));
    // axios.get('/api/staff').then((response) => setStaff(response.data));
  }, []);

  // Handle staff assignment
  const handleAssignStaff = async (appointmentId) => {
    const staffId = selectedStaff[appointmentId];
    if (!staffId) {
      console.log('No staff selected for appointment:', appointmentId);
      return;
    }

    try {
      const selectedStaffMember = staff.find((s) => s.id === parseInt(staffId));
      // await axios.put(`/api/appointments/${appointmentId}`, {
      //   staffId,
      //   staffName: selectedStaffMember.name,
      //   status: 'Approved',
      // });
      setAppointments(
        appointments.map((appt) =>
          appt.id === appointmentId
            ? {
                ...appt,
                staffId,
                staffName: selectedStaffMember.name,
                status: 'Approved',
              }
            : appt
        )
      );
      console.log('Staff assigned to appointment:', appointmentId, 'Staff:', selectedStaffMember.name);
    } catch (error) {
      console.error('Error assigning staff:', error);
    }
  };

  // Handle staff selection change
  const handleStaffChange = (appointmentId, staffId) => {
    setSelectedStaff({ ...selectedStaff, [appointmentId]: staffId });
  };

  // Handle view details
  const handleViewDetails = (appointment) => {
    console.log('View appointment details:', appointment);
    // Placeholder for modal or navigation
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
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .appointments-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
          .table-container {
            overflow-x: auto;
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6 flex items-center">
        <FaCalendarAlt className="mr-3 text-pink-500" /> View & Assign Appointments
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        View all appointments and assign staff to pending bookings. Assigned appointments are automatically approved.
      </p>
      
        {appointments.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-700 text-lg">No appointments available.</p>
            <button
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
              onClick={() => setActiveComponent('Admin Home')}
            >
              Back to Admin Home
            </button>
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
                  <th className="px-6 py-4 text-left font-semibold text-base">Staff</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                  >
                    <td className="px-6 py-4 text-gray-700">{appointment.service}</td>
                    <td className="px-6 py-4 text-gray-700">{appointment.customerName}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">{appointment.date}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">{appointment.time}</td>
                    <td className="px-6 py-4">
                      {appointment.status === 'Approved' ? (
                        <span className="text-gray-700">{appointment.staffName}</span>
                      ) : (
                        <select
                          value={selectedStaff[appointment.id] || ''}
                          onChange={(e) => handleStaffChange(appointment.id, e.target.value)}
                          className="p-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="" disabled>
                            Select Staff
                          </option>
                          {staff.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`${
                          appointment.status === 'Approved' ? 'text-green-600' : 'text-yellow-600'
                        } font-medium`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      {appointment.status === 'Pending' && (
                        <button
                          className="text-pink-500 hover:text-pink-600 transition"
                          onClick={() => handleAssignStaff(appointment.id)}
                        >
                          <FaCheck className="text-lg" />
                        </button>
                      )}
                      <button
                        className="text-pink-500 hover:text-pink-600 transition"
                        onClick={() => handleViewDetails(appointment)}
                      >
                        <FaEye className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-8 text-center">
          <button
            className="flex items-center justify-center mx-auto bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setActiveComponent('Admin Home')}
          >
            <FaCalendarAlt className="mr-2 text-pink-500" /> Back to Admin Home
          </button>
        </div>
      </div>
    
  );
};

export default ViewAssignAppointments;