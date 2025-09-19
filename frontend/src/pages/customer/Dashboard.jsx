import React, { useState, useEffect } from 'react';
import { FaBookmark, FaBookOpen, FaBookReader, FaCalendarAlt, FaLock, FaRegBookmark, FaUserAlt } from 'react-icons/fa';
import Sidebar from '../../components/customer/Sidebar';
import Feedback from '../../components/customer/Feedback';
import Navbar from '../../components/customer/Navbar';
import BookAppointment from '../../components/customer/Appoinments';
import CloseAppointment from '../../components/customer/CloseAppointment';
import AppointmentHistory from '../../components/customer/AppointmentHistory';
import Services from '../../components/customer/Services';
import Promotions from '../../components/customer/Promotions';
import Profile from '../../components/customer/CustomerProfile';
import ChangePassword from '../../components/customer/ChangePassword';



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
    Feedback: () => <Feedback setActiveComponent={setActiveComponent} />,
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