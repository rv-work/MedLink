import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const CreateConsultation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    problemTitle: "",
    problemDescription: "",
    consultationType: "General",
    urgency: "Medium",
    scheduledTime: "",
  });

  const consultationTypes = [
    "General",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Psychiatry",
    "Other",
  ];

  const urgencyLevels = ["Low", "Medium", "High", "Emergency"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/consultation/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Consultation request created successfully!");
        navigate(`/waiting-for-doctor/${data.consultation._id}`);
      } else {
        toast.error(data.message || "Failed to create consultation request");
      }
    } catch (error) {
      console.error("Error creating consultation:", error);
      toast.error("Failed to create consultation request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              Request Consultation
            </h1>
            <p className="text-blue-100 mt-2">
              Get expert medical advice from qualified doctors
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Problem Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Problem Title *
              </label>
              <input
                type="text"
                name="problemTitle"
                value={formData.problemTitle}
                onChange={handleInputChange}
                required
                placeholder="Brief title of your medical concern"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Problem Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Problem Description *
              </label>
              <textarea
                name="problemDescription"
                value={formData.problemDescription}
                onChange={handleInputChange}
                required
                rows="5"
                placeholder="Please describe your symptoms, when they started, and any relevant details..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
              />
            </div>

            {/* Consultation Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Consultation Type *
              </label>
              <select
                name="consultationType"
                value={formData.consultationType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                {consultationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Urgency Level *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {urgencyLevels.map((level) => (
                  <label key={level} className="relative">
                    <input
                      type="radio"
                      name="urgency"
                      value={level}
                      checked={formData.urgency === level}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div
                      className={`
                      px-4 py-3 rounded-lg border-2 cursor-pointer text-center font-medium transition duration-200
                      ${
                        formData.urgency === level
                          ? level === "Emergency"
                            ? "bg-red-500 border-red-500 text-white"
                            : level === "High"
                            ? "bg-orange-500 border-orange-500 text-white"
                            : level === "Medium"
                            ? "bg-yellow-500 border-yellow-500 text-white"
                            : "bg-green-500 border-green-500 text-white"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      }
                    `}
                    >
                      {level}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Scheduled Time (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Time (Optional)
              </label>
              <input
                type="datetime-local"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave blank for immediate consultation
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Request...</span>
                  </div>
                ) : (
                  "Request Consultation"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-blue-600 text-2xl mb-2">🩺</div>
            <h3 className="font-semibold text-gray-800 mb-2">Expert Doctors</h3>
            <p className="text-gray-600 text-sm">
              Get advice from qualified medical professionals
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-green-600 text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Secure & Private
            </h3>
            <p className="text-gray-600 text-sm">
              Your consultation is completely confidential
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-purple-600 text-2xl mb-2">💬</div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Video Consultation
            </h3>
            <p className="text-gray-600 text-sm">
              Face-to-face interaction with audio and video
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateConsultation;
