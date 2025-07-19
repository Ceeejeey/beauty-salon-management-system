import React, { useState, useEffect } from 'react';
import { FaTag, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';

// Sample promotions data with images (replace with API call)
const initialPromotions = [
  {
    id: 1,
    title: 'Summer Glow Discount',
    description: '20% off on all hair services.',
    discountType: 'Percentage',
    discountValue: 20,
    validFrom: '2025-07-01',
    validUntil: '2025-07-31',
    image: '/assets/promotions/summer_glow.jpg',
  },
  {
    id: 2,
    title: 'Spa Day Special',
    description: '$10 off on any facial treatment.',
    discountType: 'Fixed',
    discountValue: 10,
    validFrom: '2025-07-15',
    validUntil: '2025-08-15',
    image: '/assets/promotions/spa_day.jpg',
  },
  {
    id: 3,
    title: 'Nail Bliss Promo',
    description: '15% off on manicure and pedicure combo.',
    discountType: 'Percentage',
    discountValue: 15,
    validFrom: '2025-07-19',
    validUntil: '2025-08-01',
    image: '/assets/promotions/nail_bliss.jpg',
  },
];

const EditPromotions = ({ setActiveComponent }) => {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    discountType: '',
    discountValue: '',
    validFrom: '',
    validUntil: '',
    image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch promotions (placeholder for API call)
  useEffect(() => {
    // axios.get('/api/promotions').then((response) => setPromotions(response.data));
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
    data.append('discountType', formData.discountType);
    data.append('discountValue', parseFloat(formData.discountValue));
    data.append('validFrom', formData.validFrom);
    data.append('validUntil', formData.validUntil);
    if (formData.image) data.append('image', formData.image);

    try {
      if (isEditing) {
        // Update promotion (placeholder)
        // await axios.put(`/api/promotions/${formData.id}`, data, {
        //   headers: { 'Content-Type': 'multipart/form-data' },
        // });
        setPromotions(
          promotions.map((promo) =>
            promo.id === formData.id
              ? {
                  ...promo,
                  title: formData.title,
                  description: formData.description,
                  discountType: formData.discountType,
                  discountValue: parseFloat(formData.discountValue),
                  validFrom: formData.validFrom,
                  validUntil: formData.validUntil,
                  image: imagePreview || promo.image,
                }
              : promo
          )
        );
        console.log('Promotion updated:', formData);
      } else {
        // Add promotion (placeholder)
        // await axios.post('/api/promotions', data, {
        //   headers: { 'Content-Type': 'multipart/form-data' },
        // });
        const newPromotion = {
          id: promotions.length + 1,
          title: formData.title,
          description: formData.description,
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          validFrom: formData.validFrom,
          validUntil: formData.validUntil,
          image: imagePreview || '/assets/promotions/placeholder.jpg',
        };
        setPromotions([...promotions, newPromotion]);
        console.log('Promotion added:', newPromotion);
      }
      // Reset form
      setFormData({
        id: null,
        title: '',
        description: '',
        discountType: '',
        discountValue: '',
        validFrom: '',
        validUntil: '',
        image: null,
      });
      setImagePreview(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  // Handle edit button click
  const handleEdit = (promotion) => {
    setFormData({
      id: promotion.id,
      title: promotion.title,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue.toString(),
      validFrom: promotion.validFrom,
      validUntil: promotion.validUntil,
      image: null,
    });
    setImagePreview(promotion.image);
    setIsEditing(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      // await axios.delete(`/api/promotions/${id}`);
      setPromotions(promotions.filter((promo) => promo.id !== id));
      console.log('Promotion deleted:', id);
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
          .promotions-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .promotions-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .promotions-scroll::-webkit-scrollbar-thumb {
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .promotions-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
          .table-container {
            overflow-x: auto;
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-pink-700 mb-6 flex items-center">
        <FaTag className="mr-3 text-pink-500" /> Edit Promotions
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Manage promotional offers for your salon. Add new promotions with images or edit existing ones.
      </p>
      
        {/* Add/Edit Promotion Form */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4">
            {isEditing ? 'Edit Promotion' : 'Add New Promotion'}
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
                placeholder="Enter promotion title"
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
                placeholder="Enter promotion description"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Discount Type</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="" disabled>
                  Select Discount Type
                </option>
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Discount Value</label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter discount value"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Valid From</label>
              <input
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Valid Until</label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Promotion Image</label>
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
                {isEditing ? 'Update Promotion' : 'Add Promotion'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="bg-white text-pink-700 px-4 py-2 rounded-lg border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition font-poppins"
                  onClick={() => {
                    setFormData({
                      id: null,
                      title: '',
                      description: '',
                      discountType: '',
                      discountValue: '',
                      validFrom: '',
                      validUntil: '',
                      image: null,
                    });
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

        {/* Promotions List */}
        {promotions.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-700 text-lg">No promotions available. Add a promotion to get started.</p>
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
                  <th className="px-6 py-4 text-left font-semibold text-base">Discount</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Valid From</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Valid Until</th>
                  <th className="px-6 py-4 text-left font-semibold text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promotion) => (
                  <tr
                    key={promotion.id}
                    className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={promotion.image}
                        alt={promotion.title}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/100x100?text=Promo')}
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-700">{promotion.title}</td>
                    <td className="px-6 py-4 text-gray-700">{promotion.description}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">
                      {promotion.discountType === 'Percentage'
                        ? `${promotion.discountValue}% off`
                        : `$${promotion.discountValue.toFixed(2)} off`}
                    </td>
                    <td className="px-6 py-4 text-pink-500 font-medium">{promotion.validFrom}</td>
                    <td className="px-6 py-4 text-pink-500 font-medium">{promotion.validUntil}</td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        className="text-pink-500 hover:text-pink-600 transition"
                        onClick={() => handleEdit(promotion)}
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        className="text-pink-500 hover:text-pink-600 transition"
                        onClick={() => handleDelete(promotion.id)}
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

export default EditPromotions;