import React, { useState, useEffect } from "react";
import axios from "axios";

const ConsultantRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get(
        "https://medlink-bh5c.onrender.com/api/consultation/pending",
        { withCredentials: true }
      );

      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error fetching requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await axios.put(
        `https://medlink-bh5c.onrender.com/api/consultation/accept/${requestId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage("Request accepted successfully!");
        setRequests((prev) => prev.filter((req) => req._id !== requestId));

        setTimeout(() => {
          window.location.href = `/doctor/consultation/${requestId}`;
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error accepting request");
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Emergency":
        return "bg-red-500 text-white";
      case "High":
        return "bg-orange-500 text-white";
      case "Medium":
        return "bg-yellow-400 text-black";
      case "Low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading consultation requests...
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Pending Consultation Requests
      </h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-center text-sm font-medium ${
            message.includes("successfully")
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="flex justify-center items-center h-40 bg-white rounded-xl shadow-md">
          <p className="text-gray-600">
            No pending consultation requests at the moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {request.problemTitle}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                    request.urgency
                  )}`}
                >
                  {request.urgency}
                </span>
              </div>

              {/* Details */}
              <div className="text-sm text-gray-600 space-y-1 mb-3">
                <p>
                  <strong>Patient:</strong> {request.patient.name}
                </p>
                <p>
                  <strong>Type:</strong> {request.consultationType}
                </p>
                <p>
                  <strong>Submitted:</strong>{" "}
                  {new Date(request.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Problem Description */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 text-sm">
                  Problem Description:
                </h4>
                <p className="text-gray-600 text-sm mt-1">
                  {request.problemDescription}
                </p>
              </div>

              {/* Actions */}
              <button
                onClick={() => handleAcceptRequest(request._id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Accept & Start Consultation
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsultantRequests;
