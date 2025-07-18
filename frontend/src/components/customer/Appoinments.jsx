import React, { useState } from 'react';
import { FaCalendarAlt, FaHistory } from 'react-icons/fa';

// Sample services (replace with API call in production)
const services = [
  { id: 1, name: 'Haircut & Styling', price: '$50' },
  { id: 2, name: 'Manicure & Pedicure', price: '$40' },
  { id: 3, name: 'Facial Treatment', price: '$60' },
  { id: 4, name: 'Hair Coloring', price: '$75' },
  { id: 5, name: 'Massage Therapy', price: '$80' },
  { id: 6, name: 'Waxing', price: '$30' },
];

// Sample time slots (replace with API call or dynamic logic)
const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

const Appointments = ({ setActiveComponent }) => {
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    notes: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for API call (e.g., axios.post('/api/appointments', formData))
    console.log('Booking submitted:', formData);
    // Optionally reset form or show success message
    setFormData({ service: '', date: '', time: '', notes: '' });
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
      
        <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 mb-8 hover:shadow-2xl transition duration-300">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Select Service</label>
              <select
                name="service"
                value={formData.service}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                required
              >
                <option value="" disabled>Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.name}>
                    {service.name} ({service.price})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
                className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Time</label>
              <select
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                required
              >
                <option value="" disabled>Select a time</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
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