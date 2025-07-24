import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import salonImage from '../assets/salon2.jpg';

const Signin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    try {
      const response = await axios.post('/api/auth/signin', formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setSuccess(response.data.message || 'Signin successful!');
      setFormData({ email: '', password: '' });

      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      console.error('Signin error:', err);
      setError(err.response?.data?.error || 'Signin failed!');
    }
  };

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row overflow-hidden">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
          .font-poppins { font-family: 'Poppins', sans-serif; }
          input:focus { outline: none; ring: 2px solid #f43f5e; }
          .input-container { position: relative; }
          .input-container label {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.875rem;
            color: #6b7280;
            font-family: 'Poppins', sans-serif;
            pointer-events: none;
            transition: all 0.2s ease;
          }
          .input-container input:focus + label,
          .input-container input:not(:placeholder-shown) + label {
            top: -10px;
            left: 8px;
            font-size: 0.75rem;
            color: #f43f5e;
            background: #fff;
            padding: 0 4px;
          }
        `}
      </style>

      <div className="lg:w-1/2 h-48 lg:h-full bg-cover bg-center" style={{ backgroundImage: `url(${salonImage})` }}></div>

      <div className="lg:w-1/2 bg-white p-6 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center font-poppins">
              Sign In to Your Account
            </h2>

            {error && (
              <div className="text-red-500 mb-4 text-center font-poppins">{error}</div>
            )}
            {success && (
              <div className="text-green-500 mb-4 text-center font-poppins">{success}</div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="input-container">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder=" "
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 font-poppins"
                  required
                />
                <label htmlFor="email">Email Address</label>
              </div>

              <div className="input-container">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder=" "
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 font-poppins"
                  required
                />
                <label htmlFor="password">Password</label>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-lg font-poppins transition duration-200"
              >
                Sign In
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-600 text-center font-poppins">
              Don't have an account?{' '}
              <Link to="/signup" className="text-rose-500 hover:text-rose-600 font-medium">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;