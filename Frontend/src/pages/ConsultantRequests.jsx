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
        if (filters[key] && filters[key] !== "All")
          queryParams.append(key, filters[key]);
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
      } else {
        toast.error(data.message || "Failed to load consultation requests");
      }
    } catch (error) {
      console.error("Error fetching consultations:", error);
      toast.error("Failed to load consultation requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptConsultation = async (consultationId, patientId) => {
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

        // Create video call URL with proper parameters
        const channelName = `consultation-${consultationId}`;
        const userName = `doctor-${data.doctorId || "doc"}`;

        // Navigate to consultation room with parameters
        navigate(
          `/doctor/consultation/${consultationId}?channelName=${channelName}&userName=${userName}`
        );
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consultation requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 rounded-t-xl text-white">
            <h1 className="text-3xl font-bold mb-2">Consultation Requests</h1>
            <p className="opacity-90">
              Review and accept patient consultation requests
            </p>
          </div>

          {/* Filters */}
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Type
                </label>
                <select
                  value={filters.consultationType}
                  onChange={(e) =>
                    setFilters({ ...filters, consultationType: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                    setFilters({ ...filters, urgency: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Urgency Levels</option>
                  {urgencyLevels.slice(1).map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchConsultations}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Consultations List */}
        {consultations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <p className="text-xl text-gray-500">
              There are no consultation requests matching your filters.
            </p>
            <p className="text-gray-400 mt-2">
              Try adjusting your filter criteria or check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {consultations.map((consultation) => (
              <div
                key={consultation._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {consultation.problemTitle}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span
                          className={`px-3 py-1 rounded-full font-medium border ${getUrgencyColor(
                            consultation.urgency
                          )}`}
                        >
                          {consultation.urgency}
                        </span>
                        <span>{consultation.consultationType}</span>
                        <span>{formatDate(consultation.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleAcceptConsultation(
                          consultation._id,
                          consultation.patient?._id
                        )
                      }
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Accept Consultation
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Patient Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Name:</span>{" "}
                          {consultation.patient?.name || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {consultation.patient?.email || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Consultation Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {consultation.consultationType}
                        </p>
                        <p>
                          <span className="font-medium">Requested On:</span>{" "}
                          {formatDate(consultation.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Problem Description
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {consultation.problemDescription}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantRequests;
