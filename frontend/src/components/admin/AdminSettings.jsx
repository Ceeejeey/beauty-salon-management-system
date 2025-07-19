import React from 'react';
import { FaCog } from 'react-icons/fa';

const AdminSettings = ({ setActiveComponent }) => (
  <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
    <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6 flex items-center">
      <FaCog className="mr-3 text-pink-500" /> Admin Settings
    </h2>
    <p className="text-gray-700 text-lg mb-8">Adjust admin account settings.</p>
    <div className="max-h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100">
        <p className="text-gray-700">Settings form will be implemented here.</p>
        <button
          className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
          onClick={() => setActiveComponent('Admin Home')}
        >
          Back to Admin Home
        </button>
      </div>
    </div>
  </div>
);

export default AdminSettings;