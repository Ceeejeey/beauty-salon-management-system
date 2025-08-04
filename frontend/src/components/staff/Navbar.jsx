import React, { useState } from 'react';
import { FaUserAlt } from 'react-icons/fa';
import StaffSidebar from './Sidebar';

const StaffNavbar = ({ staffName, setActiveComponent }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 h-[4.5rem] sm:h-[5rem] bg-white shadow-lg z-30 font-poppins">
      <style>
        {`
          .sidebar-transition {
            transition: transform 0.3s ease-in-out;
          }
        `}
      </style>
      <div className="flex items-center justify-between px-6 sm:px-10 h-full">
        <div className="flex items-center">
          <button
            className="lg:hidden text-pink-500 text-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 rounded"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar"
          >
            ☰
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-pink-700 ml-4">Staff Dashboard</h1>
        </div>
        <div className="flex items-center">
          <FaUserAlt className="mr-2 text-pink-500" />
          <span className="text-gray-700 hidden sm:inline">Welcome, {staffName}</span>
        </div>
      </div>
      {isSidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20 sidebar-transition"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          ></div>
          <div
            className="lg:hidden fixed top-[4.5rem] sm:top-[5rem] left-0 w-64 bg-white shadow-2xl z-30 sidebar-transition transform translate-x-0"
            id="sidebar"
          >
            <StaffSidebar
              setActiveComponent={(comp) => {
                setIsSidebarOpen(false);
                setActiveComponent(comp);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default StaffNavbar;