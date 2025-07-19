import React, { useState } from 'react';
import StaffSidebar from '../../components/staff/Sidebar';
import StaffNavbar from '../../components/staff/Navbar';
import StaffHome from '../../components/staff/StaffHome';
import SetAttendance from '../../components/staff/StaffAttendance';
import StaffAppointments from '../../components/staff/StaffAppointments';
import ViewServices from '../../components/staff/ViewService';

// Sample staff data (replace with auth context or API call)
const loggedInStaff = {
  id: 1,
  name: 'Emma Johnson',
  email: 'emma@salon.com',
  role: 'Stylist',
};

const StaffDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('Staff Home');
  const staff = loggedInStaff; // Replace with auth context or API

  const componentMap = {
    'Staff Home': () => <StaffHome staff={staff} />,
    'Set Attendance': () => <SetAttendance staffId={staff.id} />,
    'View Assigned Appointments': () => <StaffAppointments staffId={staff.id} />,
    'View Services': () => <ViewServices />,
  };

  return (
    <div className="font-poppins min-h-screen">
      <StaffNavbar staffName={staff.name} setActiveComponent={setActiveComponent} />
      <StaffSidebar setActiveComponent={setActiveComponent} />
      <div className="lg:ml-64 mt-[4.5rem] sm:mt-[5rem] min-h-[calc(100vh-5rem)]">
        {componentMap[activeComponent]()}
      </div>
    </div>
  );
};

export default StaffDashboard;