import React, { useRef, useState } from 'react';
import { useNavigate} from 'react-router-dom'
import axios from '../api/axios'; // Adjust the path as needed
import { Link } from 'react-router-dom';
import salonImage from '../assets/salon.jpg'; // Adjust the path as needed

const Signup = () => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    birthday: '',
    profilePicture: null,
    password: '',
  });
  const [fileName, setFileName] = useState('Upload Profile Picture');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePicture: file }));
      setFileName(file.name);
    } else {
      setFileName('Upload Profile Picture');
    }
  };

  const handleDateChange = (e) => {
    const rawDate = e.target.value;
    setFormData((prev) => ({ ...prev, birthday: rawDate }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      // Send the form data to the backend
      const response = await axios.post('/api/auth/signup', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(response.data.message || 'Signup successful!');
      setFormData({ fullName: '', phone: '', email: '', birthday: '', profilePicture: null, password: '' });
      setFileName('Upload Profile Picture');
      navigate('/signin')
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Signup failed');
      console.error('Signup error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col lg:flex-row overflow-hidden">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
          .font-poppins {
            font-family: 'Poppins', sans-serif;
          }
          input[type="date"]::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0.6;
            filter: invert(60%) sepia(50%) saturate(500%) hue-rotate(310deg);
          }
          input[type="date"] {
            color: #6b7280;
          }
          input:focus {
            outline: none;
            ring: 2px solid #f43f5e;
          }
          .input-container {
            position: relative;
          }
          .input-container label {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.875rem;
            color: #6b7280;
            font-family: 'Poppins', sans-serif;
            pointer-events: none;
          }
          .file-container label {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.875rem;
            color: #6b7280;
            font-family: 'Poppins', sans-serif;
            pointer-events: none;
          }
        `}
      </style>

      {/* Left Column */}
      <div
        className="lg:w-1/2 h-48 lg:h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${salonImage})` }}
      ></div>

      {/* Right Column */}
      <div className="lg:w-1/2 bg-white p-6 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center font-poppins">
              Create Your Account
            </h2>

            {error && <p className="text-red-500 text-sm text-center font-poppins mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm text-center font-poppins mb-4">{success}</p>}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="input-container">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder=" "
                  className="w-full px-4 py-2 pl-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-poppins"
                  required
                />
                <label htmlFor="fullName">Full Name</label>
              </div>

              <div className="input-container">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder=" "
                  className="w-full px-4 py-2 pl-30 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-poppins"
                  required
                />
                <label htmlFor="phone">Phone Number</label>
              </div>

              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder=" "
                  className="w-full px-4 py-2 pl-30 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-poppins"
                  required
                />
                <label htmlFor="email">Email Address</label>
              </div>

              <div className="input-container">
                <input
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleDateChange}
                  placeholder=" "
                  className="w-full px-4 py-2 pl-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-poppins text-gray-500"
                  required
                />
                <label htmlFor="birthday">Birthday</label>
              </div>

              <div
                className="file-container relative cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute opacity-0 w-0 h-0"
                />
                <div className="w-full px-4 py-2 pl-28 border border-gray-300 rounded-lg bg-white text-gray-500 font-poppins text-sm truncate">
                  {fileName}
                </div>
                <label htmlFor="profilePicture">Profile Picture</label>
              </div>

              <div className="input-container">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder=" "
                  className="w-full px-4 py-2 pl-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-poppins"
                  required
                />
                <label htmlFor="password">Password</label>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-lg transition font-poppins shadow-md"
              >
                Sign Up
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-600 text-center font-poppins">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="text-rose-500 hover:text-rose-600 font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;