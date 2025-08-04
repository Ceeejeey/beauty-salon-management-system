import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaHistory } from 'react-icons/fa';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';

const CloseAppointment = ({ setActiveComponent }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    service_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });
// Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-CA', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };
  // Generate time slots (09:00 AM to 06:00 PM, hourly)
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00:00`);
  }

  // Fetch pending/rejected appointments and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your appointments');
          return;
        }
        const decoded = jwtDecode(token);
        const customerId = decoded.user_id;

        // Fetch appointments
        console.log('Fetching appointments for customer ID:', customerId);
        const appointmentResponse = await axios.get(`/api/appointments/get-appointment-by-customer-id/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingAppointments(appointmentResponse.data.appointments);
        setSuccess(appointmentResponse.data.message);
        console.log('Upcoming appointments:', appointmentResponse.data.appointments);
        // Fetch services
        const servicesResponse = await axios.get('/api/services/get-services', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices(servicesResponse.data.services);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
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

  // Open modal with pre-filled appointment data
  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      service_id: appointment.service_id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      notes: appointment.notes || '',
    });
    setIsModalOpen(true);
  };

  // Handle modal input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'service_id' ? parseInt(value) || '' : value,
    }));
  };

  // Submit updated appointment
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/appointments/update-appointment-for-customer/${selectedAppointment.appointment_id}`, {
        service_id: formData.service_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        notes: formData.notes || null,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcomingAppointments((prev) =>
        prev.map((appt) =>
          appt.appointment_id === selectedAppointment.appointment_id ? response.data.appointment : appt
        )
      );
      setSuccess('Appointment updated successfully');
      setError(null);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update appointment');
      setSuccess(null);
    }
  };

  // Handle cancel (delete appointment)
  const handleCancel = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/appointments/delete-appointment/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcomingAppointments((prev) =>
        prev.filter((appt) => appt.appointment_id !== appointmentId)
      );
      setSuccess('Appointment cancelled successfully');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel appointment');
      setSuccess(null);
    }
  };

  const handleViewHistory = () => {
    if (setActiveComponent) {
      setActiveComponent('Appointment History');
    }
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
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaCalendarAlt className="mr-3 text-pink-500" /> Cancel or Reschedule Appointments
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Manage your upcoming salon appointments with ease. Cancel or reschedule as needed.
      </p>
      {success && <div className="text-green-500 mb-4">{success}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          upcomingAppointments.map((appointment) => (
            <div
              key={appointment.appointment_id}
              className="bg-white rounded-3xl shadow-xl border border-pink-100 p-6 hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
            >
              <h3 className="text-xl font-semibold text-pink-700 mb-2">{appointment.service_name}</h3>
              <p className="text-gray-600 text-base mb-1">
                Date: <span className="font-medium text-pink-500">{formatDate(appointment.appointment_date)}</span>
              </p>
              <p className="text-gray-600 text-base mb-1">
                Time: <span className="font-medium text-pink-500">{formatTime(appointment.appointment_time)}</span>
              </p>
              <p className="text-gray-600 text-base mb-4">
                Status: <span className="font-medium text-pink-500">{appointment.status}</span>
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
                  onClick={() => handleCancel(appointment.appointment_id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-scroll">
            <h3 className="text-2xl font-bold text-pink-700 mb-4">Reschedule Appointment</h3>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Select Service</label>
                <select
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                  required
                >
                  <option value="" disabled>Select a service</option>
                  {services.map((service) => (
                    <option key={service.service_id} value={service.service_id}>
                      {service.name} (${service.price})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Date</label>
                <input
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleInputChange}
                  min="2025-08-02"
                  className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Time</label>
                <select
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                  required
                >
                  <option value="" disabled>Select a time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {formatTime(slot)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white resize-none"
                  rows="4"
                  placeholder="Any special requests?"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
                >
                  Update Appointment
                </button>
                <button
                  type="button"
                  className="flex-1 bg-white text-pink-700 px-4 py-2 rounded-lg border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition font-poppins"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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