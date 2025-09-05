// pages/RequestConsultant.jsx - Modified to redirect to waiting screen
import React, { useState } from "react";
import axios from "axios";

const RequestConsultant = () => {
  const [formData, setFormData] = useState({
    problemTitle: "",
    problemDescription: "",
    consultationType: "General",
    urgency: "Medium",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/consultation/create",
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setMessage("Consultation request submitted successfully!");

        // Redirect to waiting screen after successful submission
        setTimeout(() => {
          window.location.href = "/waiting-for-doctor";
        }, 1500);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error submitting request");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Request Medical Consultation
        </h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-center text-sm font-medium ${
              message.includes("successfully")
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="problemTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Problem Title *
            </label>
            <input
              type="text"
              id="problemTitle"
              name="problemTitle"
              value={formData.problemTitle}
              onChange={handleChange}
              placeholder="Brief title of your health concern"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="consultationType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Consultation Type *
            </label>
            <select
              id="consultationType"
              name="consultationType"
              value={formData.consultationType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {consultationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="urgency"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Urgency Level *
            </label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {urgencyLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="problemDescription"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Detailed Description *
            </label>
            <textarea
              id="problemDescription"
              name="problemDescription"
              value={formData.problemDescription}
              onChange={handleChange}
              placeholder="Please describe your symptoms, duration, and any other relevant details..."
              rows="6"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestConsultant;
