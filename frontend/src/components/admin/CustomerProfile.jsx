import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaUsers } from "react-icons/fa";
import axios from "../../api/axios";
import toast from "react-hot-toast";

const CustomerProfiles = ({ setActiveComponent }) => {
  const [customers, setCustomers] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch customer profiles
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (nameFilter) params.name = nameFilter;
      if (emailFilter) params.email = emailFilter;
      const response = await axios.get("/api/customers/customers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params,
      });
      setCustomers(response.data.customers);
      console.log("Customer profiles fetched:", response.data.customers);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to fetch customer profiles"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchCustomers();
  }, [nameFilter, emailFilter]);

  const handleNameFilterChange = (e) => {
    setNameFilter(e.target.value);
  };

  const handleEmailFilterChange = (e) => {
    setEmailFilter(e.target.value);
  };

  // Clear filters
  const clearFilters = () => {
    setNameFilter("");
    setEmailFilter("");
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
            background: #ec4899; /* pink-500 */
            border-radius: 4px;
          }
          .form-scroll::-webkit-scrollbar-thumb:hover {
            background: #db2777; /* pink-600 */
          }
          .table-scroll {
            max-height: 500px;
            overflow-y: auto;
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaUsers className="mr-3 text-pink-500" /> Customer Profiles
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        View all registered customer profiles, filterable by name or email.
      </p>
      <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 mb-8 hover:shadow-2xl transition duration-300">
        <h3 className="text-xl font-semibold text-pink-700 mb-4">
          Filter Customers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Name
            </label>
            <input
              type="text"
              value={nameFilter}
              onChange={handleNameFilterChange}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <input
              type="text"
              value={emailFilter}
              onChange={handleEmailFilterChange}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
              placeholder="Enter customer email"
            />
          </div>
        </div>
        <button
          onClick={clearFilters}
          className="mb-6 px-6 py-3 rounded-xl font-semibold bg-pink-500 text-white hover:bg-pink-600 hover:shadow-lg hover:scale-105 transition duration-300"
        >
          Clear Filters
        </button>
        <h3 className="text-xl font-semibold text-pink-700 mb-4">
          Customer List
        </h3>
        <div className="table-scroll">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-pink-100 text-pink-700">
                <th className="p-3 text-left font-semibold">ID</th>
                <th className="p-3 text-left font-semibold">Name</th>
                <th className="p-3 text-left font-semibold">Email</th>
                <th className="p-3 text-left font-semibold">Phone</th>
                <th className="p-3 text-left font-semibold">Birthday</th>
                <th className="p-3 text-left font-semibold">Profile Picture</th>
                <th className="p-3 text-left font-semibold">Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-3 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((customer, index) => (
                  <tr
                    key={customer.user_id}
                    className={`border-b border-pink-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-pink-50 transition duration-200`}
                  >
                    <td className="p-3">{customer.user_id}</td>
                    <td className="p-3">{customer.name}</td>
                    <td className="p-3">{customer.email}</td>
                    <td className="p-3">{customer.phone}</td>
                    <td className="p-3">
                      {customer.birthday
                        ? new Date(customer.birthday).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "-"}
                    </td>
                    <td className="p-3">
                      {customer.profile_picture ? (
                        <img
                          src={`data:image/jpeg;base64,${customer.profile_picture}`}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/40")
                          }
                        />
                      ) : (
                        <img
                          src="https://via.placeholder.com/40"
                          alt="No Profile"
                          className="h-10 w-10 rounded-full"
                        />
                      )}
                    </td>
                    <td className="p-3">
                      {new Date(customer.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-3 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <button
        className="flex items-center justify-center bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
        onClick={() => setActiveComponent("Appointments")}
      >
        <FaCalendarAlt className="mr-2 text-pink-500" /> Back to Booking
      </button>
    </div>
  );
};

export default CustomerProfiles;
