import React, { useState, useRef, useEffect } from 'react';
import { FaUserAlt, FaSignOutAlt, FaBell } from 'react-icons/fa';
import StaffSidebar from './Sidebar';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';

const StaffNavbar = ({ staffName, setActiveComponent }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationsRef = useRef(null);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = jwtDecode(token);
        const response = await axios.get(`/api/notifications/${decoded.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data.notifications);
        setNotificationCount(response.data.notifications.filter(n => !n.is_read).length);
      } catch (error) {
        console.error('Fetch notifications error:', error);
      }
    };
    fetchNotifications();
  }, []);

  // Handle click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark notification as read
  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`/api/notifications/${notification.notification_id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setNotifications(prev =>
          prev.map(n =>
            n.notification_id === notification.notification_id ? { ...n, is_read: true } : n
          )
        );
        setNotificationCount(prev => prev - 1);
      } catch (error) {
        console.error('Mark notification read error:', error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await axios.post('/api/auth/signout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
      setIsSidebarOpen(false);
    }
  };

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
        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationsRef}>
            <button
              className="text-pink-500 hover:text-pink-600 focus:outline-none transition duration-200 relative"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-label="Notifications"
            >
              <FaBell className="text-xl" />
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-sm">
                  {notificationCount}
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden transition-all duration-300">
                {notifications.length === 0 ? (
                  <div className="px-5 py-3 text-gray-700 font-semibold">No notifications</div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.notification_id}
                      className={`px-5 py-3 text-gray-700 hover:bg-pink-100 hover:text-pink-500 rounded-3xl transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                        notification.is_read ? 'opacity-70' : 'font-semibold'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <p>{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString('en-US', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="flex items-center">
            <FaUserAlt className="mr-2 text-pink-500" />
            <span className="text-gray-700 hidden sm:inline">Welcome, {staffName}</span>
          </div>
          <button
            className="flex items-center text-pink-500 hover:text-pink-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded"
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <FaSignOutAlt className="mr-1" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
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
              handleSignOut={handleSignOut}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default StaffNavbar;