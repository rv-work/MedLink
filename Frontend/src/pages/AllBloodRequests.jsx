import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FiDroplet,
  FiClock,
  FiMapPin,
  FiPhone,
  FiMail,
  FiFilter,
  FiSearch,
  FiAlertCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const AllBloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bloodGroup: "",
    urgency: "",
    city: "",
    state: "",
  });
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBloodRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage]);

  const fetchBloodRequests = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...Object.fromEntries(
          // eslint-disable-next-line no-unused-vars
          Object.entries(filters).filter(([_, value]) => value),
        ),
      });

      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/blood/requests/all?${queryParams}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setRequests(data.data.requests);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching blood requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/blood/requests/${requestId}/respond`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: "I am interested in donating" }),
        },
      );

      const data = await response.json();
      if (data.success) {
        alert(
          "Response submitted successfully! The doctor will contact you soon.",
        );
        fetchBloodRequests();
      } else {
        alert(data.message || "Failed to submit response");
      }
    } catch (error) {
      console.error("Error responding to request:", error);
      alert("Error submitting response");
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

  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      "A+": "bg-red-100 text-red-600",
      "A-": "bg-red-200 text-red-700",
      "B+": "bg-blue-100 text-blue-600",
      "B-": "bg-blue-200 text-blue-700",
      "AB+": "bg-purple-100 text-purple-600",
      "AB-": "bg-purple-200 text-purple-700",
      "O+": "bg-green-100 text-green-600",
      "O-": "bg-green-200 text-green-700",
    };
    return colors[bloodGroup] || "bg-gray-100 text-gray-600";
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
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Blood Requests
          </h1>
          <p className="text-gray-600 text-lg">
            Help save lives by responding to blood requests in your area
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center mb-4">
            <FiFilter className="mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              Filter Requests
            </h3>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <select
              value={filters.bloodGroup}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, bloodGroup: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Blood Groups</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                (group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ),
              )}
            </select>

            <select
              value={filters.urgency}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, urgency: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Urgency Levels</option>
              {["Critical", "High", "Medium", "Low"].map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, city: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />

            <input
              type="text"
              placeholder="State"
              value={filters.state}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, state: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Requests Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {requests.map((request, index) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`px-4 py-2 rounded-full font-bold text-lg ${getBloodGroupColor(
                        request.bloodGroup,
                      )}`}
                    >
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
                  </div>
                  <div className="text-right">
                    <p className="text-red-100 text-sm">Units Required</p>
                    <p className="text-2xl font-bold">
                      {request.unitsRequired}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-red-100">
                  <FiClock className="mr-2" />
                  <span>
                    Required by:{" "}
                    {new Date(request.requiredBy).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Hospital Info */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {request.hospital.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <FiMapPin className="mr-2" />
                    <span>
                      {request.hospital.address}, {request.hospital.city},{" "}
                      {request.hospital.state}
                    </span>
                  </div>
                  {request.hospital.contactNumber && (
                    <div className="flex items-center text-gray-600">
                      <FiPhone className="mr-2" />
                      <span>{request.hospital.contactNumber}</span>
                    </div>
                  )}
                </div>

                {/* Patient Info */}
                {request.patient && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Patient Information
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
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
                        <p className="col-span-2">
                          <span className="font-medium">Condition:</span>{" "}
                          {request.patient.condition}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {request.description && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600">{request.description}</p>
                  </div>
                )}

                {/* Doctor Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Requested By
                  </h4>
                  <div className="text-sm">
                    <p>
                      <span className="font-medium">Dr.</span>{" "}
                      {request.requestedBy.user.name}
                    </p>
                    <p>
                      <span className="font-medium">Specialization:</span>{" "}
                      {request.requestedBy.specialization}
                    </p>
                    <p>
                      <span className="font-medium">Experience:</span>{" "}
                      {request.requestedBy.experienceYears} years
                    </p>
                    <div className="flex items-center mt-2 text-gray-600">
                      <FiMail className="mr-2" />
                      <span>{request.requestedBy.user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Responses */}
                {request.responses.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Responses ({request.responses.length})
                    </h4>
                    <div className="text-sm text-gray-600">
                      {
                        request.responses.filter(
                          (r) => r.status === "Interested",
                        ).length
                      }{" "}
                      interested donors
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleRespondToRequest(request._id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold"
                  >
                    <FiDroplet className="inline mr-2" />I Want to Donate
                  </button>
                  <Link
                    to={`/blood/request/${request._id}`}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center space-x-2"
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>

            <span className="px-4 py-2 bg-red-500 text-white rounded-lg">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, pagination.totalPages),
                )
              }
              disabled={!pagination.hasNext}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FiAlertCircle className="mx-auto text-6xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Blood Requests Found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or check back later for new requests.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AllBloodRequests;
