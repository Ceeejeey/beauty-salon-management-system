import React, { useState, useEffect } from 'react';
import { FaList } from 'react-icons/fa';
//import axios from 'axios';

// Sample services data (replace with API call)
const initialServices = [
  { id: 1, name: 'Haircut & Styling', description: 'Precision cut and style.', price: 50.0, duration: '1 hour' },
  { id: 2, name: 'Manicure & Pedicure', description: 'Nail care and polish.', price: 40.0, duration: '1.5 hours' },
  { id: 3, name: 'Facial Treatment', description: 'Deep cleansing facial.', price: 60.0, duration: '1 hour' },
];

const ViewServices = () => {
  const [services, setServices] = useState(initialServices);

  useEffect(() => {
    // Fetch services (placeholder)
    // axios.get('/api/services').then((response) => setServices(response.data));
  }, []);

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
          .services-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .services-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .services-scroll::-webkit-scrollbar-thumb {
            background: #ec4899;
            border-radius: 4px;
          }
          .services-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777;
          }
          .table-container {
            overflow-x: auto;
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6 flex items-center">
        <FaList className="mr-3 text-pink-500" /> Service List
      </h2>
      <div className="services-scroll max-h-[calc(100vh-5rem)] overflow-y-auto">
        {services.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-700 text-lg">No services available.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
              <thead>
                <tr className="bg-pink-100 text-pink-700">
                  <th className="px-6 py-4 text-left font-semibold text-base">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Description</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Price</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Duration</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                  >
                    <td className="px-6 py-4 text-gray-700">{service.name}</td>
                    <td className="px-6 py-4 text-gray-700">{service.description}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">${service.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">{service.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewServices;