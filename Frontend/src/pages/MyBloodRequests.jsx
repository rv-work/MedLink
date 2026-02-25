import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiUsers,
  FiClock,
  FiMapPin,
  FiPlus,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const MyBloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/blood/requests/my",
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error("Error fetching my requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/blood/requests/${requestId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const data = await response.json();
      if (data.success) {
        fetchMyRequests();
        alert("Status updated successfully");
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `https://medlink-bh5c.onrender.com/api/blood/requests/${requestId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();
        if (data.success) {
          fetchMyRequests();
          alert("Request deleted successfully");
        } else {
          alert(data.message || "Failed to delete request");
        }
      } catch (error) {
        console.error("Error deleting request:", error);
        alert("Error deleting request");
      }
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (filter === "all") return true;
    return request.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-600";
      case "Fulfilled":
        return "bg-blue-100 text-blue-600";
      case "Cancelled":
        return "bg-red-100 text-red-600";
      case "Expired":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Critical":
        return "bg-red-500 text-white";
      case "High":
        return "bg-orange-500 text-white";
      case "Medium":
        return "bg-yellow-500 text-white";
      case "Low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              My Blood Requests
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and track your blood requests
            </p>
          </div>
          <Link
            to="/blood/requests/create"
            className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
          >
            <FiPlus />
            <span>Create New Request</span>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-800">
                  {requests.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiEye className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {requests.filter((r) => r.status === "Active").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="text-green-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Fulfilled</p>
                <p className="text-3xl font-bold text-blue-600">
                  {requests.filter((r) => r.status === "Fulfilled").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Responses</p>
                <p className="text-3xl font-bold text-purple-600">
                  {requests.reduce((acc, r) => acc + r.responses.length, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FiUsers className="text-purple-500 text-xl" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex space-x-4">
            {["all", "active", "fulfilled", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 text-sm">
                  (
                  {status === "all"
                    ? requests.length
                    : requests.filter((r) => r.status.toLowerCase() === status)
                        .length}
                  )
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white text-red-600 px-4 py-2 rounded-full font-bold text-lg">
                      {request.bloodGroup}
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getUrgencyColor(
                          request.urgency,
                        )}`}
                      >
                        {request.urgency}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          request.status,
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-100 text-sm">Units Required</p>
                    <p className="text-2xl font-bold">
                      {request.unitsRequired}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left Column - Hospital Info */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      {request.hospital.name}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <FiMapPin className="mr-2" />
                        <span className="text-sm">
                          {request.hospital.address}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FiClock className="mr-2" />
                        <span className="text-sm">
                          Required by:{" "}
                          {new Date(request.requiredBy).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column - Patient Info */}
                  <div>
                    {request.patient && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Patient Information
                        </h4>
                        <div className="space-y-1 text-sm">
                          {request.patient.name && (
                            <p>
                              <span className="font-medium">Name:</span>{" "}
                              {request.patient.name}
                            </p>
                          )}
                          {request.patient.age && (
                            <p>
                              <span className="font-medium">Age:</span>{" "}
                              {request.patient.age}
                            </p>
                          )}
                          {request.patient.condition && (
                            <p>
                              <span className="font-medium">Condition:</span>{" "}
                              {request.patient.condition}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {request.description && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Description
                        </h4>
                        <p className="text-sm text-gray-600">
                          {request.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Responses */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Responses ({request.responses.length})
                    </h4>
                    {request.responses.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {request.responses.map((response) => (
                          <div
                            key={response._id}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">
                                  {response.donorDetails.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {response.donorDetails.phone}
                                </p>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  response.status === "Donated"
                                    ? "bg-green-100 text-green-600"
                                    : response.status === "Confirmed"
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-yellow-100 text-yellow-600"
                                }`}
                              >
                                {response.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No responses yet</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
                  {request.status === "Active" && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(request._id, "Fulfilled")
                        }
                        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <FiCheckCircle />
                        <span>Mark Fulfilled</span>
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(request._id, "Cancelled")
                        }
                        className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <FiXCircle />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}

                  <Link
                    to={`/blood/request/${request._id}/edit`}
                    className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FiEdit2 />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => handleDeleteRequest(request._id)}
                    className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <FiTrash2 />
                    <span>Delete</span>
                  </button>

                  <Link
                    to={`/blood/donor-update/${request._id}`}
                    className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <FiUsers />
                    <span>Add Donor</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredRequests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl text-gray-400 mb-4">🩸</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {filter === "all"
                ? "No Requests Found"
                : `No ${
                    filter.charAt(0).toUpperCase() + filter.slice(1)
                  } Requests`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === "all"
                ? "You haven't created any blood requests yet."
                : `You don't have any ${filter} requests at the moment.`}
            </p>
            {filter === "all" && (
              <Link
                to="/blood/requests/create"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
              >
                <FiPlus />
                <span>Create Your First Request</span>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyBloodRequests;
