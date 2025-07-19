import React, { useState, useEffect } from 'react';
import { FaCut, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
// import axios from 'axios';

// Sample services data (replace with API call)
const initialServices = [
  {
    id: 1,
    title: 'Haircut & Styling',
    description: 'Transform your look with a personalized haircut and professional styling.',
    price: 50,
    image: '/assets/customer/haircut.jpg',
  },
  {
    id: 2,
    title: 'Manicure & Pedicure',
    description: 'Indulge in a luxurious nail treatment for perfectly polished hands and feet.',
    price: 40,
    image: '/assets/customer/manicure.jpg',
  },
  {
    id: 3,
    title: 'Facial Treatment',
    description: 'Rejuvenate your skin with our deep-cleansing and hydrating facial.',
    price: 60,
    image: '/assets/customer/facial_treatment.jpg',
  },
];

const AddEditServices = ({ setActiveComponent }) => {
  const [services, setServices] = useState(initialServices);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    price: '',
    image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch services (placeholder for API call)
  useEffect(() => {
    // axios.get('/api/services').then((response) => setServices(response.data));
  }, []);

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
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    if (formData.image) data.append('image', formData.image);

    try {
      if (isEditing) {
        // Update service (placeholder)
        // await axios.put(`/api/services/${formData.id}`, data);
        setServices(
          services.map((service) =>
            service.id === formData.id
              ? {
                  ...service,
                  title: formData.title,
                  description: formData.description,
                  price: parseFloat(formData.price),
                  image: imagePreview || service.image,
                }
              : service
          )
        );
        console.log('Service updated:', formData);
      } else {
        // Add service (placeholder)
        // await axios.post('/api/services', data);
        const newService = {
          id: services.length + 1,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          image: imagePreview || '/assets/customer/placeholder.jpg',
        };
        setServices([...services, newService]);
        console.log('Service added:', newService);
      }
      // Reset form
      setFormData({ id: null, title: '', description: '', price: '', image: null });
      setImagePreview(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  // Handle edit button click
  const handleEdit = (service) => {
    setFormData({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      image: null,
    });
    setImagePreview(service.image);
    setIsEditing(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      // await axios.delete(`/api/services/${id}`);
      setServices(services.filter((service) => service.id !== id));
      console.log('Service deleted:', id);
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
          .services-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .services-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .services-scroll::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .services-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
          .table-container {
            overflow-x: auto;
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6 flex items-center">
        <FaCut className="mr-3 text-pink-500" /> Add/Edit Services
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Manage your salon’s service offerings. Add new services or edit existing ones.
      </p>
      
        {/* Form */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4">
            {isEditing ? 'Edit Service' : 'Add New Service'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter service title"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter service description"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter price"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Image</label>
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
                {isEditing ? 'Update Service' : 'Add Service'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="bg-white text-pink-700 px-4 py-2 rounded-lg border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition font-poppins"
                  onClick={() => {
                    setFormData({ id: null, title: '', description: '', price: '', image: null });
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

        {/* Services List */}
        {services.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-700 text-lg">No services available. Add a service to get started.</p>
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
                  <th className="px-6 py-4 text-left font-semibold text-base">Title</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Description</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Price</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/100x100?text=Image')}
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-700">{service.title}</td>
                    <td className="px-6 py-4 text-gray-700">{service.description}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">${service.price.toFixed(2)}</td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        className="text-pink-500 hover:text-pink-600 transition"
                        onClick={() => handleEdit(service)}
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        className="text-pink-500 hover:text-pink-600 transition"
                        onClick={() => handleDelete(service.id)}
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

export default AddEditServices;