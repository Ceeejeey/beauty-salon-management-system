import React from "react";
import { FaBars, FaBell, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminNavbar = ({
  setIsSidebarOpen,
  isSidebarOpen,
  setActiveComponent,
}) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-lg z-30 font-poppins py-4 sm:py-5">
      <div className="flex justify-between items-center px-6 sm:px-10">
        <div className="flex items-center">
          <FaBars
            className="text-pink-500 text-xl cursor-pointer lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <h1 className="ml-4 text-xl sm:text-2xl font-bold text-pink-700">
            Salon Admin
          </h1>
        </div>
        <div className="flex items-center space-x-6 hover:bg-pink-50 rounded-2xl w-1xs h-full px-4 py-2">
          <button
            className="flex items-center gap-2 text-pink-500 hover:text-pink-600 transition cursor-pointer"
            onClick={() => navigate("/signin")}
          >
             <FaSignOutAlt className="text-xl" />
            <span>Sign Out</span>
           
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
