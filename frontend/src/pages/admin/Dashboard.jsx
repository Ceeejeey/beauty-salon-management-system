import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaDollarSign, 
  FaChartLine,
  FaUserFriends,
  FaClock,
  FaCheckCircle,
  FaMoneyBillWave,
  FaReceipt,
  FaUserTie,
  FaCut,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import AdminSidebar from '../../components/admin/Sidebar';
import AdminNavbar from '../../components/admin/Navbar';
import AddEditServices from '../../components/admin/Services';
import ViewAssignAppointments from '../../components/admin/Appointments';
import ManageStaff from '../../components/admin/ManageStaff';
import TrackExpenses from '../../components/admin/TrackExpenses';
import EditPromotions from '../../components/admin/EditPromotions';
import AdminSettings from '../../components/admin/AdminSettings';
import GenerateInvoice from '../../components/admin/GenerateInvoice';
import AdminFeedback from '../../components/admin/AdminFeedbacks';
import BlockSlots from '../../components/admin/BlockSlots';
import AllAppointments from '../../components/admin/AllAppointments';
import CustomerProfiles from '../../components/admin/CustomerProfile';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';


// Admin Profile Placeholder
const AdminProfile = () => (
  <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
    <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6">Admin Profile</h2>
    <p className="text-gray-700">Profile settings coming soon...</p>
  </div>
);

