// pages/WaitingForDoctor.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const WaitingForDoctor = () => {
  const [requestStatus, setRequestStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeWaiting, setTimeWaiting] = useState(0);

  useEffect(() => {
    fetchRequestStatus();
    const interval = setInterval(fetchRequestStatus, 5000); // Check every 5 seconds
    const timer = setInterval(() => setTimeWaiting((prev) => prev + 1), 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const fetchRequestStatus = async () => {
    try {
      const response = await axios.get(
        "https://medlink-bh5c.onrender.com/api/consultation/my-pending",
        { withCredentials: true }
      );

      if (response.data.success) {
        const request = response.data.data;
        setRequestStatus(request);

        if (request && request.status === "accepted") {
          // Redirect to patient consultation page
          window.location.href = `/consultation/${request._id}`;
        }
      }
    } catch (error) {
      console.error("Error fetching request status:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const cancelRequest = async () => {
    try {
      await axios.put(
        `https://medlink-bh5c.onrender.com/api/consultation/cancel/${requestStatus._id}`,
        {},
        { withCredentials: true }
      );
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error canceling request:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Animated waiting icon */}
        <div className="mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 rounded-full mx-auto animate-ping opacity-75"></div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Waiting for Doctor
        </h2>
        <p className="text-gray-600 mb-6">
          We're connecting you with an available doctor. Please wait...
        </p>

        {requestStatus && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Your Request:</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Problem:</strong> {requestStatus.problemTitle}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Type:</strong> {requestStatus.consultationType}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Urgency:</strong>
              <span
                className={`ml-1 px-2 py-1 rounded-full text-xs ${
                  requestStatus.urgency === "Emergency"
                    ? "bg-red-100 text-red-700"
                    : requestStatus.urgency === "High"
                    ? "bg-orange-100 text-orange-700"
                    : requestStatus.urgency === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {requestStatus.urgency}
              </span>
            </p>
          </div>
        )}

        <div className="text-2xl font-mono text-blue-600 mb-6">
          {formatTime(timeWaiting)}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Average wait time: 5-10 minutes
          </div>

          <button
            onClick={cancelRequest}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Cancel Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingForDoctor;
