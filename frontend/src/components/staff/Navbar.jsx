import React, { useState } from 'react';
import StaffSidebar from './Sidebar';

const StaffNavbar = ({ staffName, setActiveComponent }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 h-[4.5rem] sm:h-[5rem] bg-white shadow-lg z-30 font-poppins">
      <div className="flex items-center justify-between px-6 sm:px-10 h-full">
        <div className="flex items-center">
          <button
            className="lg:hidden text-pink-500 text-2xl"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-pink-700 ml-4">Staff Dashboard</h1>
        </div>
        <div className="text-gray-700">Welcome, {staffName}</div>
      </div>
      {isSidebarOpen && (
        <div className="lg:hidden fixed top-[4.5rem] sm:top-[5rem] left-0 w-64 bg-white shadow-2xl z-20">
          <StaffSidebar setActiveComponent={(comp) => {
            setIsSidebarOpen(false);
            setActiveComponent(comp);
          }} />
        </div>
      )}
    </div>
  );
};

export default StaffNavbar;