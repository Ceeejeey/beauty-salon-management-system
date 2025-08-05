import React, { useState, useEffect } from 'react';
import StaffSidebar from '../../components/staff/Sidebar';
import StaffNavbar from '../../components/staff/Navbar';
import StaffHome from '../../components/staff/StaffHome';
import SetAttendance from '../../components/staff/StaffAttendance';
import StaffAppointments from '../../components/staff/StaffAppointments';
import ViewServices from '../../components/staff/ViewService';
import { jwtDecode } from 'jwt-decode';

const StaffDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('Staff Home');
  const [staff, setStaff] = useState(null);

  // Fetch staff data from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);
        setStaff(decoded); // decoded should contain user_id, name, email, etc.
      } catch (error) {
        console.error('Error decoding token:', error);
        setStaff(null);
      }
    }
  }, []);

  // Prevent rendering components until staff is loaded
  if (!staff) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading staff dashboard...</p>
      </div>
    );
  }

  const componentMap = {
    'Staff Home': <StaffHome staff={staff} />,
    'Set Attendance': <SetAttendance staffId={staff.user_id} />,
    'View Assigned Appointments': <StaffAppointments staffId={staff.user_id} />,
    'View Services': <ViewServices />,
  };

  return (
    <div className="font-poppins min-h-screen">
      <StaffNavbar staffName={staff.name} setActiveComponent={setActiveComponent} />
      <StaffSidebar setActiveComponent={setActiveComponent} />
      <div className="lg:ml-64 mt-[4.5rem] sm:mt-[5rem] min-h-[calc(100vh-5rem)]">
        {componentMap[activeComponent]}
      </div>
    </div>
  );
};

export default StaffDashboard;
