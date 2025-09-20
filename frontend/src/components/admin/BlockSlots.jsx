import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaBan } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "../../api/axios";
import { toast } from 'react-hot-toast';

const BlockSlots = ({ setActiveComponent }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [blockTime, setBlockTime] = useState("");
  const [reason, setReason] = useState("");
  const [blockEntireDate, setBlockEntireDate] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);

  // Generate time slots (09:00 AM to 06:00 PM, hourly)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      const time = `${hour.toString().padStart(2, "0")}:00`;
      slots.push(time);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Fetch all blocked slots/dates on mount
  useEffect(() => {
    const fetchAllBlockedSlots = async () => {
      try {
        const response = await axios.get(
          "/api/appointments/all-blocked-slots",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setBlockedDates(response.data.blockedSlots);
        console.log("All blocked slots fetched:", response.data.blockedSlots);
      } catch (err) {
        console.error("Failed to fetch all blocked slots:", err);
      }
    };
    fetchAllBlockedSlots();
  }, []);

  // Fetch blocked slots for selected date
  useEffect(() => {
    if (selectedDate) {
      const fetchBlockedSlots = async () => {
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
          const normalizedBlocked = response.data.blockedSlots.map((slot) => ({
            block_date: slot.block_date,
            block_time: slot.block_time ? slot.block_time.slice(0, 5) : null,
            isEntireDayBlocked: slot.isEntireDayBlocked,
            reason: slot.reason || null,
          }));
          setBlockedSlots(normalizedBlocked);
          // Auto-check "Block Entire Date" if isEntireDayBlocked is true
          const entireDayBlocked = normalizedBlocked.some(
            (slot) => slot.isEntireDayBlocked
          );
          setBlockEntireDate(entireDayBlocked);
          console.log("Blocked slots for date fetched:", normalizedBlocked);
        } catch (err) {
          toast.error(
            err.response?.data?.error || "Failed to fetch blocked slots"
          );
        }
      };
      fetchBlockedSlots();
    }
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setBlockTime("");
    setReason("");
    setBlockEntireDate(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    if (!blockEntireDate && !blockTime) {
      toast.error("Please select a time slot or block the entire date");
      return;
    }

    try {
      const formattedDate = selectedDate.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Colombo",
      });
      const payload = {
        date: formattedDate,
        time: blockEntireDate ? null : blockTime,
        reason: reason || null,
        isEntireDayBlocked: blockEntireDate,
      };
      console.log("Submitting payload:", payload);
      const response = await axios.post(
        "/api/appointments/block-slots",
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success(response.data.message);
      setBlockTime("");
      setReason("");
      setBlockEntireDate(false);
      // Refresh blocked slots
      const refreshedResponse = await axios.get(
        `/api/appointments/available-slots/${formattedDate}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const normalizedBlocked = refreshedResponse.data.blockedSlots.map(
        (slot) => ({
          block_date: slot.block_date,
          block_time: slot.block_time ? slot.block_time.slice(0, 5) : null,
          isEntireDayBlocked: slot.isEntireDayBlocked,
          reason: slot.reason || null,
        })
      );
      setBlockedSlots(normalizedBlocked);
      // Refresh all blocked slots for calendar
      const allBlockedResponse = await axios.get(
        "/api/appointments/all-blocked-slots",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setBlockedDates(allBlockedResponse.data.blockedSlots);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to block slot");
    }
  };

  const handleUnblock = async (slot, isEntireDay) => {
    try {
      const formattedDate = selectedDate.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Colombo",
    });
      let response;
      if (isEntireDay) {
        const payload = {
          date: formattedDate,
          isEntireDayBlocked: true,
        };
        console.log("Unblock date payload:", payload);
        response = await axios.post("/api/appointments/unblock-date", payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        if (!slot || !/^\d{2}:\d{2}$/.test(slot)) {
          console.error("Invalid slot time:", slot);
          toast.error("Invalid time slot selected");
          return;
        }
        const payload = {
          date: formattedDate,
          time: slot,
        };
        console.log("Unblock slot payload:", payload);
        response = await axios.post(
          "/api/appointments/unblock-slots",
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      toast.success(response.data.message);
      // Refresh blocked slots
      const refreshedResponse = await axios.get(
        `/api/appointments/available-slots/${formattedDate}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const normalizedBlocked = refreshedResponse.data.blockedSlots.map(
        (slot) => ({
          block_date: slot.block_date,
          block_time: slot.block_time ? slot.block_time.slice(0, 5) : null,
          isEntireDayBlocked: slot.isEntireDayBlocked,
          reason: slot.reason || null,
        })
      );
      setBlockedSlots(normalizedBlocked);
      // Refresh all blocked slots for calendar
      const allBlockedResponse = await axios.get(
        "/api/appointments/all-blocked-slots",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setBlockedDates(allBlockedResponse.data.blockedSlots);
    } catch (err) {
      console.error("Unblock error:", err);
      toast.error(err.response?.data?.error || "Failed to unblock slot/date");
    }
  };

  // Calendar tile styling
  const tileClassName = ({ date }) => {
    const formattedDate = date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Colombo",
    });
    const isFullyBlocked = blockedDates.some(
      (slot) => slot.block_date === formattedDate && slot.isEntireDayBlocked
    );
    const hasBlockedSlots = blockedDates.some(
      (slot) => slot.block_date === formattedDate && !slot.isEntireDayBlocked
    );
    if (isFullyBlocked) {
      return "bg-red-500 text-white rounded-full";
    }
    if (hasBlockedSlots) {
      return "bg-yellow-300 text-gray-800 rounded-full";
    }
    return null;
  };

  // Disable submit button until valid date and time (or entire date) selected
  const isSubmitDisabled = !selectedDate || (!blockEntireDate && !blockTime);
  const isFullyBlocked = blockedSlots.some((slot) => slot.isEntireDayBlocked);

  // Check if a time slot is blocked
  const isTimeSlotBlocked = (slot) => {
    return blockedSlots.some(
      (s) => s.block_time === slot && !s.isEntireDayBlocked
    );
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
        `}
      </style>
      <h2 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-6 flex items-center">
        <FaBan className="mr-3 text-pink-500" /> Block Dates or Time Slots
      </h2>
      <p className="text-gray-700 text-lg mb-8">
        Block unavailable dates or specific time slots to prevent bookings.
        Select a date and choose to block the entire date or specific times.
        Entire blocked days are highlighted in red, days with blocked slots in
        yellow.
      </p>
      <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 mb-8 hover:shadow-2xl transition duration-300">
        <h3 className="text-xl font-semibold text-pink-700 mb-4">
          Select a Date
        </h3>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          minDate={new Date()}
          tileClassName={tileClassName}
          className="mb-6"
        />
        {selectedDate && (
          <>
            <h3 className="text-xl font-semibold text-pink-700 mb-4">
              Block Options
            </h3>
            {!isFullyBlocked ? (
              <>
                <div className="mb-6">
                  <label className="flex items-center text-gray-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={blockEntireDate}
                      onChange={() => setBlockEntireDate(!blockEntireDate)}
                      className="mr-2 h-5 w-5 text-pink-500 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    Block Entire Date
                  </label>
                </div>
                {!blockEntireDate && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-pink-700 mb-2">
                      Select Time Slot
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {timeSlots.map((slot) => {
                        const isBlocked = isTimeSlotBlocked(slot);
                        return (
                          <button
                            key={slot}
                            onClick={() => !isBlocked && setBlockTime(slot)}
                            disabled={isBlocked}
                            className={`p-3 rounded-xl font-semibold transition duration-300 ${
                              isBlocked
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : blockTime === slot
                                ? "bg-pink-500 text-white"
                                : "bg-pink-100 text-pink-700 hover:bg-pink-200 hover:scale-105"
                            }`}
                          >
                            {new Date(
                              `1970-01-01T${slot}:00`
                            ).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Reason (Optional)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-white resize-none"
                      rows="4"
                      placeholder="Why are you blocking this slot?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className={`w-full px-6 py-3 rounded-xl font-semibold transition duration-300 ease-in-out transform ${
                      isSubmitDisabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-pink-500 text-white hover:bg-pink-600 hover:shadow-lg hover:scale-105"
                    }`}
                  >
                    Block {blockEntireDate ? "Date" : "Time Slot"}
                  </button>
                </form>
              </>
            ) : null}
            <h3 className="text-xl font-semibold text-pink-700 mt-8 mb-4">
              Blocked Slots/Dates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {blockedSlots.length > 0 ? (
                blockedSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-100 rounded-xl"
                  >
                    <span>
                      {slot.isEntireDayBlocked
                        ? `Entire Date: ${new Date(
                            slot.block_date
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}`
                        : `Time: ${new Date(
                            `1970-01-01T${slot.block_time}:00`
                          ).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}`}
                    </span>
                    <button
                      onClick={() =>
                        handleUnblock(
                          slot.isEntireDayBlocked
                            ? slot.block_date
                            : slot.block_time,
                          slot.isEntireDayBlocked
                        )
                      }
                      className="bg-red-500 text-white px-3 py-1 rounded-xl hover:bg-red-600 transition duration-300"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No blocked slots or dates for this date.
                </p>
              )}
            </div>
          </>
        )}
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

export default BlockSlots;
