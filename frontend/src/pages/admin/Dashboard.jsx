import React, { useState, useEffect } from 'react';
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


const AdminHome = ({ setActiveComponent }) => (
  <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
    <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6">
      Welcome to Admin Dashboard
    </h2>
    <p className="text-gray-700 text-lg mb-8">
      Manage your salon operations with ease. Add services, assign appointments, manage staff, track expenses, and create promotions.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
        <h3 className="text-2xl font-semibold text-pink-700 mb-3">Quick Actions</h3>
        <p className="text-gray-700 mb-4">Jump to key tasks:</p>
        <button
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
          onClick={() => setActiveComponent('Add/Edit Services')}
        >
          Manage Services
        </button>
      </div>
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105">
        <h3 className="text-2xl font-semibold text-pink-700 mb-3">Recent Activity</h3>
        <p className="text-gray-700">New appointment booked: Haircut & Styling - July 20, 2025</p>
      </div>
    </div>
  </div>
);

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