import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaHistory } from 'react-icons/fa';
import axios from '../../api/axios';

const Appointments = ({ setActiveComponent }) => {
  const [formData, setFormData] = useState({
    service_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Generate time slots (09:00 AM to 06:00 PM, hourly)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(time);
    }
    return slots;
  };

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/services/get-services', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setServices(response.data.services);
        console.log('Services fetched:', response.data.services);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch services');
      }
    };
    fetchServices();
    setTimeSlots(generateTimeSlots());
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'service_id' ? parseInt(value) || '' : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    try {
      const payload = {
        service: formData.service_id,
        date: formData.appointment_date,
        time: formData.appointment_time,
        notes: formData.notes || null,
      };
      const response = await axios.post('/api/appointments/create-appointment', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccess(response.data.message);
      setFormData({ service_id: '', appointment_date: '', appointment_time: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment');
    }
  };

  const handleViewHistory = () => {
    if (setActiveComponent) {
      setActiveComponent('Appointment History');
    }
  };

  const handleCloseAppointment = () => {
    if (setActiveComponent) {
      setActiveComponent('Close Appointment');
    }
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
          .form-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .form-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .form-scroll::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .form-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaCalendarAlt className="mr-3 text-pink-500" /> Book an Appointment
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Schedule your next salon visit with ease. Select a service, date, and time that suits you.
      </p>
      {success && <div className="text-green-500 mb-4">{success}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 mb-8 hover:shadow-2xl transition duration-300">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
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
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Date</label>
            <input
              type="date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleInputChange}
              min="2025-07-29"
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
              required
            />
          </div>
          <div className="mb-6">
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
                  {new Date(`1970-01-01T${slot}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
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
          <button
            type="submit"
            className="w-full bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Book Appointment
          </button>
        </form>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className="flex items-center justify-center bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleViewHistory}
        >
          <FaHistory className="mr-2 text-pink-500" /> View Appointment History
        </button>
        <button
          className="flex items-center justify-center bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleCloseAppointment}
        >
          <FaCalendarAlt className="mr-2 text-pink-500" /> Cancel or Reschedule
        </button>
      </div>
    </div>
  );
};

export default Appointments;