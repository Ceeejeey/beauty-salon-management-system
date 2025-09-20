import React, { useState, useEffect } from 'react';
import { FaGift } from 'react-icons/fa';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';

const Promotions = ({ setActiveComponent }) => {
  const [promotions, setPromotions] = useState([]);

  // Fetch active promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await axios.get('/api/promotions/active-promotions');
        setPromotions(response.data.promotions);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to fetch promotions');
      }
    };
    fetchPromotions();
  }, []);

  const handleBookNow = (serviceId) => {
    if (setActiveComponent) {
      setActiveComponent('Book Appointment', { serviceId });
      console.log('Navigate to Book Appointment with service_id:', serviceId);
    }
  };
 const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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
      <div className="promotions-scroll">
        {promotions.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-600 text-lg">No promotions available at this time. Check back soon!</p>
            <button
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
              onClick={() => setActiveComponent('Book Appointment')}
            >
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <div
                key={promo.promo_id}
                className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
              >
                <div className="relative h-48">
                  <img
                    src={promo.image || 'https://placehold.co/300x200?text=Promo'}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = 'https://placehold.co/300x200?text=Promo')}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-pink-700 mb-2">{promo.title}</h3>
                  <p className="text-gray-600 text-base mb-3">{promo.description || 'No description available'}</p>
                  <p className="text-gray-600 text-sm mb-2">
                    Code: <span className="font-medium text-pink-500">{promo.code}</span>
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    Discount:{' '}
                    <span className="font-medium text-pink-500">
                      {promo.discount_type === 'percentage'
                        ? `${promo.value}% off`
                        : `LKR ${promo.value} off`}
                    </span>
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    Service: <span className="font-medium text-pink-500">{promo.service_name}</span>
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    Valid: <span className="font-medium text-pink-500">for {formatDate(promo.start_date)} to {formatDate(promo.end_date)}</span>
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    Usage Limit: <span className="font-medium text-pink-500">{promo.usage_limit}</span>
                  </p>
                  <button
                    className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
                    onClick={() => handleBookNow(promo.service_id)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Promotions;