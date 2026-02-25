import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FiSave,
  FiArrowLeft,
  FiUser,
  FiDroplet,
  FiCamera,
  FiCheckCircle,
} from "react-icons/fi";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const DonorDetailsUpdate = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState(null);
  const [selectedDonor, setSelectedDonor] = useState("");
  const [formData, setFormData] = useState({
    donorId: "DON123456",
    bloodGroup: "B+",
    unitsdonated: 1,
    hospital: {
      name: "Fortis Hospital",
      address: "Sector 62, Noida",
      city: "Noida",
      state: "Uttar Pradesh",
      location: { coordinates: [77.391, 28.5355] }, // [longitude, latitude]
    },
    medicalTests: {
      hemoglobin: "14.2",
      bloodPressure: { systolic: "120", diastolic: "80" },
      weight: "72",
      temperature: "98.6",
      cleared: true,
    },
    addToCommunity: true,
    isEmergency: false,
    donorPhoto: null, // placeholder image
  });

  useEffect(() => {
    fetchRequestDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/blood/requests/${requestId}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setRequest(data.data);
        setFormData((prev) => ({
          ...prev,
          bloodGroup: data.data.bloodGroup,
          hospital: data.data.hospital,
        }));
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  const handleDonorSelect = (donor) => {
    setSelectedDonor(donor);
    setFormData((prev) => ({
      ...prev,
      donorId: donor.donor._id,
    }));
  };

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData((prev) => ({
        ...prev,
        [nested]: {
          ...prev[nested],
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      donorPhoto: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.donorId) {
      alert("Please select a donor");
      return;
    }

    if (!formData.medicalTests.cleared) {
      alert("Please confirm medical clearance");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "medicalTests" || key === "hospital") {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === "donorPhoto" && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (key !== "donorPhoto") {
          submitData.append(key, formData[key]);
        }
      });

      submitData.append("requestId", requestId);

      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/blood/donations/add",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: submitData,
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("Donor details added successfully!");
        navigate("/blood/requests/my");
      } else {
        alert(data.message || "Failed to add donor details");
      }
    } catch (error) {
      console.error("Error adding donor details:", error);
      alert("Error adding donor details");
    } finally {
      setLoading(false);
    }
  };

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <Navbar />

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
              Add Donor Details
            </h1>
            <p className="text-gray-600 text-lg">
              Record donation details for {request.bloodGroup} blood
            </p>
          </div>
        </motion.div>

        {/* Request Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Request Information
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Blood Group</p>
              <p className="text-lg font-semibold text-red-600">
                {request.bloodGroup}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Units Required</p>
              <p className="text-lg font-semibold">{request.unitsRequired}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Hospital</p>
              <p className="text-lg font-semibold">{request.hospital.name}</p>
            </div>
          </div>
        </motion.div>

        {/* Interested Donors */}
        {request.responses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Select Donor
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {request.responses.map((response) => (
                <div
                  key={response._id}
                  onClick={() => handleDonorSelect(response)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedDonor._id === response._id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">
                      {response.donorDetails.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        response.status === "Donated"
                          ? "bg-green-100 text-green-600"
                          : response.status === "Confirmed"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {response.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {response.donorDetails.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {response.donorDetails.email}
                  </p>
                  {response.donorDetails.lastDonationDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last donation:{" "}
                      {new Date(
                        response.donorDetails.lastDonationDate,
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Donation Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Donation Details */}
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <FiDroplet className="text-2xl text-red-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Donation Details
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units Donated <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={request.unitsRequired}
                  required
                  value={formData.unitsdonated}
                  onChange={(e) =>
                    handleInputChange("unitsdonated", parseInt(e.target.value))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donor Photo
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="donor-photo"
                  />
                  <label
                    htmlFor="donor-photo"
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <FiCamera />
                    <span>Upload Photo</span>
                  </label>
                  {formData.donorPhoto && (
                    <span className="text-sm text-green-600">
                      ✓ {formData.donorPhoto.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.addToCommunity}
                    onChange={(e) =>
                      handleInputChange("addToCommunity", e.target.checked)
                    }
                    className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Add to community statistics
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isEmergency}
                    onChange={(e) =>
                      handleInputChange("isEmergency", e.target.checked)
                    }
                    className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mark as emergency donation
                  </span>
                </label>
              </div>
            </div>

            {/* Right Column - Medical Tests */}
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <FiUser className="text-2xl text-blue-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Medical Tests
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hemoglobin Level (g/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="8"
                  max="20"
                  value={formData.medicalTests.hemoglobin}
                  onChange={(e) =>
                    handleInputChange(
                      "hemoglobin",
                      e.target.value,
                      "medicalTests",
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="e.g., 12.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure (mmHg)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    min="80"
                    max="200"
                    value={formData.medicalTests.bloodPressure.systolic}
                    onChange={(e) =>
                      handleInputChange(
                        "systolic",
                        e.target.value,
                        "medicalTests",
                      )
                    }
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Systolic"
                  />
                  <input
                    type="number"
                    min="40"
                    max="120"
                    value={formData.medicalTests.bloodPressure.diastolic}
                    onChange={(e) =>
                      handleInputChange(
                        "diastolic",
                        e.target.value,
                        "medicalTests",
                      )
                    }
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Diastolic"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="45"
                  max="200"
                  value={formData.medicalTests.weight}
                  onChange={(e) =>
                    handleInputChange("weight", e.target.value, "medicalTests")
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Donor weight"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="95"
                  max="105"
                  value={formData.medicalTests.temperature}
                  onChange={(e) =>
                    handleInputChange(
                      "temperature",
                      e.target.value,
                      "medicalTests",
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="e.g., 98.6"
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.medicalTests.cleared}
                    onChange={(e) =>
                      handleInputChange(
                        "cleared",
                        e.target.checked,
                        "medicalTests",
                      )
                    }
                    className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    required
                  />
                  <span className="text-sm font-medium text-green-800">
                    <FiCheckCircle className="inline mr-1" />
                    Medical tests cleared - Donor is eligible for donation
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
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
              disabled={loading || !selectedDonor}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FiSave />
              )}
              <span>{loading ? "Saving..." : "Save Donation Details"}</span>
            </button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default DonorDetailsUpdate;
