import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FiSave,
  FiArrowLeft,
  FiMapPin,
  FiUser,
  FiDroplet,
  FiClock,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const CreateBloodRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospital: {
      name: "Apollo Hospital",
      address: "123 MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      contactNumber: "+91 9876543210",
      location: {
        coordinates: [77.5946, 12.9716], // [longitude, latitude]
      },
    },
    patient: {
      name: "Rahul Sharma",
      age: "32",
      condition: "Accident trauma",
    },
    bloodGroup: "O+",
    urgency: "High",
    unitsRequired: 3,
    requiredBy: "2025-09-30T18:00", // ISO datetime string
    description: "Urgent requirement for surgery due to severe injuries.",
    isPublic: true,
  });

  const handleInputChange = (section, field, value) => {
    if (section === "patient" || section === "hospital") {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.hospital.name ||
      !formData.hospital.address ||
      !formData.bloodGroup ||
      !formData.requiredBy
    ) {
      alert("Please fill all required fields");
      return;
    }

    // Check if required date is in the future
    const requiredDate = new Date(formData.requiredBy);
    const today = new Date();
    if (requiredDate <= today) {
      alert("Required date must be in the future");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/blood/requests/create",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("Blood request created successfully!");
        navigate("/blood/requests/my");
      } else {
        alert(data.message || "Failed to create blood request");
      }
    } catch (error) {
      console.error("Error creating blood request:", error);
      alert("Error creating blood request");
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date as minimum date for required by field
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <Link
            to="/blood/requests/my"
            className="mr-4 p-2 bg-white rounded-lg shadow hover:shadow-md transition-all"
          >
            <FiArrowLeft className="text-xl text-gray-600" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Create Blood Request
            </h1>
            <p className="text-gray-600 text-lg">
              Request blood for your patients
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Hospital & Patient Info */}
            <div className="space-y-8">
              {/* Hospital Information */}
              <div>
                <div className="flex items-center mb-6">
                  <FiMapPin className="text-2xl text-red-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Hospital Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.hospital.name}
                      onChange={(e) =>
                        handleInputChange("hospital", "name", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Enter hospital name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.hospital.address}
                      onChange={(e) =>
                        handleInputChange("hospital", "address", e.target.value)
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Enter complete hospital address"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.hospital.city}
                        onChange={(e) =>
                          handleInputChange("hospital", "city", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.hospital.state}
                        onChange={(e) =>
                          handleInputChange("hospital", "state", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={formData.hospital.contactNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "hospital",
                          "contactNumber",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Hospital contact number"
                    />
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div>
                <div className="flex items-center mb-6">
                  <FiUser className="text-2xl text-blue-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Patient Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      value={formData.patient.name}
                      onChange={(e) =>
                        handleInputChange("patient", "name", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Patient's name (optional for privacy)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={formData.patient.age}
                      onChange={(e) =>
                        handleInputChange("patient", "age", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Patient's age"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Condition
                    </label>
                    <input
                      type="text"
                      value={formData.patient.condition}
                      onChange={(e) =>
                        handleInputChange(
                          "patient",
                          "condition",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Brief description of condition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Blood Request Details */}
            <div className="space-y-8">
              {/* Blood Request Details */}
              <div>
                <div className="flex items-center mb-6">
                  <FiDroplet className="text-2xl text-red-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Blood Request Details
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.bloodGroup}
                      onChange={(e) =>
                        handleInputChange("", "bloodGroup", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Blood Group</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.urgency}
                      onChange={(e) =>
                        handleInputChange("", "urgency", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    >
                      {["Critical", "High", "Medium", "Low"].map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Units Required <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={formData.unitsRequired}
                      onChange={(e) =>
                        handleInputChange(
                          "",
                          "unitsRequired",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Number of units needed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required By <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={minDate}
                      value={formData.requiredBy}
                      onChange={(e) =>
                        handleInputChange("", "requiredBy", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("", "description", e.target.value)
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Additional details about the blood requirement (optional)"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) =>
                          handleInputChange("", "isPublic", e.target.checked)
                        }
                        className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Make this request public (visible to all donors)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Urgency Information */}
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-3">
                  Urgency Level Guidelines
                </h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>
                    <strong>Critical:</strong> Immediate need, life-threatening
                    situation
                  </p>
                  <p>
                    <strong>High:</strong> Within 24 hours, urgent surgical
                    cases
                  </p>
                  <p>
                    <strong>Medium:</strong> Within 2-3 days, planned procedures
                  </p>
                  <p>
                    <strong>Low:</strong> Within a week, routine requirements
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-end space-x-4 mt-8 pt-8 border-t"
          >
            <Link
              to="/blood/requests/my"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FiSave />
              )}
              <span>{loading ? "Creating..." : "Create Request"}</span>
            </button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateBloodRequest;
