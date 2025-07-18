import React, { useState, useRef, useEffect } from 'react';
import { FaBars, FaBell, FaUser, FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isSidebarOpen, setIsSidebarOpen, setActiveComponent }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileItems = [
    { name: 'Profile', component: 'Profile', icon: <FaUserCircle /> },
    { name: 'Settings', component: 'Settings', icon: <FaCog /> },
    { name: 'Logout', component: null, icon: <FaSignOutAlt />, path: '/signin' },
  ];

  const handleProfileClick = (item) => {
    if (item.component) {
      setActiveComponent(item.component);
    } else if (item.path) {
      navigate(item.path);
    }
    setIsProfileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-br from-pink-50 to-white shadow-xl z-30 font-poppins">
      <div className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center">
          <button
            className="lg:hidden text-pink-700 hover:text-pink-500 focus:outline-none transition duration-200"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FaBars className="w-8 h-8" />
          </button>
          <h1 className="ml-4 text-2xl sm:text-3xl font-bold text-pink-700 select-none tracking-tight">
            Salon Elegance
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <button className=" hover:text-pink-500 focus:outline-none transition duration-200 relative">
              <FaBell className="w-8 h-8" />
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-sm">
                3
              </span>
            </button>
          </div>
          <div className="relative" ref={profileRef}>
            <button
              className=" hover:text-pink-500 focus:outline-none transition duration-200"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <FaUser className="w-8 h-8" />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden transition-all duration-300">
                {profileItems.map((item) => (
                  <button
                    key={item.name}
                    className="flex items-center w-full px-5 py-3 text-gray-700 hover:bg-pink-100 hover:text-pink-500 rounded-3xl font-semibold transition duration-300 ease-in-out transform hover:scale-105"
                    onClick={() => handleProfileClick(item)}
                  >
                    <span className="mr-3 text-xl text-pink-500">{item.icon}</span>
                    <span className="flex-grow">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;