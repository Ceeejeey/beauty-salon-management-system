import React, { useState, useRef, useEffect } from "react";
import {
  FaBars,
  FaBell,
  FaUser,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { jwtDecode } from "jwt-decode";

const Navbar = ({ isSidebarOpen, setIsSidebarOpen, setActiveComponent }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const decoded = jwtDecode(token);
        const response = await axios.get(
          `/api/notifications/${decoded.user_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications(response.data.notifications);
        setNotificationCount(
          response.data.notifications.filter((n) => !n.is_read).length
        );
      } catch (error) {
        console.error("Fetch notifications error:", error);
      }
    };
    fetchNotifications();
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark notification as read
  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `/api/notifications/${notification.notification_id}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === notification.notification_id
              ? { ...n, is_read: true }
              : n
          )
        );
        setNotificationCount((prev) => prev - 1);
      } catch (error) {
        console.error("Mark notification read error:", error);
      }
    }
  };

  const profileItems = [
    { name: "Profile", component: "Profile", icon: <FaUserCircle /> },
    {
      name: "Logout",
      component: null,
      icon: <FaSignOutAlt />,
      path: "/signin",
    },
  ];

  const handleProfileClick = (item) => {
    if (item.component) {
      setActiveComponent(item.component);
    } else if (item.path) {
      localStorage.removeItem("token");
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
          <div className="relative" ref={notificationsRef}>
            <button
              className="text-pink-700 hover:text-pink-500 focus:outline-none transition duration-200 relative"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false); // Close profile dropdown if open
              }}
            >
              <FaBell className="w-8 h-8 cursor-pointer" />
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-sm">
                  {notificationCount}
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden transition-all duration-300">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-5 py-6 text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 mb-2 text-pink-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405M19 13V8a7 7 0 00-14 0v5l-1.405 1.405A1 1 0 005 17h14z"
                      />
                    </svg>
                    <p className="font-medium">No notifications</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto divide-y divide-pink-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.notification_id}
                        className={`px-5 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition duration-300 ease-in-out cursor-pointer ${
                          notification.is_read ? "opacity-70" : "font-semibold"
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <p>{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString(
                            "en-US",
                            {
                              dateStyle: "short",
                              timeStyle: "short",
                            }
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="relative" ref={profileRef}>
            <button
              className="text-pink-700 hover:text-pink-500 focus:outline-none transition duration-200"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false); // Close notifications dropdown if open
              }}
            >
              <FaUser className="w-8 h-8 cursor-pointer" />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden transition-all duration-300">
                {profileItems.map((item) => (
                  <button
                    key={item.name}
                    className="flex items-center w-full px-5 py-3 text-gray-700 hover:bg-pink-100 hover:text-pink-500 rounded-3xl font-semibold transition duration-300 ease-in-out transform hover:scale-105"
                    onClick={() => handleProfileClick(item)}
                  >
                    <span className="mr-3 text-xl text-pink-500">
                      {item.icon}
                    </span>
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
