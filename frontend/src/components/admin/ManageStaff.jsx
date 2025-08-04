import React, { useState, useEffect } from 'react';
import { FaUsers, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';

const ManageStaff = ({ setActiveComponent }) => {
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    role: '',
    contact: '',
    availability: '1',
    profile_picture: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Fetch staff and appointments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in as an admin to manage staff');
          return;
        }
        const decoded = jwtDecode(token);
        if (decoded.role !== 'admin') {
          setError('Access restricted to admins');
          return;
        }

        const [staffResponse, appointmentsResponse] = await Promise.all([
          axios.get('/api/staff/get-staff', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/appointments/get-appointments', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStaff(staffResponse.data.staff);
        setAppointments(appointmentsResponse.data.appointments);
        setSuccess('Data retrieved successfully');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  // Calculate appointments completed per staff
  const getAppointmentsCompleted = (userId) => {
    return appointments.filter(
      (appt) => appt.staff_id === userId && appt.status === 'Completed'
    ).length;
  };

  // Get availability status
  const getAvailabilityToday = (availability) => {
    return availability === 1 ? 'Available' : 'Booked';
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profile_picture: file });
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  // Handle form submission (add/edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    // Client-side validation
    if (!formData.name || !formData.email || !formData.role || !formData.contact) {
      setError('Name, email, role, and contact are required');
      return;
    }
    if (!isEditing && !formData.password) {
      setError('Password is required for new staff');
      return;
    }
    if (formData.password && formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return;
    }
    if (!/^\+?\d{10,15}$/.test(formData.contact.replace(/[\s-]/g, ''))) {
      setError('Invalid contact number');
      return;
    }
    if (!['0', '1'].includes(formData.availability)) {
      setError('Availability must be 0 or 1');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    if (formData.password) data.append('password', formData.password);
    data.append('role', formData.role);
    data.append('contact', formData.contact);
    data.append('availability', formData.availability);
    if (formData.profile_picture) {
      data.append('profile_picture', formData.profile_picture);
    } else if (isEditing && !formData.profile_picture) {
      data.append('profile_picture', 'null');
    }

    try {
      const token = localStorage.getItem('token');
      if (isEditing) {
        const response = await axios.put(`/api/staff/update-staff/${formData.id}`, data, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setStaff(
          staff.map((s) =>
            s.user_id === formData.id ? response.data.staff : s
          )
        );
        setSuccess('Staff updated successfully');
      } else {
        const response = await axios.post('/api/staff/create-staff', data, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setStaff([...staff, response.data.staff]);
        setSuccess('Staff created successfully');
      }
      // Reset form
      setFormData({ id: null, name: '', email: '', password: '', role: '', contact: '', availability: '1', profile_picture: null });
      setImagePreview(null);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save staff');
    }
  };

  // Handle edit button click
  const handleEdit = (staffMember) => {
    setFormData({
      id: staffMember.user_id,
      name: staffMember.name,
      email: staffMember.email,
      password: '',
      role: staffMember.role,
      contact: staffMember.contact,
      availability: staffMember.availability.toString(),
      profile_picture: staffMember.profile_picture ? staffMember.profile_picture : null,
    });
    setImagePreview(staffMember.profile_picture);
    setIsEditing(true);
    setSuccess(null);
    setError(null);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/staff/delete-staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff(staff.filter((s) => s.user_id !== id));
      setSuccess('Staff deleted successfully');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete staff');
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
          .table-container::-webkit-scrollbar {
            height: 8px;
          }
          .table-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .table-container::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .table-container::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6 flex items-center">
        <FaUsers className="mr-3 text-pink-500" /> Manage Staff
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        View staff performance, availability, and manage staff records.
      </p>
      {success && <div className="text-green-500 mb-4">{success}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="staff-scroll">
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
              <label className="block text-gray-700 font-medium mb-1">Password {isEditing && '(Leave blank to keep unchanged)'}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder={isEditing ? 'Enter new password (optional)' : 'Enter password'}
                required={!isEditing}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter role (e.g., Stylist, Therapist, Manager)"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter contact number (e.g., 123-456-7890)"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Availability Today</label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="1">Available</option>
                <option value="0">Booked</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Profile Picture</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
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
                    setFormData({ id: null, name: '', email: '', password: '', role: '', contact: '', availability: '1', profile_picture: null });
                    setImagePreview(null);
                    setIsEditing(false);
                    setSuccess(null);
                    setError(null);
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
                  <th className="px-6 py-4 text-left font-semibold text-base">Contact</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Appointments Completed</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Availability Today</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((staffMember) => (
                  <tr
                    key={staffMember.user_id}
                    className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={staffMember.profile_picture || 'https://placeholder.co/100x100?text=Staff'}
                        alt={staffMember.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => (e.target.src = 'https://placeholder.co/100x100?text=Staff')}
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-700">{staffMember.name}</td>
                    <td className="px-6 py-4 text-gray-700">{staffMember.email}</td>
                    <td className="px-6 py-4 text-gray-700">{staffMember.role}</td>
                    <td className="px-6 py-4 text-gray-700">{staffMember.contact}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">
                      {getAppointmentsCompleted(staffMember.user_id)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`${
                          getAvailabilityToday(staffMember.availability) === 'Available'
                            ? 'text-green-600'
                            : 'text-red-600'
                        } font-medium`}
                      >
                        {getAvailabilityToday(staffMember.availability)}
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
                        onClick={() => handleDelete(staffMember.user_id)}
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
    </div>
  );
};

export default ManageStaff;