// Comprehensive Admin Dashboard with Real Data
const AdminHome = ({ setActiveComponent }) => {
  const [dashboardData, setDashboardData] = useState({
    // Appointment Stats
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    todayAppointments: 0,
    
    // Revenue Stats
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalExpenses: 0,
    monthlyExpenses: 0,
    netProfit: 0,
    
    // Other Stats
    totalCustomers: 0,
    totalStaff: 0,
    totalServices: 0,
    activePromotions: 0,
    
    // Recent Data
    recentAppointments: [],
    recentInvoices: [],
    pendingList: [],
    
    loading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view admin dashboard');
        return;
      }

      // Fetch all data in parallel
      const [
        appointmentsRes,
        pendingRes,
        customersRes,
        staffRes,
        servicesRes,
        promotionsRes,
        invoicesRes,
        expensesRes
      ] = await Promise.all([
        axios.get('/api/appointments/get-appointments', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/appointments/get-pending-appointments', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/customers/customers', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/staff/get-staff', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/services/get-services', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/promotions/get-promotions', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/invoices/get-invoices', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/expenses/get-expenses', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const appointments = appointmentsRes.data.appointments || [];
      const pending = pendingRes.data.appointments || [];
      const invoices = invoicesRes.data.invoices || [];
      const expenses = expensesRes.data.expenses || [];
      
      // Calculate today's date
      const today = new Date().toLocaleDateString('en-CA');
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // Filter completed appointments
      const completed = appointments.filter(apt => apt.status === 'Completed');
      
      // Today's appointments (pending or approved)
      const todayApts = [...appointments, ...pending].filter(apt => {
        const aptDate = new Date(apt.appointment_date).toLocaleDateString('en-CA');
        return aptDate === today;
      });
      
      // Calculate total revenue
      const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
      
      // Calculate monthly revenue
      const monthlyRevenue = invoices.filter(inv => {
        const invDate = new Date(inv.date_issued);
        return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
      }).reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
      
      // Calculate total expenses
      const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      
      // Calculate monthly expenses
      const monthlyExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      }).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      
      // Calculate net profit
      const netProfit = monthlyRevenue - monthlyExpenses;
      
      // Get active promotions
      const activePromos = promotionsRes.data.promotions?.filter(promo => {
        const startDate = new Date(promo.start_date);
        const endDate = new Date(promo.end_date);
        const now = new Date();
        return startDate <= now && endDate >= now;
      }) || [];
      
      // Sort and get recent data
      const recentApts = [...appointments].sort((a, b) => 
        new Date(b.appointment_date) - new Date(a.appointment_date)
      ).slice(0, 5);
      
      const recentInvs = [...invoices].sort((a, b) => 
        new Date(b.date_issued) - new Date(a.date_issued)
      ).slice(0, 5);
      
      const pendingList = [...pending].sort((a, b) => 
        new Date(a.appointment_date) - new Date(b.appointment_date)
      ).slice(0, 5);

      setDashboardData({
        totalAppointments: appointments.length,
        pendingAppointments: pending.length,
        completedAppointments: completed.length,
        todayAppointments: todayApts.length,
        
        totalRevenue: totalRevenue,
        monthlyRevenue: monthlyRevenue,
        totalExpenses: totalExpenses,
        monthlyExpenses: monthlyExpenses,
        netProfit: netProfit,
        
        totalCustomers: customersRes.data.customers?.length || 0,
        totalStaff: staffRes.data.staff?.length || 0,
        totalServices: servicesRes.data.services?.length || 0,
        activePromotions: activePromos.length,
        
        recentAppointments: recentApts,
        recentInvoices: recentInvs,
        pendingList: pendingList,
        
        loading: false
      });
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
          <p className="text-gray-600 mt-4">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-2">
          Admin Dashboard 📊
        </h2>
        <p className="text-gray-700 text-lg">
          Complete overview of your salon operations and performance
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Appointments */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Appointments</p>
              <p className="text-3xl font-bold text-pink-700 mt-1">{dashboardData.totalAppointments}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full">
              <FaCalendarAlt className="text-pink-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Pending Appointments */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-yellow-100 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-700 mt-1">{dashboardData.pendingAppointments}</p>
              <p className="text-xs text-gray-500 mt-1">Need approval</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaClock className="text-yellow-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Completed Appointments */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{dashboardData.completedAppointments}</p>
              <p className="text-xs text-gray-500 mt-1">Successfully done</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCheckCircle className="text-green-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Today</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{dashboardData.todayAppointments}</p>
              <p className="text-xs text-gray-500 mt-1">Scheduled for today</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaCalendarAlt className="text-blue-500 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Monthly Revenue */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Monthly Revenue</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(dashboardData.monthlyRevenue)}</p>
              <p className="text-xs text-green-100 mt-1">This month</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FaDollarSign className="text-white text-2xl" />
            </div>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Monthly Expenses</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(dashboardData.monthlyExpenses)}</p>
              <p className="text-xs text-red-100 mt-1">This month</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FaMoneyBillWave className="text-white text-2xl" />
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className={`bg-gradient-to-br ${dashboardData.netProfit >= 0 ? 'from-purple-500 to-purple-600' : 'from-orange-500 to-orange-600'} p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-opacity-90 text-sm font-medium">Net Profit</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(dashboardData.netProfit)}</p>
              <div className="flex items-center mt-1">
                {dashboardData.netProfit >= 0 ? (
                  <FaArrowUp className="text-white text-xs mr-1" />
                ) : (
                  <FaArrowDown className="text-white text-xs mr-1" />
                )}
                <p className="text-xs text-white text-opacity-90">This month</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FaChartLine className="text-white text-2xl" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(dashboardData.totalRevenue)}</p>
              <p className="text-xs text-indigo-100 mt-1">All time</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FaReceipt className="text-white text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Business Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Customers */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Customers</p>
              <p className="text-3xl font-bold text-pink-700 mt-1">{dashboardData.totalCustomers}</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full">
              <FaUsers className="text-pink-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Total Staff */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Staff</p>
              <p className="text-3xl font-bold text-purple-700 mt-1">{dashboardData.totalStaff}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaUserTie className="text-purple-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Total Services */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Services</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{dashboardData.totalServices}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaCut className="text-blue-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Active Promotions */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Promotions</p>
              <p className="text-3xl font-bold text-orange-700 mt-1">{dashboardData.activePromotions}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FaChartLine className="text-orange-500 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Appointments */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-pink-700 flex items-center">
              <FaExclamationTriangle className="mr-2 text-yellow-500" /> Pending Appointments
            </h3>
            <button
              className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              onClick={() => setActiveComponent('View Appointment and Assign Staff')}
            >
              View All →
            </button>
          </div>
          
          {dashboardData.pendingList.length === 0 ? (
            <div className="text-center py-8">
              <FaCheckCircle className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-gray-600">No pending appointments</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboardData.pendingList.map((apt) => (
                <div key={apt.appointment_id} className="border border-yellow-100 rounded-xl p-4 bg-yellow-50 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{apt.service_name}</h4>
                      <p className="text-sm text-gray-600">Customer: {apt.customer_name}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>📅 {formatDate(apt.appointment_date)} at {formatTime(apt.appointment_time)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Appointments */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-pink-700 flex items-center">
              <FaCalendarAlt className="mr-2" /> Recent Appointments
            </h3>
            <button
              className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              onClick={() => setActiveComponent('View Completed Appointments')}
            >
              View All →
            </button>
          </div>
          
          {dashboardData.recentAppointments.length === 0 ? (
            <div className="text-center py-8">
              <FaCalendarAlt className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-gray-600">No recent appointments</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboardData.recentAppointments.map((apt) => (
                <div key={apt.appointment_id} className="border border-pink-100 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{apt.service_name}</h4>
                      <p className="text-sm text-gray-600">Customer: {apt.customer_name}</p>
                      {apt.staff_name && <p className="text-sm text-gray-600">Staff: {apt.staff_name}</p>}
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">📅 {formatDate(apt.appointment_date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-pink-700 flex items-center">
              <FaReceipt className="mr-2" /> Recent Invoices
            </h3>
            <button
              className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              onClick={() => setActiveComponent('Generate Invoice')}
            >
              View All →
            </button>
          </div>
          
          {dashboardData.recentInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FaReceipt className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-gray-600">No recent invoices</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboardData.recentInvoices.map((inv) => (
                <div key={inv.invoice_id} className="border border-green-100 rounded-xl p-4 bg-green-50 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">Invoice #{inv.invoice_id}</h4>
                      <p className="text-sm text-gray-600">{inv.customer_name}</p>
                      <p className="text-sm text-gray-600">{inv.service_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">{formatCurrency(inv.total_amount)}</p>
                      <p className="text-xs text-gray-500">{inv.payment_method}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">📅 {formatDate(inv.date_issued)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4 flex items-center">
            <FaUserFriends className="mr-2" /> Quick Actions
          </h3>
          
          <div className="space-y-3">
            <button
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-pink-700 transition font-poppins flex items-center justify-center shadow-md"
              onClick={() => setActiveComponent('View Appointment and Assign Staff')}
            >
              <FaClock className="mr-2" /> Manage Appointments
            </button>
            
            <button
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition font-poppins flex items-center justify-center shadow-md"
              onClick={() => setActiveComponent('Add/Edit Services')}
            >
              <FaCut className="mr-2" /> Manage Services
            </button>
            
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-poppins flex items-center justify-center shadow-md"
              onClick={() => setActiveComponent('Manage Staff')}
            >
              <FaUserTie className="mr-2" /> Manage Staff
            </button>
            
            <button
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition font-poppins flex items-center justify-center shadow-md"
              onClick={() => setActiveComponent('Generate Invoice')}
            >
              <FaReceipt className="mr-2" /> Generate Invoice
            </button>
            
            <button
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-poppins flex items-center justify-center shadow-md"
              onClick={() => setActiveComponent('Track Expenses')}
            >
              <FaMoneyBillWave className="mr-2" /> Track Expenses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeComponent, setActiveComponent] = useState('Admin Home');

  // Debugging logs
  useEffect(() => {
    console.log('AdminDashboard: isSidebarOpen:', isSidebarOpen, 'activeComponent:', activeComponent);
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
    'Admin Home': () => <AdminHome setActiveComponent={setActiveComponent} />,
    'Add/Edit Services': () => <AddEditServices setActiveComponent={setActiveComponent} />,
    'View Appointment and Assign Staff': () => <ViewAssignAppointments setActiveComponent={setActiveComponent} />,
    'Block time slots': () => <BlockSlots setActiveComponent={setActiveComponent} />,
    'View Completed Appointments': () => <AllAppointments setActiveComponent={setActiveComponent} />,
    'Manage Staff': () => <ManageStaff setActiveComponent={setActiveComponent} />,
    'Customer Profiles': () => <CustomerProfiles setActiveComponent={setActiveComponent} />,
    'Track Expenses': () => <TrackExpenses setActiveComponent={setActiveComponent} />,
    'Edit and Make Promotions': () => <EditPromotions setActiveComponent={setActiveComponent} />,
    'Profile': () => <AdminProfile setActiveComponent={setActiveComponent} />,
    'Settings': () => <AdminSettings setActiveComponent={setActiveComponent} />,
    'Generate Invoice': () => <GenerateInvoice setActiveComponent={setActiveComponent} />,
    'Admin Feedbacks': () => <AdminFeedback setActiveComponent={setActiveComponent} />,
  };

  const ActiveComponent = componentMap[activeComponent] || AdminHome;

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
          .scrollable-main::-webkit-scrollbar {
            width: 8px;
          }
          .scrollable-main::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .scrollable-main::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .scrollable-main::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
        `}
      </style>

      {/* Navbar */}
      <AdminNavbar setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} setActiveComponent={setActiveComponent} />

      <div className="flex flex-1 mt-[4.5rem] sm:mt-[5rem]">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-10"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        {/* Sidebar */}
        <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} setActiveComponent={setActiveComponent} />

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

export default AdminDashboard;