import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaHistory } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "../../api/axios";
import { toast } from 'react-hot-toast';

const Appointments = ({ setActiveComponent }) => {
  const [formData, setFormData] = useState({
    service_id: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Generate time slots (09:00 AM to 06:00 PM, hourly)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      const time = `${hour.toString().padStart(2, "0")}:00`;
      slots.push(time);
    }
    return slots;
  };

  // Check if a time slot is in the past for the current date in Sri Lanka (UTC+05:30)
  const isPastTimeSlot = (slot, selectedDate) => {
    const sriLankaNow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" })
    );
    const selectedDateStr = selectedDate.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Colombo",
    });
    const currentDateStr = sriLankaNow.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Colombo",
    });

    if (selectedDateStr !== currentDateStr) {
      return false; // Allow all slots for future dates
    }

    const [slotHour, slotMinute] = slot.split(":").map(Number);
    const slotTime = new Date(selectedDate);
    slotTime.setHours(slotHour, slotMinute, 0);

    return slotTime < sriLankaNow;
  };

  // Check if date is blocked
  const isDateBlocked = (date) => {
    const formattedDate = date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Colombo",
    });
    return blockedSlots.includes(formattedDate);
  };

  // Validate form before submission
  const validateForm = () => {
    if (!formData.service_id) {
      return "Please select a service";
    }
    if (
      !formData.appointment_date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(formData.appointment_date)
    ) {
      return "Please select a valid date";
    }
    if (isDateBlocked(new Date(formData.appointment_date))) {
      return "Selected date is blocked by admin";
    }
    if (
      !formData.appointment_time ||
      !/^\d{2}:\d{2}$/.test(formData.appointment_time)
    ) {
      return "Please select a valid time slot";
    }

    // Check if date/time is in the past
    const sriLankaNow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" })
    );
    const appointmentDateTime = new Date(
      `${formData.appointment_date}T${formData.appointment_time}:00`
    );
    if (appointmentDateTime < sriLankaNow) {
      return "Cannot book appointments in the past";
    }

    return null;
  };

  // Fetch services and time slots
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("/api/services/get-services", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setServices(response.data.services);
        console.log("Services fetched:", response.data.services);
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to fetch services");
      }
    };
    fetchServices();
    setTimeSlots(generateTimeSlots());
  }, []);

  // Fetch booked and blocked slots for selected date
  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        try {
          const formattedDate = selectedDate.toLocaleDateString("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "Asia/Colombo",
          });
          const response = await axios.get(
            `/api/appointments/available-slots/${formattedDate}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          // Normalize booked slots to HH:MM
          const normalizedBooked = response.data.bookedSlots.map((slot) =>
            slot.length > 5 ? slot.slice(0, 5) : slot
          );
          // Normalize blocked slots to HH:MM or date
          const normalizedBlocked = response.data.blockedSlots.map((slot) =>
            slot.block_time ? slot.block_time.slice(0, 5) : slot.block_date
          );
          setBookedSlots(normalizedBooked);
          setBlockedSlots(normalizedBlocked);
          console.log("Booked slots fetched:", normalizedBooked);
          console.log("Blocked slots fetched:", normalizedBlocked);
          console.log("Time slots:", timeSlots);
        } catch (err) {
          toast.error(err.response?.data?.error || "Failed to fetch slots");
        }
      };
      fetchSlots();
    }
  }, [selectedDate, timeSlots]);

  const handleDateChange = (date) => {
    // Always store in ISO format (YYYY-MM-DD) for validation
    const isoDate = date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Colombo",
    });

    setSelectedDate(date);
    setFormData((prev) => ({
      ...prev,
      appointment_date: isoDate, // e.g., 2025-09-19
      appointment_time: "", // Reset time when date changes
    }));
  };

  const handleTimeSlotSelect = (time) => {
    setFormData((prev) => ({
      ...prev,
      appointment_time: time,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "service_id" ? parseInt(value) || "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const payload = {
        service: formData.service_id,
        date: formData.appointment_date,
        time: formData.appointment_time,
        notes: formData.notes || null,
      };
      console.log("Submitting payload:", payload);
      const response = await axios.post(
        "/api/appointments/create-appointment",
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success(response.data.message);
      setFormData({
        service_id: "",
        appointment_date: "",
        appointment_time: "",
        notes: "",
      });
      setSelectedDate(null);
      setBookedSlots([]);
      setBlockedSlots([]);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to book appointment");
    }
  };

  const handleViewHistory = () => {
    if (setActiveComponent) {
      setActiveComponent("Appointment History");
    }
  };

  const handleCloseAppointment = () => {
    if (setActiveComponent) {
      setActiveComponent("Close Appointment");
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
          }
          .react-calendar__tile--active:hover {
            background: #db2777 !important; /* pink-600 */
          }
          .react-calendar__tile--now {
            background: #fce7f3 !important; /* pink-100 */
          }
          .react-calendar__tile--disabled {
            background: #e5e7eb !important; /* gray-200 */
            color: #6b7280 !important; /* gray-500 */
            cursor: not-allowed;
          }
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaCalendarAlt className="mr-3 text-pink-500" /> Book an Appointment
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Schedule your next salon visit with ease. Select a date from the
        calendar, choose an available time slot, and complete the booking form.
      </p>
      <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 mb-8 hover:shadow-2xl transition duration-300">
        <h3 className="text-xl font-semibold text-pink-700 mb-4">
          Select a Date
        </h3>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          minDate={new Date()}
          tileDisabled={({ date }) => isDateBlocked(date)}
          className="mb-6"
        />
        {selectedDate && !isDateBlocked(selectedDate) && (
          <>
            <h3 className="text-xl font-semibold text-pink-700 mb-4">
              Available Time Slots
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {timeSlots.map((slot) => {
                const isDisabled =
                  bookedSlots.includes(slot) ||
                  blockedSlots.includes(slot) ||
                  isPastTimeSlot(slot, selectedDate);
                return (
                  <button
                    key={slot}
                    onClick={() => handleTimeSlotSelect(slot)}
                    disabled={isDisabled}
                    className={`p-3 rounded-xl font-semibold transition duration-300 ${
                      isDisabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : formData.appointment_time === slot
                        ? "bg-pink-500 text-white"
                        : "bg-pink-100 text-pink-700 hover:bg-pink-200 hover:scale-105"
                    }`}
                  >
                    {new Date(`1970-01-01T${slot}:00`).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </button>
                );
              })}
            </div>
          </>
        )}
        {selectedDate && isDateBlocked(selectedDate) && (
          <p className="text-red-500 font-semibold">
            This date is blocked by admin and cannot be booked.
          </p>
        )}
        {formData.appointment_date && formData.appointment_time && (
          <form onSubmit={handleSubmit}>
            <h3 className="text-xl font-semibold text-pink-700 mb-4">
              Complete Your Booking
            </h3>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Selected Date
              </label>
              <input
                type="text"
                value={new Date(formData.appointment_date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
                className="w-full p-3 border border-pink-200 rounded-xl bg-gray-100 text-gray-700"
                disabled
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Selected Time
              </label>
              <input
                type="text"
                value={new Date(
                  `1970-01-01T${formData.appointment_time}:00`
                ).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
                className="w-full p-3 border border-pink-200 rounded-xl bg-gray-100 text-gray-700"
                disabled
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Select Service
              </label>
              <select
                name="service_id"
                value={formData.service_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white"
                required
              >
                <option value="" disabled>
                  Select a service
                </option>
                {services.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.name} (LKR {service.price})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white resize-none"
                rows="4"
                placeholder="Any special requests?"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Book Appointment
            </button>
          </form>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className="flex items-center justify-center bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleViewHistory}
        >
          <FaHistory className="mr-2 text-pink-500" /> View Appointment History
        </button>
        <button
          className="flex items-center justify-center bg-white px-6 py-3 rounded-xl font-semibold text-pink-700 hover:bg-pink-100 hover:text-pink-500 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleCloseAppointment}
        >
          <FaCalendarAlt className="mr-2 text-pink-500" /> Cancel or Reschedule
        </button>
      </div>
    </div>
  );
};

export default Appointments;
