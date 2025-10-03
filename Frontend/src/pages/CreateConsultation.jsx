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
        "http://localhost:5000/api/consultation/create",
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

  const getUrgencyIcon = (level) => {
    switch (level) {
      case "Emergency":
        return "🚨";
      case "High":
        return "⚠️";
      case "Medium":
        return "📋";
      case "Low":
        return "💡";
      default:
        return "📋";
    }
  };

  const getConsultationIcon = (type) => {
    switch (type) {
      case "Cardiology":
        return "❤️";
      case "Dermatology":
        return "🧴";
      case "Neurology":
        return "🧠";
      case "Pediatrics":
        return "👶";
      case "Orthopedics":
        return "🦴";
      case "Psychiatry":
        return "🧘";
      default:
        return "🩺";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Enhanced Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Request Medical Consultation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connect with qualified healthcare professionals for expert medical
            advice and personalized care
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        Consultation Request
                      </h2>
                      <p className="text-blue-100 text-lg">
                        Fill in your details to get started
                      </p>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-4 right-12 w-8 h-8 bg-white/20 rounded-full"></div>
              </div>

              {/* Enhanced Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Problem Title */}
                <div className="group">
                  <label className=" text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    Problem Title *
                  </label>
                  <input
                    type="text"
                    name="problemTitle"
                    value={formData.problemTitle}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Persistent headache, chest pain, skin rash..."
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm group-hover:border-gray-300"
                  />
                </div>

                {/* Problem Description */}
                <div className="group">
                  <label className=" text-sm font-bold text-gray-700 mb-3 flex items-center">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Problem Description *
                  </label>
                  <textarea
                    name="problemDescription"
                    value={formData.problemDescription}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    placeholder="Please provide detailed information about your symptoms:
• When did they start?
• How severe are they?
• Any triggers or patterns?
• Previous treatments tried?
• Current medications?"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 resize-none text-gray-800 placeholder-gray-400 shadow-sm group-hover:border-gray-300"
                  />
                </div>

                {/* Consultation Type */}
                <div className="group">
                  <label className=" text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 text-purple-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"
                      />
                    </svg>
                    Consultation Type *
                  </label>
                  <div className="relative">
                    <select
                      name="consultationType"
                      value={formData.consultationType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 text-gray-800 bg-white shadow-sm appearance-none group-hover:border-gray-300"
                    >
                      {consultationTypes.map((type) => (
                        <option key={type} value={type}>
                          {getConsultationIcon(type)} {type}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Enhanced Urgency Level */}
                <div>
                  <label className=" text-sm font-bold text-gray-700 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 text-orange-600 mr-2"
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
                    Urgency Level *
                  </label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {urgencyLevels.map((level) => (
                      <label
                        key={level}
                        className="relative group cursor-pointer"
                      >
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
                          relative px-6 py-4 rounded-2xl border-2 text-center font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                          ${
                            formData.urgency === level
                              ? level === "Emergency"
                                ? "bg-gradient-to-r from-red-500 to-red-600 border-red-500 text-white shadow-red-200 shadow-lg"
                                : level === "High"
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 border-orange-500 text-white shadow-orange-200 shadow-lg"
                                : level === "Medium"
                                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-500 text-white shadow-yellow-200 shadow-lg"
                                : "bg-gradient-to-r from-green-500 to-green-600 border-green-500 text-white shadow-green-200 shadow-lg"
                              : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:border-gray-300"
                          }
                        `}
                        >
                          <div className="text-2xl mb-2">
                            {getUrgencyIcon(level)}
                          </div>
                          <div className="text-sm font-bold">{level}</div>
                          {formData.urgency === level && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-current flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-current"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Scheduled Time */}
                <div className="group">
                  <label className=" text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 text-indigo-600 mr-2"
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
                    Preferred Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleInputChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 text-gray-800 shadow-sm group-hover:border-gray-300"
                  />
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <svg
                      className="w-4 h-4 text-blue-500 mr-1"
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
                    Leave blank for immediate consultation
                  </p>
                </div>

                {/* Enhanced Submit Button */}
                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-bold py-5 px-8 rounded-2xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-2xl hover:shadow-3xl disabled:hover:scale-100 flex items-center justify-center space-x-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Request...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        <span>Request Consultation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Enhanced Side Panel */}
          <div className="space-y-6">
            {/* Why Choose Us */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg
                  className="w-8 h-8 text-blue-600 mr-3"
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
                Why Choose Us?
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🩺</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">
                      Expert Doctors
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Qualified healthcare professionals with years of
                      experience
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">
                      Secure & Private
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      End-to-end encryption ensures your privacy and data
                      security
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">
                      Video Consultation
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      High-quality video calls with crystal clear audio
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">
                      Quick Response
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Most consultations start within 5-10 minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Steps */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg
                  className="w-8 h-8 text-indigo-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                How It Works
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div className="text-gray-700 font-medium">
                    Fill out the consultation form
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div className="text-gray-700 font-medium">
                    Wait for doctor to accept
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div className="text-gray-700 font-medium">
                    Start video consultation
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div className="text-gray-700 font-medium">
                    Receive medical advice
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-3xl p-8 border-2 border-red-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚨</span>
                </div>
                <div>
                  <h4 className="font-bold text-red-800 mb-2">
                    Medical Emergency?
                  </h4>
                  <p className="text-red-700 text-sm leading-relaxed mb-4">
                    For life-threatening emergencies, please call your local
                    emergency services immediately.
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-xl font-semibold text-sm">
                    📞 Emergency: 911
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateConsultation;
