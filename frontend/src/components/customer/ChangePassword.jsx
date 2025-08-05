import React, { useState } from 'react';
import { FaLock, FaUserAlt } from 'react-icons/fa';
import axios from '../../api/axios';

const ChangePassword = ({ setActiveComponent }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setLoading(true);

    // Client-side validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      setLoading(false);
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(formData.newPassword)) {
      setError('New password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to change password');
        setLoading(false);
        return;
      }
      const response = await axios.put('/api/customers/update-password', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(response.data.message);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setLoading(false);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update password';
      setError(errorMsg);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/signin';
      }
      setLoading(false);
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
        <FaLock className="mr-3 text-pink-500" /> Change Password
      </h2>
      <p className="text-gray-700 text-lg mb-8">Update your account password securely.</p>
      <div className="form-scroll max-h-[calc(100vh-5rem)] overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 mb-8 hover:shadow-2xl transition duration-300">
          {loading ? (
            <p className="text-gray-700 text-lg">Updating password...</p>
          ) : (
            <>
              {success && <div className="text-green-500 mb-4">{success}</div>}
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                    placeholder="Enter current password"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    className={`w-full sm:w-auto bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    className="w-full sm:w-auto bg-white text-pink-700 px-6 py-3 rounded-xl font-semibold border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition duration-300 ease-in-out transform hover:scale-105"
                    onClick={() => setActiveComponent('Profile')}
                    disabled={loading}
                  >
                    Back to Profile
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;