import React, { useState, useEffect } from 'react';
import { FaUsers, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';

// Sample staff data (replace with API call)
const initialStaff = [
  {
    id: 1,
    name: 'Emma Johnson',
    email: 'emma@salon.com',
    role: 'Stylist',
    image: '/assets/staff/emma.jpg',
  },
  {
    id: 2,
    name: 'Liam Davis',
    email: 'liam@salon.com',
    role: 'Therapist',
    image: '/assets/staff/liam.jpg',
  },
  {
    id: 3,
    name: 'Olivia Wilson',
    email: 'olivia@salon.com',
    role: 'Stylist',
    image: '/assets/staff/olivia.jpg',
  },
];

// Sample appointments data (replace with API call)
const initialAppointments = [
  {
    id: 1,
    service: 'Haircut & Styling',
    customerName: 'Jane Doe',
    date: '2025-07-20',
    time: '2:00 PM',
    staffId: 1,
    status: 'Approved',
  },
  {
    id: 2,
    service: 'Manicure & Pedicure',
    customerName: 'Emily Smith',
    date: '2025-07-25',
    time: '10:00 AM',
    staffId: 1,
    status: 'Approved',
  },
  {
    id: 3,
    service: 'Facial Treatment',
    customerName: 'Sarah Brown',
    date: '2025-07-19',
    time: '3:00 PM',
    staffId: 2,
    status: 'Approved',
  },
];

// Sample staff schedules (replace with API call or logic)
const initialSchedules = [
  { staffId: 1, date: '2025-07-19', available: false }, // Emma: Booked today
  { staffId: 2, date: '2025-07-19', available: false }, // Liam: Booked today
  { staffId: 3, date: '2025-07-19', available: true }, // Olivia: Available today
];

const ManageStaff = ({ setActiveComponent }) => {
  const [staff, setStaff] = useState(initialStaff);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    role: '',
    image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch staff, appointments, and schedules (placeholder for API calls)
  useEffect(() => {
    // axios.get('/api/staff').then((response) => setStaff(response.data));
    // axios.get('/api/appointments').then((response) => setAppointments(response.data));
    // axios.get('/api/staff-schedules').then((response) => setSchedules(response.data));
  }, []);

  // Calculate appointments completed per staff
  const getAppointmentsCompleted = (staffId) => {
    return appointments.filter(
      (appt) => appt.staffId === staffId && appt.status === 'Approved'
    ).length;
  };

  // Check availability for today (July 19, 2025)
  const getAvailabilityToday = (staffId) => {
    const todaySchedule = schedules.find(
      (sched) => sched.staffId === staffId && sched.date === '2025-07-19'
    );
    return todaySchedule ? (todaySchedule.available ? 'Available' : 'Booked') : 'Unknown';
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  // Handle form submission (add/edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('role', formData.role);
    if (formData.image) data.append('image', formData.image);

    try {
      if (isEditing) {
        // Update staff (placeholder)
        // await axios.put(`/api/staff/${formData.id}`, data);
        setStaff(
          staff.map((s) =>
            s.id === formData.id
              ? {
                  ...s,
                  name: formData.name,
                  email: formData.email,
                  role: formData.role,
                  image: imagePreview || s.image,
                }
              : s
          )
        );
        console.log('Staff updated:', formData);
      } else {
        // Add staff (placeholder)
        // await axios.post('/api/staff', data);
        const newStaff = {
          id: staff.length + 1,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          image: imagePreview || '/assets/staff/placeholder.jpg',
        };
        setStaff([...staff, newStaff]);
        console.log('Staff added:', newStaff);
      }
      // Reset form
      setFormData({ id: null, name: '', email: '', role: '', image: null });
      setImagePreview(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving staff:', error);
    }
  };

  // Handle edit button click
  const handleEdit = (staffMember) => {
    setFormData({
      id: staffMember.id,
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      image: null,
    });
    setImagePreview(staffMember.image);
    setIsEditing(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      // await axios.delete(`/api/staff/${id}`);
      setStaff(staff.filter((s) => s.id !== id));
      console.log('Staff deleted:', id);
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
          .staff-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .staff-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .staff-scroll::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .staff-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
          .table-container {
            overflow-x: auto;
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6 flex items-center">
        <FaUsers className="mr-3 text-pink-500" /> Manage Staff
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        View staff performance, schedules, and manage staff records.
      </p>
      
        {/* Form */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4">
            {isEditing ? 'Edit Staff' : 'Add New Staff'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter staff name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter staff email"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="" disabled>
                  Select Role
                </option>
                <option value="Stylist">Stylist</option>
                <option value="Therapist">Therapist</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border border-pink-200 rounded-lg"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-4 w-32 h-32 object-cover rounded-lg"
                />
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 hover:shadow-lg transition duration-300 font-poppins"
              >
                {isEditing ? 'Update Staff' : 'Add Staff'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="bg-white text-pink-700 px-4 py-2 rounded-lg border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition font-poppins"
                  onClick={() => {
                    setFormData({ id: null, name: '', email: '', role: '', image: null });
                    setImagePreview(null);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Staff List */}
        {staff.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-700 text-lg">No staff members available. Add a staff member to get started.</p>
            <button
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
              onClick={() => setActiveComponent('Admin Home')}
            >
              Back to Admin Home
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
              <thead>
                <tr className="bg-pink-100 text-pink-700">
                  <th className="px-6 py-4 text-left font-semibold text-base">Image</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Role</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Appointments Completed</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Availability Today</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((staffMember) => (
                  <tr
                    key={staffMember.id}
                    className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={staffMember.image}
                        alt={staffMember.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/100x100?text=Staff')}
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-700">{staffMember.name}</td>
                    <td className="px-6 py-4 text-gray-700">{staffMember.email}</td>
                    <td className="px-6 py-4 text-gray-700">{staffMember.role}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">
                      {getAppointmentsCompleted(staffMember.id)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`${
                          getAvailabilityToday(staffMember.id) === 'Available'
                            ? 'text-green-600'
                            : 'text-red-600'
                        } font-medium`}
                      >
                        {getAvailabilityToday(staffMember.id)}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        className="text-pink-500 hover:text-pink-600 transition"
                        onClick={() => handleEdit(staffMember)}
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        className="text-pink-500 hover:text-pink-600 transition"
                        onClick={() => handleDelete(staffMember.id)}
                      >
                        <FaTrash className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-8 text-center">
          <button
            className="flex items-center justify-center mx-auto bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setActiveComponent('Admin Home')}
          >
            <FaPlus className="mr-2 text-pink-500" /> Back to Admin Home
          </button>
        </div>
      </div>
    
  );
};

export default ManageStaff;