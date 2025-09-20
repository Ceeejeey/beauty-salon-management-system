import React, { useState, useRef, useEffect } from 'react';
import { FaSignOutAlt, FaBell } from 'react-icons/fa';
import StaffSidebar from './Sidebar';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';

const StaffNavbar = ({ staffName, setActiveComponent }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationsRef = useRef(null);

  // Fetch notifications
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    } catch (error) {
      console.error('Sign out error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/signin';
    setIsSidebarOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-[5rem] bg-white shadow-md z-30 font-poppins px-6 sm:px-10 flex items-center justify-between">
      {/* Left: Sidebar toggle + title */}
      <div className="flex items-center">
        <button
          className="lg:hidden text-pink-600 text-3xl focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-md p-1"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          ☰
        </button>
        <h1 className="ml-4 text-2xl font-bold text-pink-700 tracking-wide">Staff Dashboard</h1>
      </div>

              {/* Greeting */}
        <span className="text-gray-700 text-lg font-medium hidden sm:inline">
          Welcome, {staffName}
        </span>


      {/* Right: Notifications + greeting + sign out */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            className="relative text-pink-600 hover:text-pink-700 focus:outline-none cursor-pointer"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <FaBell className="text-2xl sm:text-3xl" />
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm">
                {notificationCount}
              </span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
              {notifications.length === 0 ? (
                <div className="flex items-center justify-center px-5 py-6 text-gray-500">
                  <p className="font-medium">No notifications</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto divide-y divide-pink-100">
                  {notifications.map(notification => (
                    <div
                      key={notification.notification_id}
                      className={`px-6 py-4 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition duration-200 cursor-pointer ${
                        notification.is_read ? 'opacity-70' : 'font-semibold'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <p>{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString('en-US', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>


        {/* Sign Out */}
        <button
          className="flex items-center px-4 py-2 rounded-lg text-pink-600 hover:bg-pink-50 transition focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
          onClick={handleSignOut}
        >
          <FaSignOutAlt className="mr-2" />
          <span className="hidden sm:inline font-medium">Sign Out</span>
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-40 z-20"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          <div
            className="lg:hidden fixed top-[5rem] left-0 w-64 bg-white shadow-2xl z-30 transition-transform duration-300 ease-in-out"
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
