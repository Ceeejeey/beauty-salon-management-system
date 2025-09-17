import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "../../api/axios";

const CompletedAppointments = ({ setActiveComponent }) => {
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch completed appointments
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedDate) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        params.date = `${year}-${month}-${day}`;
        console.log("Selected date:", params.date);
      }
      if (customerName) {
        params.customer_name = customerName;
      }
      if (selectedStaffId) {
        params.staff_id = selectedStaffId;
      }
      const response = await axios.get("/api/appointments/completed", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params,
      });
      setAppointments(response.data.appointments);
      setStaff(response.data.staff);
      console.log(
        "Completed appointments fetched:",
        response.data.appointments
      );
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to fetch completed appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, customerName, selectedStaffId]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleCustomerNameChange = (e) => {
    setCustomerName(e.target.value);
  };

  const handleStaffChange = (e) => {
    setSelectedStaffId(e.target.value);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedDate(null);
    setCustomerName("");
    setSelectedStaffId("");
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
          .react-calendar {
            border: none;
            border-radius: 1.5rem;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
            background: white;
            padding: 1rem;
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
          }
          .react-calendar__tile--active {
            background: #ec4899 !important; /* pink-500 */
            color: white !important;
            border-radius: 9999px !important;
          }
          .react-calendar__tile--active:hover {
            background: #db2777 !important; /* pink-600 */
            border-radius: 9999px !important;
          }
          .react-calendar__tile--now {
            background: #fce7f3 !important; /* pink-100 */
            border-radius: 9999px !important;
          }
          .react-calendar__tile--hasActive {
            background: none !important;
          }
          .table-scroll {
            max-height: 500px;
            overflow-y: auto;
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaCheckCircle className="mr-3 text-pink-500" /> Completed Appointments
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        View all completed appointments, filtered by date, customer name, or
        beautician.
      </p>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 mb-8 hover:shadow-2xl transition duration-300">
        <h3 className="text-xl font-semibold text-pink-700 mb-4">
          Filter Appointments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Select Date
            </label>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              className="mb-4"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={handleCustomerNameChange}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Beautician
            </label>
            <select
              value={selectedStaffId}
              onChange={handleStaffChange}
              className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
            >
              <option value="">All Beauticians</option>
              {staff.map((s) => (
                <option key={s.user_id} value={s.user_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={clearFilters}
          className="mb-6 px-6 py-3 rounded-xl font-semibold bg-pink-500 text-white hover:bg-pink-600 hover:shadow-lg hover:scale-105 transition duration-300"
        >
          Clear Filters
        </button>
        <h3 className="text-xl font-semibold text-pink-700 mb-4">
          Completed Appointments
        </h3>
        <div className="table-scroll">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-pink-100 text-pink-700">
                <th className="p-3 text-left font-semibold">ID</th>
                <th className="p-3 text-left font-semibold">Customer</th>
                <th className="p-3 text-left font-semibold">Service</th>
                <th className="p-3 text-left font-semibold">Beautician</th>
                <th className="p-3 text-left font-semibold">Date</th>
                <th className="p-3 text-left font-semibold">Time</th>
                <th className="p-3 text-left font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-3 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : appointments.length > 0 ? (
                appointments.map((appt, index) => (
                  <tr
                    key={appt.appointment_id}
                    className={`border-b border-pink-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-pink-50 transition duration-200`}
                  >
                    <td className="p-3">{appt.appointment_id}</td>
                    <td className="p-3">{appt.customer_name}</td>
                    <td className="p-3">{appt.service_name}</td>
                    <td className="p-3">{appt.staff_name}</td>
                    <td className="p-3">
                      {new Date(appt.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-3">{appt.time}</td>
                    <td className="p-3">{appt.notes || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-3 text-center text-gray-500">
                    No completed appointments found.
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

export default CompletedAppointments;
