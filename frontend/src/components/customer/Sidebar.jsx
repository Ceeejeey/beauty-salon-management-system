import React, { useState, useEffect } from 'react';
import { FaHome, FaCalendarAlt, FaConciergeBell, FaGift, FaChevronDown } from 'react-icons/fa';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, setActiveComponent }) => {
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: <FaHome />, component: 'Dashboard' },
    {
      name: 'Appointment',
      icon: <FaCalendarAlt />,
      dropdown: [
        { name: 'Book Appointment', component: 'Book Appointment' },
        { name: 'Close Appointment', component: 'Close Appointment' },
        { name: 'Appointment History', component: 'Appointment History' },
      ],
    },
    { name: 'Explore Services', icon: <FaConciergeBell />, component: 'Explore Services' },
    { name: 'Promotions and Offers', icon: <FaGift />, component: 'Promotions and Offers' },
  ];

  const handleNavClick = (component) => {
    setActiveComponent(component);
    console.log('Sidebar: Nav clicked, component:', component, 'isSidebarOpen:', isSidebarOpen);
  };

  useEffect(() => {
    console.log('Sidebar rendering, isSidebarOpen:', isSidebarOpen, 'isAppointmentOpen:', isAppointmentOpen);
  }, [isSidebarOpen, isAppointmentOpen]);

  return (
    <aside
      className={`fixed top-25 bottom-0 w-64 bg-gradient-to-br from-pink-50 to-white shadow-xl transform lg:transform-none ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 z-20 overflow-y-auto`}
    >
      <style>
        {`
          .sidebar-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
        `}
      </style>
      <div className="p-10 font-poppins sidebar-scroll">
        <nav className="space-y-5">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.dropdown ? (
                <div>
                  <button
                    className={`flex items-center w-full px-4 py-3 text-gray-700 hover:bg-pink-100 hover:text-pink-500 rounded-3xl font-semibold shadow-sm transition duration-300 ease-in-out transform hover:scale-105 ${
                      isAppointmentOpen ? 'bg-pink-100 text-pink-500' : ''
                    }`}
                    onClick={() => setIsAppointmentOpen(!isAppointmentOpen)}
                  >
                    <span className="mr-3 text-xl text-pink-500">{item.icon}</span>
                    <span className="flex-grow">{item.name}</span>
                    <FaChevronDown
                      className={`ml-2 transform transition-transform duration-200 ${
                        isAppointmentOpen ? 'rotate-180' : ''
                      } text-pink-500`}
                    />
                  </button>
                  {isAppointmentOpen && (
                    <div className="ml-6 mt-2 space-y-2">
                      {item.dropdown.map((subItem) => (
                        <button
                          key={subItem.name}
                          className="block w-full text-left px-4 py-2 text-base text-gray-600 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition duration-150 hover:shadow-sm"
                          onClick={() => handleNavClick(subItem.component)}
                        >
                          {subItem.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-pink-100 hover:text-pink-500 rounded-3xl font-semibold shadow-sm transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={() => handleNavClick(item.component)}
                >
                  <span className="mr-3 text-xl text-pink-500">{item.icon}</span>
                  {item.name}
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;