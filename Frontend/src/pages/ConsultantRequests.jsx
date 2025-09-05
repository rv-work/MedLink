import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ConsultantRequests = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    consultationType: "All",
    urgency: "",
    status: "pending",
  });

  const consultationTypes = [
    "All",
    "General",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Psychiatry",
    "Other",
  ];

  const urgencyLevels = ["", "Low", "Medium", "High", "Emergency"];

  useEffect(() => {
    fetchConsultations();
  }, [filters]);

  const fetchConsultations = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) queryParams.append(key, filters[key]);
      });

      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/consultation/doctor/requests?${queryParams}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        setConsultations(data.consultations);
      }
    } catch (error) {
      console.error("Error fetching consultations:", error);
      toast.error("Failed to load consultation requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptConsultation = async (consultationId) => {
    try {
      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/consultation/${consultationId}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            scheduledTime: new Date(),
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Consultation accepted successfully!");
        // Navigate to consultation room
        navigate(`/doctor/consultation/${consultationId}`);
      } else {
        toast.error(data.message || "Failed to accept consultation");
      }
    } catch (error) {
      console.error("Error accepting consultation:", error);
      toast.error("Failed to accept consultation");
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Emergency":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consultation requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Consultation Requests
          </h1>
          <p className="text-gray-600">
            Review and accept patient consultation requests
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Type
              </label>
              <select
                value={filters.consultationType}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    consultationType: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {consultationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <select
                value={filters.urgency}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, urgency: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Urgency Levels</option>
                {urgencyLevels
                  .filter((level) => level)
                  .map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Consultation Cards */}
        <div className="space-y-4">
          {consultations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🩺</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Consultation Requests
              </h3>
              <p className="text-gray-500">
                There are no consultation requests matching your filters.
              </p>
            </div>
          ) : (
            consultations.map((consultation) => (
              <div
                key={consultation._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {consultation.problemTitle}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(
                          consultation.urgency
                        )}`}
                      >
                        {consultation.urgency}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {consultation.consultationType}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Patient
                        </p>
                        <div className="flex items-center space-x-2">
                          <img
                            src={
                              consultation.patient.profilePicture ||
                              "/api/placeholder/32/32"
                            }
                            alt={consultation.patient.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-gray-800">
                              {consultation.patient.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {consultation.patient.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Requested On
                        </p>
                        <p className="text-gray-800">
                          {formatDate(consultation.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Problem Description
                      </p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {consultation.problemDescription}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() =>
                      navigate(`/consultation/${consultation._id}`)
                    }
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition duration-200"
                  >
                    View Details
                  </button>
                  {consultation.status === "pending" && (
                    <button
                      onClick={() => handleAcceptConsultation(consultation._id)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium"
                    >
                      Accept Consultation
                    </button>
                  )}
                  {consultation.status === "accepted" && (
                    <button
                      onClick={() =>
                        navigate(`/doctor/consultation/${consultation._id}`)
                      }
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                    >
                      Join Consultation
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultantRequests;
