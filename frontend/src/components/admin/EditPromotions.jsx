import React, { useState, useEffect } from "react";
import { FaTag, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import axios from "../../api/axios";
import { jwtDecode } from "jwt-decode";

const EditPromotions = ({ setActiveComponent }) => {
  const [promotions, setPromotions] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    service_id: "",
    title: "",
    code: "",
    description: "",
    discountType: "",
    value: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Fetch promotions and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in as an admin to manage promotions");
          return;
        }
        const decoded = jwtDecode(token);
        if (decoded.role !== "admin") {
          setError("Access restricted to admins");
          return;
        }

        const [promoResponse, serviceResponse] = await Promise.all([
          axios.get("/api/promotions/get-promotions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/services/get-services", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setPromotions(promoResponse.data.promotions);
        setServices(serviceResponse.data.services);
        setSuccess(promoResponse.data.message);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch data");
      }
    };
    fetchData();
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
    setSuccess(null);
    setError(null);

    // Client-side validation
    if (
      !formData.service_id ||
      !formData.title ||
      !formData.code ||
      !formData.discountType ||
      !formData.value ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.usageLimit
    ) {
      setError("All fields except image are required");
      return;
    }
    if (!/^[A-Z0-9]+$/.test(formData.code)) {
      setError("Code must be uppercase alphanumeric");
      return;
    }
    if (isNaN(formData.value) || formData.value <= 0) {
      setError("Discount value must be a positive number");
      return;
    }
    if (isNaN(formData.usageLimit) || formData.usageLimit <= 0) {
      setError("Usage limit must be a positive integer");
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("End date must be after start date");
      return;
    }

    const data = new FormData();
    data.append("service_id", parseInt(formData.service_id));
    data.append("title", formData.title);
    data.append("code", formData.code);
    data.append("description", formData.description || "");
    data.append("discount_type", formData.discountType);
    data.append("value", parseFloat(formData.value));
    data.append("start_date", formData.startDate);
    data.append("end_date", formData.endDate);
    data.append("usage_limit", parseInt(formData.usageLimit));
    if (formData.image) {
      data.append("image", formData.image);
    } else if (isEditing && !formData.image) {
      data.append("image", "null");
    }

    try {
      const token = localStorage.getItem("token");
      if (isEditing) {
        const response = await axios.put(
          `/api/promotions/update-promotion/${formData.id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setPromotions(
          promotions.map((promo) =>
            promo.promo_id === formData.id ? response.data.promotion : promo
          )
        );
        setSuccess("Promotion updated successfully");
      } else {
        const response = await axios.post(
          "/api/promotions/create-promotion",
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setPromotions([...promotions, response.data.promotion]);
        setSuccess("Promotion created successfully");
      }
      // Reset form
      setFormData({
        id: null,
        service_id: "",
        title: "",
        code: "",
        description: "",
        discountType: "",
        value: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
        image: null,
      });
      setImagePreview(null);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save promotion");
    }
  };

  // Handle edit button click
  const handleEdit = (promotion) => {
    setFormData({
      id: promotion.promo_id,
      service_id: promotion.service_id,
      title: promotion.title,
      code: promotion.code,
      description: promotion.description || "",
      discountType: promotion.discount_type,
      value: promotion.value.toString(),
      startDate: promotion.start_date,
      endDate: promotion.end_date,
      usageLimit: promotion.usage_limit.toString(),
      image: null,
    });
    setImagePreview(promotion.image);
    setIsEditing(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/promotions/delete-promotion/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPromotions(promotions.filter((promo) => promo.promo_id !== id));
      setSuccess("Promotion deleted successfully");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete promotion");
    }
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
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
        <FaTag className="mr-3 text-pink-500" /> Edit Promotions
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Manage promotional offers for your salon. Add new promotions with images
        or edit existing ones.
      </p>
      {success && <div className="text-green-500 mb-4">{success}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="promotions-scroll">
        {/* Add/Edit Promotion Form */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8">
          <h3 className="text-2xl font-semibold text-pink-700 mb-4">
            {isEditing ? "Edit Promotion" : "Add New Promotion"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Service
              </label>
              <select
                name="service_id"
                value={formData.service_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="" disabled>
                  Select Service
                </option>
                {services.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Title
              </label>
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
              <label className="block text-gray-700 font-medium mb-1">
                Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter promotion code (e.g., SUMMER20)"
                pattern="[A-Z0-9]+"
                title="Code must be uppercase alphanumeric"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter promotion description"
                rows="4"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Discount Type
              </label>
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
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Discount Value
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter discount value"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min="2025-08-03"
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min="2025-08-03"
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter usage limit"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Promotion Image
              </label>
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
                {isEditing ? "Update Promotion" : "Add Promotion"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="bg-white text-pink-700 px-4 py-2 rounded-lg border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition font-poppins"
                  onClick={() => {
                    setFormData({
                      id: null,
                      service_id: "",
                      title: "",
                      code: "",
                      description: "",
                      discountType: "",
                      value: "",
                      startDate: "",
                      endDate: "",
                      usageLimit: "",
                      image: null,
                    });
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

        {/* Promotions List */}
        {promotions.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-700 text-lg">
              No promotions available. Add a promotion to get started.
            </p>
            <button
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition font-poppins"
              onClick={() => setActiveComponent("Admin Home")}
            >
              Back to Admin Home
            </button>
          </div>
        ) : (
          <table className="w-full bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
            <thead>
              <tr className="bg-pink-100 text-pink-700">
                <th className="px-6 py-4 text-left font-semibold text-base">
                  Image
                </th>
                <th className="px-6 py-4 text-left font-semibold text-base">
                  Service
                </th>
                <th className="px-6 py-4 text-left font-semibold text-base">
                  Title
                </th>
                <th className="px-6 py-4 text-left font-semibold text-base">
                  Code
                </th>
                <th className="px-6 py-4 text-left font-semibold text-base">
                  Description
                </th>
                <th className="px-6 py-4 text-left font-semibold text-base">
                  Discount
                </th>
                <th className="px-6 py-4 text-left font-semibold text-base">
                  Start Date
                </th>
                <th className="px-6 py-4 text-left font-semibold text-base">
                  End Date
                </th>
                <th className="px-6 py-4 text-left font-semibold text-base">
                  Usage Limit
                </th>
                <th className="px-6 py-4 text-left font-semibold text-base">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr
                  key={promotion.promo_id}
                  className="border-t border-pink-100 hover:bg-pink-50 transition duration-200"
                >
                  <td className="px-6 py-4">
                    <img
                      src={
                        promotion.image
                          ? `data:image/jpeg;base64,${promotion.image}`
                          : "https://placehold.co/100x100?text=Promo"
                      }
                      alt={promotion.title}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/100x100?text=Promo")
                      }
                    />
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {promotion.service_name}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{promotion.title}</td>
                  <td className="px-6 py-4 text-gray-700">{promotion.code}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {promotion.description || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-pink-500 font-medium">
                    {promotion.discount_type === "percentage"
                      ? `${promotion.value}% off`
                      : `$${promotion.value} off`}
                  </td>
                  <td className="px-6 py-4 text-pink-500 font-medium">
                    {formatDate(promotion.start_date)}
                  </td>
                  <td className="px-6 py-4 text-pink-500 font-medium">
                    {formatDate(promotion.end_date)}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {promotion.usage_limit}
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    <button
                      className="text-pink-500 hover:text-pink-600 transition"
                      onClick={() => handleEdit(promotion)}
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      className="text-pink-500 hover:text-pink-600 transition"
                      onClick={() => handleDelete(promotion.promo_id)}
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-8 text-center">
          <button
            className="flex items-center justify-center mx-auto bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setActiveComponent("Admin Home")}
          >
            <FaPlus className="mr-2 text-pink-500" /> Back to Admin Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPromotions;
