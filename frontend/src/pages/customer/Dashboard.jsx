import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaCalendarCheck, 
  FaClock, 
  FaGift, 
  FaSpa, 
  FaChartLine,
  FaHistory,
  FaExclamationCircle
} from 'react-icons/fa';
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
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';





// Settings component placeholder
const Settings = () => (
  <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
    <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6">Settings</h2>
    <p className="text-gray-700">Settings functionality coming soon...</p>
  </div>
);

// Dashboard Home Component with Real Data
const DashboardHome = ({ setActiveComponent }) => {
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: [],
    recentAppointments: [],
    activePromotions: [],
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    userName: '',
    loading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view dashboard');
        return;
      }

      const decoded = jwtDecode(token);
      const customerId = decoded.user_id;

      // Fetch all data in parallel
      const [appointmentsRes, pendingRes, promotionsRes, profileRes] = await Promise.all([
        axios.get(`/api/appointments/get-appointment/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/appointments/get-appointment-by-customer-id/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/promotions/active-promotions'),
        axios.get('/api/customers/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const allAppointments = appointmentsRes.data.appointments || [];
      const pendingAppointments = pendingRes.data.appointments || [];
      
      // Filter upcoming (approved) and completed appointments
      const completed = allAppointments.filter(apt => apt.status === 'Completed');
      const approved = allAppointments.filter(apt => apt.status === 'Approved');
      
      // Sort by date (most recent first)
      const sortedRecent = [...completed].sort((a, b) => 
        new Date(b.appointment_date) - new Date(a.appointment_date)
      ).slice(0, 1); // Get most recent

      // Get upcoming approved appointments
      const sortedUpcoming = [...approved, ...pendingAppointments].sort((a, b) => 
        new Date(a.appointment_date) - new Date(b.appointment_date)
      ).slice(0, 2); // Get next 2 upcoming

      setDashboardData({
        upcomingAppointments: sortedUpcoming,
        recentAppointments: sortedRecent,
        activePromotions: promotionsRes.data.promotions?.slice(0, 1) || [],
        totalAppointments: allAppointments.length,
        pendingAppointments: pendingAppointments.length,
        completedAppointments: completed.length,
        userName: profileRes.data.user?.name || 'Guest',
        loading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white min-h-screen">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-2">
          Welcome back, {dashboardData.userName}! 👋
        </h2>
        <p className="text-gray-700 text-lg">
          Here's what's happening with your beauty journey today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Appointments</p>
              <p className="text-3xl font-bold text-pink-700 mt-1">{dashboardData.totalAppointments}</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full">
              <FaCalendarAlt className="text-pink-500 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{dashboardData.pendingAppointments}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaClock className="text-blue-500 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{dashboardData.completedAppointments}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCalendarCheck className="text-green-500 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Offers</p>
              <p className="text-3xl font-bold text-purple-700 mt-1">{dashboardData.activePromotions.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaGift className="text-purple-500 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-pink-700 flex items-center">
              <FaCalendarAlt className="mr-2" /> Upcoming Appointments
            </h3>
          </div>
          
          {dashboardData.upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <FaExclamationCircle className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No upcoming appointments</p>
              <button
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
                onClick={() => setActiveComponent('Book Appointment')}
              >
                Book Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.upcomingAppointments.map((apt) => (
                <div key={apt.appointment_id} className="border border-pink-100 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg text-pink-700">{apt.service_name}</h4>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    📅 {formatDate(apt.appointment_date)}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    🕐 {formatTime(apt.appointment_time)}
                  </p>
                  {apt.staff_name && (
                    <p className="text-gray-600 text-sm">
                      👤 Staff: {apt.staff_name}
                    </p>
                  )}
                  {apt.notes && (
                    <p className="text-gray-500 text-sm mt-2 italic">Note: {apt.notes}</p>
                  )}
                </div>
              ))}
              <button
                className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins mt-2"
                onClick={() => setActiveComponent('Book Appointment')}
              >
                Book Another
              </button>
            </div>
          )}
        </div>

        {/* Latest Promotion */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4 flex items-center">
            <FaGift className="mr-2" /> Latest Exclusive Offer
          </h3>
          
          {dashboardData.activePromotions.length === 0 ? (
            <div className="text-center py-8">
              <FaGift className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No active promotions at the moment</p>
              <button
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
                onClick={() => setActiveComponent('Explore Services')}
              >
                Browse Services
              </button>
            </div>
          ) : (
            dashboardData.activePromotions.map((promo) => (
              <div key={promo.promo_id}>
                <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                  <img
                    src={promo.image || 'https://placehold.co/400x200/ec4899/ffffff?text=Special+Offer'}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = 'https://placehold.co/400x200/ec4899/ffffff?text=Special+Offer')}
                  />
                </div>
                <h4 className="font-semibold text-xl text-pink-700 mb-2">{promo.title}</h4>
                <p className="text-gray-600 mb-3">{promo.description}</p>
                <div className="bg-pink-50 p-3 rounded-lg mb-3">
                  <p className="text-sm text-gray-700">
                    Code: <span className="font-bold text-pink-600">{promo.code}</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    Discount: <span className="font-bold text-pink-600">
                      {promo.discount_type === 'percentage' ? `${promo.value}% OFF` : `LKR ${promo.value} OFF`}
                    </span>
                  </p>
                </div>
                <button
                  className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
                  onClick={() => setActiveComponent('Promotions and Offers')}
                >
                  View All Promotions
                </button>
              </div>
            ))
          )}
        </div>

        {/* Recent Visit */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4 flex items-center">
            <FaHistory className="mr-2" /> Recent Visit
          </h3>
          
          {dashboardData.recentAppointments.length === 0 ? (
            <div className="text-center py-8">
              <FaHistory className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No completed appointments yet</p>
              <button
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
                onClick={() => setActiveComponent('Book Appointment')}
              >
                Book Your First Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.recentAppointments.map((apt) => (
                <div key={apt.appointment_id} className="border border-green-100 rounded-xl p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg text-green-700">{apt.service_name}</h4>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    📅 {formatDate(apt.appointment_date)}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    🕐 {formatTime(apt.appointment_time)}
                  </p>
                  {apt.staff_name && (
                    <p className="text-gray-600 text-sm">
                      👤 Staff: {apt.staff_name}
                    </p>
                  )}
                </div>
              ))}
              <button
                className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
                onClick={() => setActiveComponent('Appointment History')}
              >
                View Full History
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4 flex items-center">
            <FaSpa className="mr-2" /> Quick Actions
          </h3>
          
          <div className="space-y-3">
            <button
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-pink-700 transition font-poppins flex items-center justify-center shadow-md"
              onClick={() => setActiveComponent('Explore Services')}
            >
              <FaSpa className="mr-2" /> Explore Services
            </button>
            
            <button
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition font-poppins flex items-center justify-center shadow-md"
              onClick={() => setActiveComponent('Book Appointment')}
            >
              <FaCalendarAlt className="mr-2" /> Book Appointment
            </button>
            
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-poppins flex items-center justify-center shadow-md"
              onClick={() => setActiveComponent('Close Appointment')}
            >
              <FaClock className="mr-2" /> Manage Appointments
            </button>
            
            <button
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition font-poppins flex items-center justify-center shadow-md"
              onClick={() => setActiveComponent('Feedback')}
            >
              <FaChartLine className="mr-2" /> Give Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    'Close Appointment': () => <CloseAppointment setActiveComponent={setActiveComponent}/>,
    'Appointment History': () => <AppointmentHistory setActiveComponent={setActiveComponent} />,
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