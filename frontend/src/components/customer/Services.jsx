import React from 'react';
import { FaCut, FaSpa, FaPaintBrush, FaHands } from 'react-icons/fa';

// Sample service data (replace with API call in production)
const services = [
  {
    id: 1,
    title: 'Haircut & Styling',
    description: 'Transform your look with a personalized haircut and professional styling.',
    price: '$50',
    icon: <FaCut className="w-8 h-8 text-pink-500" />,
    image: '/assets/customer/haircut.jpg', // Absolute path in public folder
  },
  {
    id: 2,
    title: 'Manicure & Pedicure',
    description: 'Indulge in a luxurious nail treatment for perfectly polished hands and feet.',
    price: '$40',
    icon: <FaHands className="w-8 h-8 text-pink-500" />,
    image: '/assets/customer/manicure.jpg',
  },
  {
    id: 3,
    title: 'Facial Treatment',
    description: 'Rejuvenate your skin with our deep-cleansing and hydrating facial.',
    price: '$60',
    icon: <FaSpa className="w-8 h-8 text-pink-500" />,
    image: '/assets/customer/facial_treatment.jpg',
  },
  {
    id: 4,
    title: 'Hair Coloring',
    description: 'Vibrant, long-lasting color tailored to your style.',
    price: '$75',
    icon: <FaPaintBrush className="w-8 h-8 text-pink-500" />,
    image: '/assets/customer/hair_coloring.jpg',
  },
  {
    id: 5,
    title: 'Massage Therapy',
    description: 'Relax and unwind with a soothing full-body massage.',
    price: '$80',
    icon: <FaSpa className="w-8 h-8 text-pink-500" />,
    image: '/assets/customer/spa.jpg',
  },
  {
    id: 6,
    title: 'Waxing',
    description: 'Smooth, long-lasting hair removal for all areas.',
    price: '$30',
    icon: <FaSpa className="w-8 h-8 text-pink-500" />,
    image: '/assets/customer/waxing.jpg',
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
        <FaSpa className="mr-3 text-pink-500" /> Explore Our Services
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Discover our range of premium beauty treatments designed to make you look and feel your best.
      </p>
      
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
                  onError={(e) => (e.target.src = `https://via.placeholder.com/300x200?text=${service.title}`)}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  {service.icon}
                  <h3 className="ml-3 text-xl font-semibold text-pink-700">{service.title}</h3>
                </div>
                <p className="text-gray-700 text-base mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-pink-500 font-medium">{service.price}</span>
                  <button
                    className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 hover:shadow-lg transition duration-300 font-poppins"
                    onClick={() => handleBookNow(service.title)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      
    </div>
  );
};

export default Services;