import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const ManageServices = () => {
  const [formData, setFormData] = useState({
    service_id: null,
    name: "",
    category: "",
    description: "",
    price: "",
    duration: "",
    image: null,
  });
  const [services, setServices] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Predefined categories
  const categories = ["Hair", "Nails", "Spa", "Waxing", "Massage", "Facial"];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("/api/services/get-services", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setServices(response.data.services);
        toast.success(response.data.message);
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to fetch services");
      }
    };
    fetchServices();
  }, []);

  // Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("category", formData.category);
      payload.append("description", formData.description || "");
      payload.append("price", formData.price);
      payload.append("duration", formData.duration);
      if (formData.imageFile) {
        payload.append("image", formData.imageFile); // multer reads this
      }

      let response;
      if (isEditing) {
        response = await axios.put(
          `/api/services/update-service/${formData.service_id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setServices((prev) =>
          prev.map((s) =>
            s.service_id === formData.service_id ? response.data.service : s
          )
        );
      } else {
        response = await axios.post("/api/services/create-service", payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setServices((prev) => [...prev, response.data.service]);
      }

      toast.success(response.data.message);
      setFormData({
        service_id: null,
        name: "",
        category: "",
        description: "",
        price: "",
        duration: "",
        imageFile: null,
      });
      setImagePreview(null);
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save service");
    }
  };

  // Image change handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, imageFile: null }));
      setImagePreview(null);
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      toast.error("Image size must be less than 5MB");
      setFormData((prev) => ({ ...prev, imageFile: null }));
      setImagePreview(null);
      return;
    }

    setFormData((prev) => ({ ...prev, imageFile: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };
  // Edit existing service
  const handleEdit = (service) => {
    setFormData({
      service_id: service.service_id,
      name: service.name,
      category: service.category,
      description: service.description || "",
      price: service.price,
      duration: service.duration,
      image: service.image || null,
    });
    setImagePreview(
      service.image ? `data:image/jpeg;base64,${service.image}` : null
    );
    setIsEditing(true);
  };

  // Delete service
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/services/get-service/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setServices((prev) =>
        prev.filter((service) => service.service_id !== id)
      );
      toast.success(response.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete service");
    }
  };

  return (
    <div className="p-6 sm:p-10 font-poppins bg-gradient-to-br from-pink-50 to-white">
      <style>
        {`
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
        <FaPlus className="mr-2 text-pink-500" /> Manage Services
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Here you can add, edit, and delete services for your salon.
      </p>
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Enter service name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
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
              placeholder="Enter service description"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Price (LKR)
            </label>
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
            <label className="block text-gray-700 font-medium mb-1">
              Duration
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Enter duration (e.g., 1 hour)"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Image
            </label>
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
              {isEditing ? "Update Service" : "Add Service"}
            </button>
            {isEditing && (
              <button
                type="button"
                className="bg-white text-pink-700 px-4 py-2 rounded-lg border border-pink-500 hover:bg-pink-100 hover:text-pink-500 transition font-poppins"
                onClick={() => {
                  setFormData({
                    service_id: null,
                    name: "",
                    category: "",
                    description: "",
                    price: "",
                    duration: "",
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
      <div className="table-container ">
        <table className="w-full bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
          <thead>
            <tr className="bg-pink-100 text-pink-700">
              <th className="p-2 font-poppins">Name</th>
              <th className="p-2 font-poppins">Category</th>
              <th className="p-2 font-poppins">Description</th>
              <th className="p-2 font-poppins">Price</th>
              <th className="p-2 font-poppins">Duration</th>
              <th className="p-2 font-poppins">Image</th>
              <th className="p-2 font-poppins">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr
                key={service.service_id}
                className="border-b border-pink-100 hover:bg-pink-50"
              >
                <td className="p-2 font-poppins">{service.name}</td>
                <td className="p-2 font-poppins">{service.category}</td>
                <td className="p-2 font-poppins">
                  {service.description || "No description"}
                </td>
                <td className="p-2 font-poppins">LKR{service.price}</td>
                <td className="p-2 font-poppins">{service.duration}</td>
                <td className="p-2 font-poppins">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    "No image"
                  )}
                </td>
                <td className="p-2 font-poppins">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-pink-500 hover:text-pink-600 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(service.service_id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageServices;
