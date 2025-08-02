import React, { useState, useEffect } from 'react';
import { FaBookmark, FaBookOpen, FaBookReader, FaCalendarAlt, FaRegBookmark, FaUserAlt } from 'react-icons/fa';
import Sidebar from '../../components/customer/Sidebar';
import Navbar from '../../components/customer/Navbar';
import BookAppointment from '../../components/customer/Appoinments';
import CloseAppointment from '../../components/customer/CloseAppointment';
import AppointmentHistory from '../../components/customer/AppointmentHistory';
import Services from '../../components/customer/Services';
import Promotions from '../../components/customer/Promotions';
import axios from '../../api/axios';

// Placeholder components for each section
const DashboardHome = ({ setActiveComponent }) => (
  <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
    <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-4">
      Welcome to Your Beauty Dashboard
    </h2>
    <p className="text-gray-700 text-lg mb-8">
      Manage your appointments, discover luxurious services, and unlock special promotions curated just for you.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
        <h3 className="text-2xl font-semibold text-pink-700 mb-3">Upcoming Appointment</h3>
        <p className="text-gray-600">
          ✨ Hair Styling - <span className="font-medium text-pink-500">July 20, 2025</span> at{' '}
          <span className="font-medium text-pink-500">2:00 PM</span>
        </p>
        <button
          className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
          onClick={() => setActiveComponent('Book Appointment')}
        >
          Book Another
        </button>
      </div>
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
        <h3 className="text-2xl font-semibold text-pink-700 mb-3">Latest Exclusive Offer</h3>
        <p className="text-gray-600">
          🎁 <span className="font-medium text-pink-500">20% OFF</span> on all Spa Treatments this month! Don’t miss your pampering session.
        </p>
        <button
          className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
          onClick={() => setActiveComponent('Promotions and Offers')}
        >
          View Promotions
        </button>
      </div>
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
        <h3 className="text-2xl font-semibold text-pink-700 mb-3">Recent Visit</h3>
        <p className="text-gray-600">
          ✨ Manicure - <span className="font-medium text-pink-500">July 10, 2025</span>
        </p>
        <button
          className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
          onClick={() => setActiveComponent('Appointment History')}
        >
          View History
        </button>
      </div>
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
        <h3 className="text-2xl font-semibold text-pink-700 mb-3">Explore Services</h3>
        <p className="text-gray-600">
          Discover our premium beauty treatments tailored to your needs.
        </p>
        <button
          className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
          onClick={() => setActiveComponent('Explore Services')}
        >
          Browse Services
        </button>
      </div>
    </div>
  </div>
);

const Profile = ({ setActiveComponent }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const userData = {
          name: response.data.user.name,
          email: response.data.user.email,
          phone: response.data.user.phone || '',
        };
        setFormData(userData);
        setOriginalData(userData);
        setSuccess(response.data.message);
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Failed to fetch profile';
        setError(errorMsg);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    };
    fetchProfile();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    // Client-side validation
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return;
    }
    if (formData.phone && !/^\+?\d{10,15}$/.test(formData.phone)) {
      setError('Invalid phone number format');
      return;
    }

    try {
      const response = await axios.put('/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccess(response.data.message);
      setFormData({
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone || '',
      });
      setOriginalData({
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone || '',
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile';
      setError(errorMsg);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
          .form-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .form-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .form-scroll::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .form-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaUserAlt className="mr-3 text-pink-500" /> Profile
      </h2>
      <p className="text-gray-700 text-lg mb-8">Manage your personal information.</p>
      <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 mb-8 hover:shadow-2xl transition duration-300">
        {success && <div className="text-green-500 mb-4">{success}</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
              placeholder="Enter your phone number (e.g., +9477567890)"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              className="w-full sm:w-auto bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              onClick={() => setActiveComponent('Change Password')}
            >
              Change Password
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Update Profile
            </button>
            <button
              type="button"
              className="w-full sm:w-auto bg-white text-pink-700 px-6 py-3 rounded-xl font-semibold border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition duration-300 ease-in-out transform hover:scale-105"
              onClick={() => setFormData(originalData)}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChangePassword = ({ setActiveComponent }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    // Client-side validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(formData.newPassword)) {
      setError('New password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
      return;
    }

    try {
      const response = await axios.put('/api/users/password', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccess(response.data.message);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update password';
      setError(errorMsg);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
          .form-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .form-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .form-scroll::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .form-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaUserAlt className="mr-3 text-pink-500" /> Change Password
      </h2>
      <p className="text-gray-700 text-lg mb-8">Update your account password securely.</p>
      <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 mb-8 hover:shadow-2xl transition duration-300">
        {success && <div className="text-green-500 mb-4">{success}</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
              placeholder="Enter current password"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
              placeholder="Confirm new password"
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="w-full sm:w-auto bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Update Password
            </button>
            <button
              type="button"
              className="w-full sm:w-auto bg-white text-pink-700 px-6 py-3 rounded-xl font-semibold border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition duration-300 ease-in-out transform hover:scale-105"
              onClick={() => setActiveComponent('Profile')}
            >
              Back to Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Settings = () => (
  <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
    <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6">Settings</h2>
    <p className="text-gray-700 text-lg mb-8">Adjust your account settings.</p>
    {/* Add settings form here */}
  </div>
);

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeComponent, setActiveComponent] = useState('Dashboard');

  // Debugging logs
  useEffect(() => {
    console.log('Dashboard: isSidebarOpen:', isSidebarOpen, 'activeComponent:', activeComponent);
  }, [isSidebarOpen, activeComponent]);

  // Update sidebar visibility on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mapping of sidebar item names to components
  const componentMap = {
    Dashboard: () => <DashboardHome setActiveComponent={setActiveComponent} />,
    'Book Appointment': () => <BookAppointment setActiveComponent={setActiveComponent} />,
    'Close Appointment': () => <CloseAppointment />,
    'Appointment History': () => <AppointmentHistory />,
    'Explore Services': () => <Services setActiveComponent={setActiveComponent} />,
    'Promotions and Offers': () => <Promotions setActiveComponent={setActiveComponent} />,
    Profile: () => <Profile setActiveComponent={setActiveComponent} />,
    'Change Password': () => <ChangePassword setActiveComponent={setActiveComponent} />,
    Settings: () => <Settings />,
  };

  const ActiveComponent = componentMap[activeComponent] || DashboardHome;

  return (
    <div className="w-screen h-screen flex flex-col font-poppins overflow-hidden">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
          .font-poppins {
            font-family: 'Poppins', sans-serif;
          }
          .sidebar-transition {
            transition: transform 0.3s ease-in-out;
          }
          .dropdown-transition {
            transition: all 0.2s ease-in-out;
          }
        `}
      </style>

      {/* Navbar */}
      <Navbar setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} setActiveComponent={setActiveComponent} />

      <div className="flex flex-1 mt-[4.5rem] sm:mt-[5rem]">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-5"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        {/* Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} setActiveComponent={setActiveComponent} />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-5rem)]">
          <div className="scrollable-main h-full overflow-y-auto">
            <ActiveComponent setActiveComponent={setActiveComponent} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;