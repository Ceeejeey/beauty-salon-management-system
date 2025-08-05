import React, { useState, useEffect } from 'react';
import { FaList, FaTasks } from 'react-icons/fa';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';

const ViewServices = ({ setActiveComponent }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view services');
          setLoading(false);
          return;
        }
        const decoded = jwtDecode(token);
        if (!decoded.email || !decoded.email.startsWith('staff')) {
          setError('Access restricted to authorized users');
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/services/get-services', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices(response.data.services || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch services');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleBackToDashboard = () => {
    if (setActiveComponent) {
      setActiveComponent('Dashboard');
      console.log('Navigate to Dashboard');
    }
  };

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
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
        <>
          <table className="w-full bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
            <thead>
              <tr className="bg-pink-100 text-pink-700">
                <th className="px-6 py-4 text-left font-semibold text-base">Name</th>
                <th className="px-6 py-4 text-left font-semibold text-base">Category</th>
                <th className="px-6 py-4 text-left font-semibold text-base">Price</th>
                <th className="px-6 py-4 text-left font-semibold text-base">Duration</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-gray-700 text-center">
                    Loading services...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-gray-700 text-center">
                    No services available
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr
                    key={service.service_id}
                    className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                  >
                    <td className="px-6 py-4 text-gray-700">{service.name}</td>
                    <td className="px-6 py-4 text-gray-700">{service.category}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">
                      LKR {Number(service.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-pink-500 font-medium">{service.duration}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      
      <div className="mt-8 flex justify-center">
        <button
          className="flex items-center justify-center bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleBackToDashboard}
        >
          <FaTasks className="mr-2" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ViewServices;