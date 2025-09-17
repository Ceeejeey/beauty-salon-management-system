import React, { useState } from 'react';
import {
  FaHome,
  FaCut,
  FaCalendarAlt,
  FaUsers,
  FaDollarSign,
  FaGift,
  FaTimes,
  FaFileInvoice,
  FaComments,
} from 'react-icons/fa';

const AdminSidebar = ({ isSidebarOpen, setIsSidebarOpen, setActiveComponent }) => {
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);

  const navItems = [
    { name: 'Admin Home', icon: <FaHome className="mr-3 text-pink-500" />, action: () => setActiveComponent('Admin Home') },
    {
      name: 'Services',
      icon: <FaCut className="mr-3 text-pink-500" />,
      subItems: [
        { name: 'Add/Edit Services', action: () => setActiveComponent('Add/Edit Services') },
      ],
    },
    {
      name: 'Appointments',
      icon: <FaCalendarAlt className="mr-3 text-pink-500" />,
      subItems: [
        { name: 'View Appointment and Assign Staff', action: () => setActiveComponent('View Appointment and Assign Staff') },
        { name: 'Block time slots', action: () => setActiveComponent('Block time slots') },
        { name: 'View Completed Appointments', action: () => setActiveComponent('View Completed Appointments') },
      ],
    },
    { name: 'Manage Staff', icon: <FaUsers className="mr-3 text-pink-500" />, action: () => setActiveComponent('Manage Staff') },
    { name: 'Track Expenses', icon: <FaDollarSign className="mr-3 text-pink-500" />, action: () => setActiveComponent('Track Expenses') },
    { name: 'Edit and Make Promotions', icon: <FaGift className="mr-3 text-pink-500" />, action: () => setActiveComponent('Edit and Make Promotions') },
    { name: 'Generate Invoice', icon: <FaFileInvoice className="mr-3 text-pink-500" />, action: () => setActiveComponent('Generate Invoice') },
    { name: 'Admin Feedbacks', icon: <FaComments className="mr-3 text-pink-500" />, action: () => setActiveComponent('Admin Feedbacks') },
  ];

  return (
    <div
      className={`fixed left-0 h-[calc(100vh-5rem)] w-64 bg-gradient-to-b from-pink-50 to-white shadow-xl z-20 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
    >
      <div className="p-6">
        {/* Mobile Close Header */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h2 className="text-xl font-bold text-pink-700">Admin Menu</h2>
          <FaTimes
            className="text-pink-500 cursor-pointer hover:text-pink-700 transition"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Menu Items */}
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <li key={index}>
              {item.subItems ? (
                <div>
                  <button
                    className="flex items-center p-3 text-gray-700 hover:text-pink-600 hover:bg-pink-100 w-full text-left rounded-lg transition duration-200 border border-pink-100"
                    onClick={() => {
                      if (item.name === 'Services') setIsServicesOpen(!isServicesOpen);
                      if (item.name === 'Appointments') setIsAppointmentsOpen(!isAppointmentsOpen);
                    }}
                  >
                    {item.icon}
                    <span className="flex-1 font-medium">{item.name}</span>
                    <span
                      className={`transform transition-transform duration-200 ${
                        (item.name === 'Services' && isServicesOpen) ||
                        (item.name === 'Appointments' && isAppointmentsOpen)
                          ? 'rotate-180'
                          : 'rotate-0'
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {/* Sub Menu */}
                  <ul
                    className={`pl-4 mt-2 overflow-hidden transition-all duration-300 ease-in-out space-y-2 ${
                      (item.name === 'Services' && isServicesOpen) ||
                      (item.name === 'Appointments' && isAppointmentsOpen)
                        ? 'max-h-40'
                        : 'max-h-0'
                    }`}
                  >
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <button
                          className="block w-full text-left pl-10 py-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition duration-200 border border-pink-100"
                          onClick={subItem.action}
                        >
                          {subItem.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <button
                  className="flex items-center p-3 text-gray-700 hover:text-pink-600 hover:bg-pink-100 w-full text-left rounded-lg transition duration-200 border border-pink-100"
                  onClick={item.action}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;
