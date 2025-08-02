import React from 'react';
import { FaHome, FaCalendarCheck, FaTasks, FaList } from 'react-icons/fa';

const StaffSidebar = ({ setActiveComponent }) => {
  const menuItems = [
    { name: 'Staff Home', icon: <FaHome />, component: 'Staff Home' },
    { name: 'Set Attendance', icon: <FaCalendarCheck />, component: 'Set Attendance' },
    { name: 'View Assigned Appointments', icon: <FaTasks />, component: 'View Assigned Appointments' },
    { name: 'View Services', icon: <FaList />, component: 'View Services' },
  ];

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-20 font-poppins hidden lg:block">
      <div className="p-6">
        <h2 className="text-2xl font-extrabold text-pink-700">Staff Dashboard</h2>
      </div>
      <nav className="mt-4">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-pink-100 hover:text-pink-500 transition duration-200 rounded-lg"
            onClick={() => setActiveComponent(item.component)}
          >
            <span className="mr-3 text-pink-500">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default StaffSidebar;