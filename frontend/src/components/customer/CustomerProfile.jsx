import React, { useState, useEffect } from 'react';
import { FaUserAlt, FaTasks } from 'react-icons/fa';
import axios from '../../api/axios';
import { jwtDecode } from 'jwt-decode';

const Profile = ({ setActiveComponent }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    profile_picture: null,
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    profile_picture: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view profile');
          setLoading(false);
          return;
        }
        const decoded = jwtDecode(token);
        if (!['customer', 'admin', 'Stylist', 'Therapist'].includes(decoded.role)) {
          setError('Access restricted to authorized users');
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/customers/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = {
          name: response.data.user.name,
          email: response.data.user.email,
          phone: response.data.user.phone || '',
          birthday: response.data.user.birthday || '',
          profile_picture: null,
        };
        setFormData(userData);
        setOriginalData(userData);
        setImagePreview(response.data.user.profile_picture || null);
        setSuccess(response.data.message);
        setLoading(false);
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Failed to fetch profile';
        setError(errorMsg);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/signin';
        }
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input for profile picture
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Only JPEG or PNG images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setFormData((prev) => ({ ...prev, profile_picture: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setLoading(true);

    // Client-side validation
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Name, email, and phone are required');
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      setLoading(false);
      return;
    }
    if (!/^\+?\d{10,15}$/.test(formData.phone)) {
      setError('Invalid phone number format (e.g., +9477567890)');
      setLoading(false);
      return;
    }
    if (formData.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthday)) {
      setError('Invalid birthday format (YYYY-MM-DD)');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      if (formData.birthday) formDataToSend.append('birthday', formData.birthday);
      if (formData.profile_picture) formDataToSend.append('profile_picture', formData.profile_picture);

      const response = await axios.put('/api/customers/profile', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(response.data.message);
      const userData = {
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone || '',
        birthday: response.data.user.birthday || '',
        profile_picture: null,
      };
      setFormData(userData);
      setOriginalData(userData);
      setImagePreview(response.data.user.profile_picture || null);
      setLoading(false);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile';
      setError(errorMsg);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/signin';
      }
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    if (setActiveComponent) {
      setActiveComponent('Dashboard');
      console.log('Navigate to Dashboard');
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
            background: #ec4899;
            border-radius: 4px;
          }
          .form-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777;
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaUserAlt className="mr-3 text-pink-500" /> Profile
      </h2>
      <p className="text-gray-700 text-lg mb-8">Manage your personal information.</p>
      
        <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 mb-8 hover:shadow-2xl transition duration-300">
          {loading ? (
            <p className="text-gray-700 text-lg">Loading profile...</p>
          ) : (
            <>
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Birthday</label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                    placeholder="Select your birthday (YYYY-MM-DD)"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Profile Picture</label>
                  {imagePreview && (
                    <div className="mb-4">
                      <img
                        src={imagePreview}
                        alt="Profile Preview"
                        className="w-24 h-24 object-cover rounded-full border border-pink-200"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="profile_picture"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    className="w-full sm:w-auto bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                    onClick={() => setActiveComponent('Change Password')}
                    disabled={loading}
                  >
                    Change Password
                  </button>
                  <button
                    type="submit"
                    className={`w-full sm:w-auto bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                  <button
                    type="button"
                    className="w-full sm:w-auto bg-white text-pink-700 px-6 py-3 rounded-xl font-semibold border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition duration-300 ease-in-out transform hover:scale-105"
                    onClick={() => {
                      setFormData(originalData);
                      setImagePreview(originalData.profile_picture || null);
                    }}
                    disabled={loading}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      
      <div className="mt-8 flex justify-center">
        <button
          className="flex items-center justify-center bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleBackToDashboard}
          disabled={loading}
        >
          <FaTasks className="mr-2" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Profile;