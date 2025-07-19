import React from 'react';
import { FaHome } from 'react-icons/fa';

const StaffHome = ({ staff }) => (
  <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
    <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6 flex items-center">
      <FaHome className="mr-3 text-pink-500" /> Welcome, {staff.name}!
    </h2>
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100">
      <p className="text-gray-700 text-lg mb-4">
        This is your staff dashboard. Use the sidebar to set your attendance, view assigned appointments, or check the service list.
      </p>
      <p className="text-gray-700">
        <strong>Role:</strong> {staff.role}
      </p>
      <p className="text-gray-700">
        <strong>Email:</strong> {staff.email}
      </p>
    </div>
  </div>
);

export default StaffHome;