import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaCheck, FaEye, FaTimes } from 'react-icons/fa';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';

const ViewAssignAppointments = ({ setActiveComponent }) => {
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rejectionNote, setRejectionNote] = useState('');

  // Verify admin role and fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in as an admin to view appointments');
          return;
        }
        const decoded = jwtDecode(token);
        if (decoded.role !== 'admin') {
          toast.error('Access restricted to admins');
          return;
        }

        // Fetch pending appointments
        const appointmentResponse = await axios.get('/api/appointments/get-pending-appointments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(appointmentResponse.data.appointments);
        toast.success(appointmentResponse.data.message);

        // Fetch staff
        const staffResponse = await axios.get('/api/staff/get-staff', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStaff(staffResponse.data.staff);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  

  // Format time to 12-hour format
  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Handle staff selection change
  const handleStaffChange = (appointmentId, staffId) => {
    setSelectedStaff({ ...selectedStaff, [appointmentId]: staffId });
  };

  // Handle staff assignment
  const handleAssignStaff = async (appointmentId) => {
    const staffId = selectedStaff[appointmentId];
    if (!staffId) {
      toast.error('Please select a staff member');
      return;
    }

    try {
      
      const response = await axios.put(
        `/api/appointments/update-appointment/${appointmentId}`,
        {
          staff_id: staffId,
         
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointment_id === appointmentId ? response.data.appointment : appt
        )
      );
      toast.success('Staff assigned successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign staff');
    }
  };

  // Open reject modal
  const openRejectModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRejectionNote('');
    setIsRejectModalOpen(true);
  };

  // Handle appointment rejection
  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionNote) {
      toast.error('Rejection note is required');
      return;
    }

    try {
      const response = await axios.put(
        `/api/appointments/reject-appointment/${selectedAppointment.appointment_id}`,
        { rejection_note: rejectionNote },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointment_id === selectedAppointment.appointment_id ? response.data.appointment : appt
        )
      );
      toast.success('Appointment rejected successfully');
      setIsRejectModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject appointment');
    }
  };

  // Handle view details
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            background: white;
            border-radius: 1.5rem;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 500px;
            padding: 2rem;
          }
          .modal-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .modal-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .modal-scroll::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .modal-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
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
      <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6 flex items-center">
        <FaCalendarAlt className="mr-3 text-pink-500" /> View & Assign Appointments
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        View all pending appointments and assign staff or reject bookings. Assigned appointments are automatically approved.
      </p>
      
      {appointments.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
          <p className="text-gray-700 text-lg">No pending appointments available.</p>
          <button
            className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
            onClick={() => setActiveComponent('Admin Home')}
          >
            Back to Admin Home
          </button>
        </div>
      ) : (
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
                key={appointment.appointment_id}
                className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
              >
                <td className="px-6 py-4 text-gray-700">{appointment.service_name}</td>
                <td className="px-6 py-4 text-gray-700">{appointment.customer_name}</td>
                <td className="px-6 py-4 text-pink-500 font-medium">{appointment.appointment_date}</td>
                <td className="px-6 py-4 text-pink-500 font-medium">{formatTime(appointment.appointment_time)}</td>
                <td className="px-6 py-4">
                  {appointment.status === 'Approved' ? (
                    <span className="text-gray-700">{appointment.staff_name || 'N/A'}</span>
                  ) : (
                    <select
                      value={selectedStaff[appointment.appointment_id] || ''}
                      onChange={(e) => handleStaffChange(appointment.appointment_id, e.target.value)}
                      className="p-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="" disabled>
                        Select Staff
                      </option>
                      {staff.map((s) => (
                        <option key={s.user_id} value={s.user_id}>
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
                    <>
                      <button
                        className="text-pink-500 hover:text-pink-600 transition"
                        onClick={() => handleAssignStaff(appointment.appointment_id)}
                        title="Assign Staff"
                      >
                        <FaCheck className="text-lg" />
                      </button>
                      <button
                        className="text-pink-500 hover:text-pink-600 transition"
                        onClick={() => openRejectModal(appointment)}
                        title="Reject Appointment"
                      >
                        <FaTimes className="text-lg" />
                      </button>
                    </>
                  )}
                  <button
                    className="text-pink-500 hover:text-pink-600 transition"
                    onClick={() => handleViewDetails(appointment)}
                    title="View Details"
                  >
                    <FaEye className="text-lg" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
   
    {isRejectModalOpen && (
      <div className="modal-overlay">
        <div className="modal-content modal-scroll">
          <h3 className="text-2xl font-bold text-pink-700 mb-4">Reject Appointment</h3>
          <p className="text-gray-600 mb-4">
            Service: <span className="font-medium">{selectedAppointment.service_name}</span>
          </p>
          <p className="text-gray-600 mb-4">
            Customer: <span className="font-medium">{selectedAppointment.customer_name}</span>
          </p>
          <form onSubmit={handleReject}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Rejection Reason</label>
              <textarea
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white resize-none"
                rows="4"
                placeholder="Enter reason for rejection"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
              >
                Reject Appointment
              </button>
              <button
                type="button"
                className="flex-1 bg-white text-pink-700 px-4 py-2 rounded-lg border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition font-poppins"
                onClick={() => setIsRejectModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    {isDetailsModalOpen && (
      <div className="modal-overlay">
        <div className="modal-content modal-scroll">
          <h3 className="text-2xl font-bold text-pink-700 mb-4">Appointment Details</h3>
          <p className="text-gray-600 mb-2">
            <strong>Service:</strong> {selectedAppointment.service_name}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Customer:</strong> {selectedAppointment.customer_name}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Date:</strong> {selectedAppointment.appointment_date}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Time:</strong> {formatTime(selectedAppointment.appointment_time)}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Status:</strong> {selectedAppointment.status}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Staff:</strong> {selectedAppointment.staff_name || 'Not assigned'}
          </p>
          <p className="text-gray-600 mb-4">
            <strong>Notes:</strong> {selectedAppointment.notes || 'None'}
          </p>
          <button
            className="w-full bg-white text-pink-700 px-4 py-2 rounded-lg border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition font-poppins"
            onClick={() => setIsDetailsModalOpen(false)}
          >
            Close
          </button>
        </div>
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
