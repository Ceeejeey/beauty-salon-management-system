import React, { useState, useEffect } from "react";
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaClock,
  FaClipboardList,
  FaSpa,
  FaUserCheck,
  FaChartLine,
  FaExclamationCircle
} from "react-icons/fa";
import axios from "../../api/axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";

const StaffHome = ({ staff }) => {
  const [dashboardData, setDashboardData] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    upcomingAppointments: [],
    recentCompleted: [],
    services: [],
    staffName: staff?.name || 'Staff',
    loading: true
  });

  const fetchStaffDashboardData = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view dashboard');
        return;
      }

      const decoded = jwtDecode(token);
      const staffId = decoded.user_id;

      // Fetch appointments and services in parallel
      const [appointmentsRes, servicesRes] = await Promise.all([
        axios.get(`/api/appointments/staff/${staffId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/services/get-services', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const appointments = appointmentsRes.data.appointments || [];
      
      // Get today's date
      const today = new Date().toLocaleDateString('en-CA');
      
      // Filter today's appointments
      const todayApts = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date).toLocaleDateString('en-CA');
        return aptDate === today && apt.status === 'Approved';
      });

      // Filter upcoming appointments (approved, not today)
      const upcoming = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        const aptDateStr = aptDate.toLocaleDateString('en-CA');
        return aptDateStr >= today && apt.status === 'Approved';
      }).sort((a, b) => 
        new Date(a.appointment_date) - new Date(b.appointment_date)
      ).slice(0, 5);

      // Get completed appointments (most recent first)
      const completed = appointments.filter(apt => apt.status === 'Completed')
        .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
        .slice(0, 5);

      // Calculate completed count
      const completedCount = appointments.filter(apt => apt.status === 'Completed').length;

      setDashboardData({
        totalAppointments: appointments.length,
        todayAppointments: todayApts.length,
        completedAppointments: completedCount,
        upcomingAppointments: upcoming,
        recentCompleted: completed,
        services: servicesRes.data.services?.slice(0, 3) || [],
        staffName: staff?.name || decoded.name || 'Staff',
        loading: false
      });
    } catch (error) {
      console.error('Error fetching staff dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  }, [staff]);

  useEffect(() => {
    fetchStaffDashboardData();
  }, [fetchStaffDashboardData]);

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
          Welcome, {dashboardData.staffName}! 👋
        </h2>
        <p className="text-gray-700 text-lg">
          Here's your schedule and performance overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Appointments */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">My Appointments</p>
              <p className="text-3xl font-bold text-pink-700 mt-1">{dashboardData.totalAppointments}</p>
              <p className="text-xs text-gray-500 mt-1">Total assigned</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full">
              <FaCalendarAlt className="text-pink-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Today's Schedule</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{dashboardData.todayAppointments}</p>
              <p className="text-xs text-gray-500 mt-1">Appointments today</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaClock className="text-blue-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{dashboardData.completedAppointments}</p>
              <p className="text-xs text-gray-500 mt-1">Services done</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCheckCircle className="text-green-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Completion Rate</p>
              <p className="text-3xl font-bold mt-1">
                {dashboardData.totalAppointments > 0 
                  ? Math.round((dashboardData.completedAppointments / dashboardData.totalAppointments) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-purple-100 mt-1">Overall performance</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FaChartLine className="text-white text-2xl" />
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
              <FaClipboardList className="mr-2" /> Upcoming Appointments
            </h3>
          </div>
          
          {dashboardData.upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <FaExclamationCircle className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No upcoming appointments</p>
              <p className="text-sm text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {dashboardData.upcomingAppointments.map((apt) => (
                <div key={apt.appointment_id} className="border border-blue-100 rounded-xl p-4 bg-blue-50 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-blue-700">{apt.service_name}</h4>
                      <p className="text-sm text-gray-600">Customer: {apt.customer_name}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">📅 {formatDate(apt.appointment_date)}</p>
                  <p className="text-sm text-gray-600">🕐 {formatTime(apt.appointment_time)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-pink-700 flex items-center">
              <FaClock className="mr-2" /> Today's Schedule
            </h3>
            <span className="text-sm text-pink-600 font-medium">{dashboardData.todayAppointments} appointments</span>
          </div>
          
          {dashboardData.todayAppointments === 0 ? (
            <div className="text-center py-8">
              <FaUserCheck className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No appointments today</p>
              <p className="text-sm text-gray-500">Enjoy your day!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.upcomingAppointments
                .filter(apt => {
                  const aptDate = new Date(apt.appointment_date).toLocaleDateString('en-CA');
                  const today = new Date().toLocaleDateString('en-CA');
                  return aptDate === today;
                })
                .map((apt) => (
                  <div key={apt.appointment_id} className="border border-yellow-100 rounded-xl p-4 bg-yellow-50 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-yellow-700">{apt.service_name}</h4>
                        <p className="text-sm text-gray-600">Customer: {apt.customer_name}</p>
                      </div>
                      <span className="text-sm font-bold text-yellow-700">{formatTime(apt.appointment_time)}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent Completed Appointments */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4 flex items-center">
            <FaCheckCircle className="mr-2" /> Recent Completed
          </h3>
          
          {dashboardData.recentCompleted.length === 0 ? (
            <div className="text-center py-8">
              <FaCheckCircle className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-gray-600">No completed appointments yet</p>
              <p className="text-sm text-gray-500 mt-2">Complete appointments to see them here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboardData.recentCompleted.map((apt) => (
                <div key={apt.appointment_id} className="border border-green-100 rounded-xl p-4 bg-green-50 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-green-700">{apt.service_name}</h4>
                      <p className="text-sm text-gray-600">Customer: {apt.customer_name}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">📅 {formatDate(apt.appointment_date)}</p>
                  <p className="text-sm text-gray-600">🕐 {formatTime(apt.appointment_time)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4 flex items-center">
            <FaChartLine className="mr-2" /> Performance Summary
          </h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-pink-500 pl-4 py-2">
              <p className="text-sm text-gray-600">Total Assigned</p>
              <p className="text-2xl font-bold text-gray-800">{dashboardData.totalAppointments}</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-sm text-gray-600">Successfully Completed</p>
              <p className="text-2xl font-bold text-gray-800">{dashboardData.completedAppointments}</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-sm text-gray-600">Today's Workload</p>
              <p className="text-2xl font-bold text-gray-800">{dashboardData.todayAppointments}</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {dashboardData.totalAppointments > 0 
                  ? Math.round((dashboardData.completedAppointments / dashboardData.totalAppointments) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffHome;
