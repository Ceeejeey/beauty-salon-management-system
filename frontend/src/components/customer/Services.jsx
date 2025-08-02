import React, { useState, useEffect } from 'react';
import { FaCut, FaHands, FaSpa } from 'react-icons/fa';
import axios from '../../api/axios';

const Services = ({ setActiveComponent }) => {
  const [services, setServices] = useState([]);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Map categories to icons
  const getIcon = (category) => {
    switch (category) {
      case 'Hair':
        return <FaCut className="w-8 h-8 text-pink-500" />;
      case 'Nails':
        return <FaHands className="w-8 h-8 text-pink-500" />;
      case 'Spa':
      case 'Massage':
      case 'Facial':
      case 'Waxing':
        return <FaSpa className="w-8 h-8 text-pink-500" />;
      default:
        return <FaSpa className="w-8 h-8 text-pink-500" />;
    }
  };

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/services/get-services', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setServices(response.data.services);
        setSuccess(response.data.message);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch services');
      }
    };
    fetchServices();
  }, []);

  // Handle Book Now button click
  const handleBookNow = (serviceId) => {
    if (setActiveComponent) {
      setActiveComponent({ component: 'Book Appointment', serviceId });
    }
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaSpa className="mr-3 text-pink-500" /> Explore Our Services
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Discover our range of premium beauty treatments designed to make you look and feel your best.
      </p>
      {success && <div className="text-green-500 mb-4">{success}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {services.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
          <p className="text-gray-600 text-lg">No services available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.service_id}
              className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
            >
              <div className="relative h-48">
                <img
                  src={service.image || `https://via.placeholder.com/300x200?text=${service.name}`}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  {getIcon(service.category)}
                  <h3 className="ml-3 text-xl font-semibold text-pink-700">{service.name}</h3>
                </div>
                <p className="text-gray-700 text-base mb-4">{service.description || 'No description'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-pink-500 font-medium">${service.price}</span>
                  <button
                    className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 hover:shadow-lg transition duration-300 font-poppins"
                    onClick={() => handleBookNow(service.service_id)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;