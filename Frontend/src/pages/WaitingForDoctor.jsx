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
      navigate("/request-consultant");
      return;
    }

    fetchConsultationStatus();
    const interval = setInterval(fetchConsultationStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
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

        // If consultation is accepted, redirect to consultation room
        if (data.consultation.status === "accepted") {
          toast.success("Doctor has accepted your consultation!");
          navigate(`/patient/consultation/${consultationId}`);
        }
      }
    } catch (error) {
      console.error("Error fetching consultation status:", error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consultation details...</p>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Consultation Not Found
          </h2>
          <button
            onClick={() => navigate("/request-consultant")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Request New Consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Waiting Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Waiting for Doctor</h1>
                <p className="text-blue-100">
                  Your consultation request is being processed
                </p>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="p-8">
            <div className="flex items-center justify-center mb-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Looking for Available Doctor
                </h2>
                <p className="text-gray-600">
                  We're finding the best doctor for your consultation
                </p>
              </div>
            </div>

            {/* Consultation Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Consultation Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Problem Title
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {consultation.problemTitle}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Consultation Type
                  </p>
                  <p className="text-gray-800">
                    {consultation.consultationType}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Urgency Level
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(
                      consultation.urgency
                    )}`}
                  >
                    {consultation.urgency}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Requested On
                  </p>
                  <p className="text-gray-800">
                    {new Date(consultation.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Problem Description
                </p>
                <p className="text-gray-700 bg-white p-4 rounded-lg border">
                  {consultation.problemDescription}
                </p>
              </div>
            </div>

            {/* Status Updates */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800">
                    Status:{" "}
                    {consultation.status.charAt(0).toUpperCase() +
                      consultation.status.slice(1)}
                  </h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Your consultation request has been submitted and is waiting
                    for a doctor to accept it. You'll be automatically
                    redirected when a doctor joins.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleCancelConsultation}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
              >
                Cancel Consultation
              </button>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-blue-600 text-3xl mb-3">⏱️</div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Average Wait Time
            </h3>
            <p className="text-gray-600 text-sm">
              Most consultations are accepted within 5-10 minutes
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-green-600 text-3xl mb-3">🔔</div>
            <h3 className="font-semibold text-gray-800 mb-2">
              We'll Notify You
            </h3>
            <p className="text-gray-600 text-sm">
              You'll be automatically redirected when a doctor accepts
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-purple-600 text-3xl mb-3">📱</div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Stay on This Page
            </h3>
            <p className="text-gray-600 text-sm">
              Keep this page open to receive updates about your consultation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForDoctor;
