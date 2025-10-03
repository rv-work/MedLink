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
        `http://localhost:5000/api/consultation/doctor/requests?${queryParams}`,
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
        `http://localhost:5000/api/consultation/${consultationId}/accept`,
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
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg";
      case "High":
        return "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg";
      case "Medium":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md";
      case "Low":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-purple-400 animate-ping mx-auto"></div>
          </div>
          <p className="text-gray-700 text-lg font-medium">
            Loading consultation requests...
          </p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl mb-8 border border-white/20">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-12 rounded-t-3xl text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
              <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-white rounded-full"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-white/20 rounded-2xl mr-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold">Consultation Requests</h1>
              </div>
              <p className="text-blue-100 text-lg">
                Review and manage patient consultation requests with ease
              </p>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    Consultation Type
                  </span>
                </label>
                <select
                  value={filters.consultationType}
                  onChange={(e) =>
                    setFilters({ ...filters, consultationType: e.target.value })
                  }
                  className="w-full p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 font-medium text-gray-700"
                >
                  {consultationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    Urgency Level
                  </span>
                </label>
                <select
                  value={filters.urgency}
                  onChange={(e) =>
                    setFilters({ ...filters, urgency: e.target.value })
                  }
                  className="w-full p-4 bg-gradient-to-r from-gray-50 to-orange-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all duration-200 font-medium text-gray-700"
                >
                  <option value="">All Urgency Levels</option>
                  {urgencyLevels.slice(1).map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 flex items-end">
                <button
                  onClick={fetchConsultations}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh Requests
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Consultations List */}
        {consultations.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-16 text-center border border-white/20">
            <div className="text-gray-300 mb-6">
              <svg
                className="mx-auto h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">
              No Consultation Requests Found
            </h3>
            <p className="text-gray-500 text-lg">
              There are no consultation requests matching your current filters.
            </p>
            <p className="text-gray-400 mt-2">
              Try adjusting your filter criteria or check back later for new
              requests.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {consultations.map((consultation, index) => (
              <div
                key={consultation._id}
                className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/30 hover:shadow-3xl transform hover:scale-102 transition-all duration-300"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 leading-tight">
                        {consultation.problemTitle}
                      </h3>
                      <div className="flex items-center space-x-4 flex-wrap gap-2">
                        <span
                          className={`px-4 py-2 rounded-full font-semibold text-sm ${getUrgencyColor(
                            consultation.urgency
                          )} transform hover:scale-105 transition-transform duration-200`}
                        >
                          {consultation.urgency}
                        </span>
                        <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full font-medium text-sm border border-blue-200">
                          {consultation.consultationType}
                        </span>
                        <span className="px-4 py-2 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 rounded-full font-medium text-sm border border-gray-200">
                          {formatDate(consultation.createdAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleAcceptConsultation(
                          consultation._id,
                          consultation.patient?._id
                        )
                      }
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Accept Consultation</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Patient Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="font-semibold text-gray-700 min-w-[80px]">
                            Name:
                          </span>
                          <span className="text-gray-600 font-medium">
                            {consultation.patient?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-semibold text-gray-700 min-w-[80px]">
                            Email:
                          </span>
                          <span className="text-gray-600 font-medium">
                            {consultation.patient?.email || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                        <svg
                          className="w-5 h-5 mr-2 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Consultation Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="font-semibold text-gray-700 min-w-[100px]">
                            Type:
                          </span>
                          <span className="text-gray-600 font-medium">
                            {consultation.consultationType}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-semibold text-gray-700 min-w-[100px]">
                            Requested:
                          </span>
                          <span className="text-gray-600 font-medium">
                            {formatDate(consultation.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl border border-amber-100">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                      <svg
                        className="w-5 h-5 mr-2 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Problem Description
                    </h4>
                    <div className="bg-white/70 rounded-xl p-4 border border-amber-200">
                      <p className="text-gray-700 leading-relaxed font-medium">
                        {consultation.problemDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default ConsultantRequests;
