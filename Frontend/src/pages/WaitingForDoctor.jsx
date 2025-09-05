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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consultation details...</p>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Consultation not found</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">Waiting for Doctor</h1>
            <p className="opacity-90">
              Your consultation request is being processed
            </p>
          </div>

          {/* Status indicator */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
            <p className="text-center text-gray-600 text-lg mb-8">
              We're finding the best doctor for your consultation
            </p>

            {/* Consultation Details */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Problem Title</span>
                <span className="text-gray-600">
                  {consultation.problemTitle}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-gray-700">
                  Consultation Type
                </span>
                <span className="text-gray-600">
                  {consultation.consultationType}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Urgency Level</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(
                    consultation.urgency
                  )}`}
                >
                  {consultation.urgency}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Requested On</span>
                <span className="text-gray-600">
                  {new Date(consultation.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="border-t pt-4">
                <span className="font-medium text-gray-700 block mb-2">
                  Problem Description
                </span>
                <p className="text-gray-600">
                  {consultation.problemDescription}
                </p>
              </div>
            </div>

            {/* Status Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-center">
                Your consultation request has been submitted and is waiting for
                a doctor to accept it. You'll be automatically redirected when a
                doctor joins.
              </p>
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>• Most consultations are accepted within 5-10 minutes</p>
              <p>• You'll be automatically redirected when a doctor accepts</p>
              <p>
                • Keep this page open to receive updates about your consultation
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleCancelConsultation}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Cancel Consultation
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForDoctor;
