import React from 'react';
import { FaGift } from 'react-icons/fa';

// Sample promotions data (replace with API call in production)
const promotions = [
  {
    id: 1,
    title: '20% Off Spa Treatments',
    description: 'Indulge in a luxurious spa experience this month! Book any spa treatment and save 20%.',
    validUntil: 'July 31, 2025',
    service: 'Facial Treatment', // Optional: for pre-filling Book Appointment
    image: '/assets/customer/spa.jpg', // Absolute path in public folder
  },
  {
    id: 2,
    title: 'Free Manicure with Haircut',
    description: 'Get a complimentary manicure when you book a haircut and styling session.',
    validUntil: 'August 15, 2025',
    service: 'Haircut & Styling',
    image: '/assets/customer/manicure.jpg'
  },
  {
    id: 3,
    title: 'Summer Glow Package',
    description: 'Enjoy a facial, massage, and pedicure for a special bundle price of $120.',
    validUntil: 'August 31, 2025',
    service: 'Massage Therapy',
    image: '/assets/customer/summer_glow.jpg',
  },
  {
    id: 4,
    title: 'Loyalty Discount',
    description: 'Book your 5th appointment and receive 15% off any service of your choice.',
    validUntil: 'December 31, 2025',
    service: null, // No specific service
    image: '/assets/customer/discount.jpg',
  },
];

const Promotions = ({ setActiveComponent }) => {
  const handleBookNow = (service) => {
    if (setActiveComponent) {
      setActiveComponent('Book Appointment');
      // Optionally pass service to pre-fill form in Appointments.jsx
      console.log('Navigate to Book Appointment with service:', service);
    }
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
          .promotions-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .promotions-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .promotions-scroll::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .promotions-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaGift className="mr-3 text-pink-500" /> Promotions and Offers
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Discover exclusive deals and special offers to enhance your salon experience.
      </p>
      
        {promotions.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-600 text-lg">No promotions available at this time. Check back soon!</p>
            <button
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
              onClick={() => setActiveComponent('Explore Services')}
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
              >
                <div className="relative h-48">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/300x200?text=' + promo.title)}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-pink-700 mb-2">{promo.title}</h3>
                  <p className="text-gray-600 text-base mb-3">{promo.description}</p>
                  <p className="text-gray-600 text-sm mb-4">
                    Valid until: <span className="font-medium text-pink-500">{promo.validUntil}</span>
                  </p>
                  <button
                    className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
                    onClick={() => handleBookNow(promo.service)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      
    </div>
  );
};

export default Promotions;