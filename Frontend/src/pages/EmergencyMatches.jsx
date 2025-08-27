import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  ChevronRight,
  MapPin,
  Camera,
  AlertTriangle,
  Loader,
} from "lucide-react";

const EmergencyMatches = () => {
  const [requestingHelp, setRequestingHelp] = useState({});
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [emergencyFormData, setEmergencyFormData] = useState({
    hospitalName: "",
    address: "",
    situation: "",
    description: "",
    photo: null,
    coordinates: null,
  });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [pendingEmergency, setPendingEmergency] = useState(null);
  const [checkingApproval, setCheckingApproval] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState(null);

  // Fetch matches on component mount
  useEffect(() => {
    fetchEmergencyMatches();
  }, []);

  const fetchEmergencyMatches = async () => {
    try {
      setLoadingMatches(true);
      setError(null);

      // Get current user ID from localStorage, URL params, or context
      const currentUserId =
        localStorage.getItem("userId") ||
        new URLSearchParams(window.location.search).get("userId") ||
        "507f1f77bcf86cd799439011"; // fallback

      const response = await fetch(
        `/api/users/emergency-matches/${currentUserId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`, // if you use auth
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.matches) {
        setMatches(data.matches);
      } else {
        setError("No emergency matches found");
      }
    } catch (error) {
      console.error("Error fetching emergency matches:", error);
      setError("Failed to load emergency contacts. Please try again.");
    } finally {
      setLoadingMatches(false);
    }
  };

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEmergencyFormData((prev) => ({
            ...prev,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingLocation(false);
          alert("Unable to get location. Please enable location services.");
        }
      );
    } else {
      setLoadingLocation(false);
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEmergencyFormData((prev) => ({
          ...prev,
          photo: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendEmergencyAlert = async () => {
    if (
      !emergencyFormData.hospitalName ||
      !emergencyFormData.situation ||
      !emergencyFormData.coordinates
    ) {
      alert("Please fill all required fields and get location");
      return;
    }

    try {
      setRequestingHelp((prev) => ({ ...prev, [selectedMatch.userId]: true }));

      // Get current doctor info from localStorage or context
      const doctorName =
        localStorage.getItem("doctorName") ||
        localStorage.getItem("userName") ||
        "Dr. Unknown";

      const response = await fetch(
        `/api/emergency/send-alert/${selectedMatch.userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          },
          body: JSON.stringify({
            ...emergencyFormData,
            patientName: selectedMatch.name,
            doctorName: doctorName,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPendingEmergency(data.emergencyId);
        setShowEmergencyForm(false);
        setCheckingApproval(true);
        // Start checking for approval every 5 seconds
        checkApprovalStatus(data.emergencyId);

        // Show success message
        console.log(
          `Emergency alert sent to ${data.contactsNotified} contacts`
        );
      } else {
        throw new Error(data.message || "Failed to send emergency alert");
      }
    } catch (error) {
      console.error("Error sending emergency alert:", error);
      alert(`Failed to send emergency alert: ${error.message}`);
    } finally {
      setRequestingHelp((prev) => ({ ...prev, [selectedMatch.userId]: false }));
    }
  };

  const checkApprovalStatus = async (emergencyId) => {
    try {
      const response = await fetch(
        `/api/emergency/check-approval/${emergencyId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to check status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "approved") {
        setCheckingApproval(false);
        // Redirect to critical data page
        window.location.href = `/critical-data/${selectedMatch.userId}/${emergencyId}`;
      } else if (data.status === "rejected") {
        setCheckingApproval(false);
        alert(
          `Emergency request was rejected${
            data.rejectedBy ? " by " + data.rejectedBy : ""
          }.`
        );
        setPendingEmergency(null);
      } else if (data.status === "pending") {
        // Continue checking after 5 seconds
        setTimeout(() => checkApprovalStatus(emergencyId), 5000);
      }
    } catch (error) {
      console.error("Error checking approval status:", error);
      // Retry after 5 seconds on error
      setTimeout(() => checkApprovalStatus(emergencyId), 5000);
    }
  };

  const handleSendRequest = (match) => {
    setSelectedMatch(match);
    setShowEmergencyForm(true);
    // Get location immediately when form opens
    getCurrentLocation();
  };

  const getRankSuffix = (index) => {
    const rank = index + 1;
    if (rank === 1) return "st";
    if (rank === 2) return "nd";
    if (rank === 3) return "rd";
    return "th";
  };

  const getScoreColor = (score) => {
    if (score >= 0.9) return "text-green-600";
    if (score >= 0.8) return "text-blue-600";
    if (score >= 0.7) return "text-orange-600";
    return "text-gray-600";
  };

  const getScoreLabel = (score) => {
    if (score >= 0.9) return "Excellent Match";
    if (score >= 0.8) return "Good Match";
    if (score >= 0.7) return "Fair Match";
    return "Low Match";
  };

  // Show loading state while fetching matches
  if (loadingMatches) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading emergency contacts...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to Load Contacts
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchEmergencyMatches}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center mx-auto"
          >
            <Loader className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (checkingApproval) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Waiting for Approval
          </h2>
          <p className="text-gray-600 mb-4">
            Emergency request sent to <strong>{selectedMatch?.name}</strong>
          </p>
          <p className="text-sm text-gray-500">
            We've notified their emergency contacts. Please wait for approval...
          </p>
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700">
              The patient or their trusted contacts will approve or reject this
              request.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Emergency Assistance
          </h1>
          <p className="text-gray-600">
            We found {matches.length} trusted people who can help you
          </p>
        </div>

        {/* Emergency Alert */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <span className="font-medium">Emergency Mode Active:</span> Send
                requests to your most trusted connections for immediate
                assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {matches.map((match, index) => (
            <div
              key={match.userId}
              className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <div
                      className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg
                      ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-300 to-gray-500"
                          : index === 2
                          ? "bg-gradient-to-r from-orange-400 to-orange-600"
                          : "bg-gradient-to-r from-blue-400 to-blue-600"
                      }
                    `}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {match.profilePicture ? (
                      <img
                        src={match.profilePicture}
                        alt={match.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {match.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({index + 1}
                        {getRankSuffix(index)} closest match)
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                          match.score
                        )} bg-gray-50`}
                      >
                        {getScoreLabel(match.score)}
                      </div>
                      <span className="text-sm text-gray-500">
                        Similarity: {(match.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Request Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleSendRequest(match)}
                      disabled={requestingHelp[match.userId]}
                      className={`
                        px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
                        ${
                          requestingHelp[match.userId]
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl"
                        }
                      `}
                    >
                      {requestingHelp[match.userId] ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4" />
                          <span>Send Emergency Alert</span>
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Info Bar */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Trust Score: {(match.score * 100).toFixed(1)}%</span>
                  <span>Available for Emergency Response</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> Emergency requests will
              be sent immediately to notify your trusted contacts about your
              situation.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Form Modal */}
      {showEmergencyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                  Emergency Alert Details
                </h2>
                <button
                  onClick={() => setShowEmergencyForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Sending emergency alert to:{" "}
                <strong>{selectedMatch?.name}</strong>
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Hospital Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  value={emergencyFormData.hospitalName}
                  onChange={(e) =>
                    setEmergencyFormData((prev) => ({
                      ...prev,
                      hospitalName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter hospital name"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Address
                </label>
                <textarea
                  value={emergencyFormData.address}
                  onChange={(e) =>
                    setEmergencyFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="2"
                  placeholder="Enter hospital address"
                />
              </div>

              {/* Situation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Situation *
                </label>
                <select
                  value={emergencyFormData.situation}
                  onChange={(e) =>
                    setEmergencyFormData((prev) => ({
                      ...prev,
                      situation: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select situation</option>
                  <option value="car_accident">Car Accident</option>
                  <option value="heart_attack">Heart Attack</option>
                  <option value="stroke">Stroke</option>
                  <option value="fall_injury">Fall Injury</option>
                  <option value="breathing_difficulty">
                    Breathing Difficulty
                  </option>
                  <option value="severe_bleeding">Severe Bleeding</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={emergencyFormData.description}
                  onChange={(e) =>
                    setEmergencyFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="3"
                  placeholder="Brief description of the emergency (e.g., accident with car, fell from stairs)"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Photo
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {emergencyFormData.photo && (
                    <span className="text-sm text-green-600">
                      Photo uploaded
                    </span>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Coordinates *
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={getCurrentLocation}
                    disabled={loadingLocation}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loadingLocation ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    ) : (
                      <MapPin className="h-4 w-4 mr-2" />
                    )}
                    {loadingLocation
                      ? "Getting Location..."
                      : "Get Current Location"}
                  </button>
                  {emergencyFormData.coordinates && (
                    <span className="text-sm text-green-600">
                      Location:{" "}
                      {emergencyFormData.coordinates.latitude.toFixed(4)},{" "}
                      {emergencyFormData.coordinates.longitude.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowEmergencyForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmergencyAlert}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Send Emergency Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyMatches;
