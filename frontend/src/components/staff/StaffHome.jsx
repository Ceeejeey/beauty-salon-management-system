import React from 'react';
import { FaCut, FaSpa, FaPaintBrush, FaHands, FaMedal } from 'react-icons/fa';

// Sample service data (replace with API call in production)
const services = [
  {
    id: 1,
    title: 'Haircut & Styling',
    price: 'LKR50',
    icon: <FaCut className="w-8 h-8 text-pink-500" />,
    image: '/assets/customer/haircut.jpg', // Absolute path in public folder
  },
  {
    id: 2,
    title: 'Manicure & Pedicure',
    description: 'Indulge in a luxurious nail treatment for perfectly polished hands and feet.',
    price: 'LKR40',
    icon: <FaHands className="w-8 h-8 text-pink-500" />,
    image: '/assets/customer/manicure.jpg',
  },
  {
    id: 3,
    title: 'Facial Treatment',
    description: 'Rejuvenate your skin with our deep-cleansing and hydrating facial.',
    price: 'LKR60',
    icon: <FaSpa className="w-8 h-8 text-pink-500" />,
    image: '/assets/customer/facial_treatment.jpg',
  },
];

const Services = ({ setActiveComponent }) => {
  // Handle Book Now button click
  const handleBookNow = (serviceTitle) => {
    if (setActiveComponent) {
      setActiveComponent('Book Appointment');
      console.log('Navigate to Book Appointment with service:', serviceTitle);
    }
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
     
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaMedal className="mr-3 text-pink-500" /> The work you completed YesterDay,
      </h2>
      
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
            >
              <div className="relative h-48">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = `https://via.placeholder.com/300x200?text=LKR{service.title}`)}
                />
              </div>
              <div className="p-5">
                <span className="text-pink-500 font-medium px-75">{service.price}</span>
                <div className="flex items-center mb-0 px-3">
                  {service.icon}
                  <h3 className="ml-3 text-xl font-semibold text-pink-700">{service.title}</h3>   
                </div>                
              </div>
            </div>
          ))}
        </div>
      </div>
  );
};

export default Services;