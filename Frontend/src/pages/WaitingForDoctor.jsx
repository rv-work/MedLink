import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const WaitingForDoctor = () => {
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { consultationId } = useParams();

  useEffect(() => {
    if (!consultationId) {
      toast.error("No consultation ID provided");
      navigate("/request-consultant");
      return;
    }

    fetchConsultationStatus();
    const interval = setInterval(fetchConsultationStatus, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId]);

  const fetchConsultationStatus = async () => {
    try {
      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/consultation/${consultationId}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setConsultation(data.consultation);

        // If consultation is accepted, redirect to video call
        if (data.consultation.status === "accepted") {
          toast.success("Doctor has accepted your consultation!");

          // Create video call URL with proper parameters
          const channelName = `consultation-${consultationId}`;
          const userName = `patient-${data.consultation.patient._id || "user"}`;

          navigate(
            `/patient/consultation/${consultationId}?channelName=${channelName}&userName=${userName}`
          );
        } else if (data.consultation.status === "cancelled") {
          toast.error("Consultation has been cancelled");
          navigate("/dashboard");
        } else if (data.consultation.status === "completed") {
          toast.info("Consultation has been completed");
          navigate("/dashboard");
        }
      } else {
        toast.error(data.message || "Failed to fetch consultation status");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching consultation status:", error);
      toast.error("Failed to load consultation status");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConsultation = async () => {
    if (!window.confirm("Are you sure you want to cancel this consultation?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/consultation/${consultationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: "cancelled" }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Consultation cancelled successfully");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Failed to cancel consultation");
      }
    } catch (error) {
      console.error("Error cancelling consultation:", error);
      toast.error("Failed to cancel consultation");
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Emergency":
        return "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-300 shadow-red-100";
      case "High":
        return "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 border-orange-300 shadow-orange-100";
      case "Medium":
        return "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-yellow-300 shadow-yellow-100";
      case "Low":
        return "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-300 shadow-green-100";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-300 shadow-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-3xl shadow-2xl border border-blue-100">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="animate-ping absolute inset-0 rounded-full h-16 w-16 border-2 border-blue-300 mx-auto opacity-20"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">Loading</h3>
            <p className="text-gray-600">Fetching consultation details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-3xl shadow-2xl border border-red-100">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-600 mb-2">
              Consultation Not Found
            </h3>
            <p className="text-gray-600">
              We couldn't find the consultation you're looking for.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100/50 backdrop-blur-sm">
          {/* Enhanced Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-12">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Waiting for Doctor
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Your consultation request is being processed
                  </p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-4 right-12 w-8 h-8 bg-white/20 rounded-full"></div>
          </div>

          <div className="px-8 py-8">
            {/* Enhanced Status Indicator */}
            <div className="text-center mb-10">
              <div className="relative inline-block mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="animate-ping absolute inset-0 rounded-full h-20 w-20 border-2 border-blue-300 opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Finding Your Doctor
              </h2>
              <p className="text-gray-600 text-lg">
                We're connecting you with the best available specialist
              </p>
            </div>

            {/* Enhanced Consultation Details Card */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 mb-8 border border-gray-200/50 shadow-inner">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <svg
                  className="w-6 h-6 text-blue-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Consultation Details
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700 mb-2 text-sm uppercase tracking-wide">
                      Problem Title
                    </span>
                    <span className="text-gray-900 font-medium text-lg bg-white px-4 py-3 rounded-xl border border-gray-200">
                      {consultation.problemTitle}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700 mb-2 text-sm uppercase tracking-wide">
                      Consultation Type
                    </span>
                    <span className="text-gray-900 font-medium bg-white px-4 py-3 rounded-xl border border-gray-200 capitalize">
                      {consultation.consultationType}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700 mb-2 text-sm uppercase tracking-wide">
                      Urgency Level
                    </span>
                    <span
                      className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 text-center shadow-sm ${getUrgencyColor(
                        consultation.urgency
                      )}`}
                    >
                      {consultation.urgency}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700 mb-2 text-sm uppercase tracking-wide">
                      Requested On
                    </span>
                    <span className="text-gray-900 bg-white px-4 py-3 rounded-xl border border-gray-200">
                      {new Date(consultation.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <span className="font-medium text-gray-700 block mb-3 text-sm uppercase tracking-wide">
                  Problem Description
                </span>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    {consultation.problemDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Status Message */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Status Update
                  </h4>
                  <p className="text-blue-800 leading-relaxed">
                    Your consultation request has been submitted and is waiting
                    for a doctor to accept it. You'll be automatically
                    redirected when a doctor joins.
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Info Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                What to Expect
              </h4>
              <div className="space-y-3">
                <div className="flex items-center text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                  <span>
                    Most consultations are accepted within 5-10 minutes
                  </span>
                </div>
                <div className="flex items-center text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                  <span>
                    You'll be automatically redirected when a doctor accepts
                  </span>
                </div>
                <div className="flex items-center text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                  <span>
                    Keep this page open to receive updates about your
                    consultation
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={handleCancelConsultation}
                className="group bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
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
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Cancel Consultation</span>
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="group bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-4 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
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
                    strokeWidth="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                </svg>
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForDoctor;
