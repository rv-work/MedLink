import React, { useEffect, useState } from "react";
import {
  Camera,
  Shield,
  AlertTriangle,
  CheckCircle,
  User,
  Loader2,
  Phone,
  MessageSquare,
  ChevronRight,
  ArrowLeft,
  Heart,
  Clock,
  Zap,
  MapPin,
  Loader,
} from "lucide-react";

const EmergencySystem = () => {
  const [videoElement, setVideoElement] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceCaptureLoading, setFaceCaptureLoading] = useState(false);
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [matches, setMatches] = useState([]);
  const [showMatches, setShowMatches] = useState(false);
  const [requestingHelp, setRequestingHelp] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  // States for emergency form and approval
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [emergencyFormData, setEmergencyFormData] = useState({
    hospitalName: "Test1",
    address: "ok OK",
    situation: "other",
    description: "BHUJNKM",
    photo: null,
    coordinates: null,
  });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);

  useEffect(() => {
    loadModels();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isCameraActive && videoElement && videoElement.srcObject === null) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraActive, videoElement]);

  const loadModels = async () => {
    try {
      setError(null);
      setIsModelLoaded(false);
      setModelLoadingProgress(0);

      // Step 1 - Initialization
      await new Promise((resolve) => setTimeout(resolve, 500));
      setModelLoadingProgress(25);

      // Step 2 - Download weights
      await new Promise((resolve) => setTimeout(resolve, 800));
      setModelLoadingProgress(50);

      // Step 3 - Optimizing model
      await new Promise((resolve) => setTimeout(resolve, 700));
      setModelLoadingProgress(75);

      // Step 4 - Ready
      await new Promise((resolve) => setTimeout(resolve, 600));
      const data = { success: true }; // dummy API response

      if (data.success) {
        setModelLoadingProgress(100);
        setIsModelLoaded(true);
      } else {
        throw new Error("Failed to load AI models");
      }
    } catch (error) {
      console.error("Model loading error:", error);
      setError("Failed to initialize AI models. Please refresh and try again.");
      setModelLoadingProgress(0);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play();
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      setError(
        "Camera access denied. Please allow camera permissions and try again.",
      );
    }
  };

  const captureAndProcessFace = async () => {
    setFaceCaptureLoading(true);
    setError(null);

    if (!videoElement) {
      setError("Camera not ready");
      setFaceCaptureLoading(false);
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg"),
      );

      const formData = new FormData();
      formData.append("image", blob, "face.jpg");

      // Real API call for face matching
      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/emergency/match-face",
        {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Face matching failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.matches && data.matches.length > 0) {
        setSuccessMessage(
          `${data.matches.length} trusted contacts found! Loading emergency contacts...`,
        );
        const stream = videoElement.srcObject;
        if (stream) stream.getTracks().forEach((track) => track.stop());
        setIsCameraActive(false);
        setMatches(data.matches);

        // Show matches after a brief delay
        setTimeout(() => {
          setShowMatches(true);
        }, 2000);
      } else {
        setError(data.message || "No matching user found in the system.");
      }
    } catch (err) {
      console.error("Face verification error:", err);
      setError("Face verification failed. Please try again.");
    }

    setFaceCaptureLoading(false);
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
        },
      );
    } else {
      setLoadingLocation(false);
      alert("Geolocation is not supported by this browser.");
    }
  };

  // const handlePhotoUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       setEmergencyFormData((prev) => ({
  //         ...prev,
  //         photo: e.target.result,
  //       }));
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEmergencyFormData((prev) => ({
        ...prev,
        photoFile: file, // Save the actual File, not Base64
      }));
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

    console.log("cord : ", emergencyFormData.coordinates);

    try {
      setRequestingHelp((prev) => ({ ...prev, [selectedMatch.userId]: true }));

      const doctorName =
        localStorage.getItem("doctorName") ||
        localStorage.getItem("userName") ||
        "Dr. Unknown";

      const formData = new FormData();
      formData.append("hospitalName", emergencyFormData.hospitalName);
      formData.append("address", emergencyFormData.address || "");
      formData.append("situation", emergencyFormData.situation);
      formData.append("description", emergencyFormData.description || "");
      formData.append(
        "coordinates",
        JSON.stringify(emergencyFormData.coordinates),
      );
      formData.append("patientName", selectedMatch.name);
      formData.append("doctorName", doctorName);

      if (emergencyFormData.photoFile) {
        formData.append("photo", emergencyFormData.photoFile);
      }

      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/emergency/send-alert/${selectedMatch.userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          },
          body: formData,
        },
      );

      const data = await response.json();
      if (data.success) {
        setShowEmergencyForm(false);
        setCheckingApproval(true);
        checkApprovalStatus(data.emergencyId);
        console.log(`Emergency alert sent successfully`);
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
        `https://medlink-bh5c.onrender.com/api/emergency/check-approval/${emergencyId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          },
        },
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
          }.`,
        );
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

  const resetSystem = () => {
    setShowMatches(false);
    setMatches([]);
    setSuccessMessage(null);
    setError(null);
    setShowEmergencyForm(false);
    setSelectedMatch(null);
    setEmergencyFormData({
      hospitalName: "",
      address: "",
      situation: "",
      description: "",
      photo: null,
      coordinates: null,
    });
    setCheckingApproval(false);
    if (isCameraActive && videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  const getRankSuffix = (index) => {
    const rank = index + 1;
    if (rank === 1) return "st";
    if (rank === 2) return "nd";
    if (rank === 3) return "rd";
    return "th";
  };

  const getScoreColor = (score) => {
    if (score >= 0.9) return "text-emerald-600 bg-emerald-50";
    if (score >= 0.8) return "text-blue-600 bg-blue-50";
    if (score >= 0.7) return "text-amber-600 bg-amber-50";
    return "text-gray-600 bg-gray-50";
  };

  const getScoreLabel = (score) => {
    if (score >= 0.9) return "Excellent Match";
    if (score >= 0.8) return "Good Match";
    if (score >= 0.7) return "Fair Match";
    return "Low Match";
  };

  // Approval waiting screen
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
          <button
            onClick={() => {
              setCheckingApproval(false);
            }}
            className="mt-6 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel Request
          </button>
        </div>
      </div>
    );
  }

  // Face Recognition Interface
  if (!showMatches) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-black text-white flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-red-500/30 rounded-full animate-pulse delay-75"></div>
              <Shield className="w-10 h-10 text-red-400 relative z-10" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Emergency Access
            </h1>
            <p className="text-gray-300 text-lg">
              AI-Powered Face Recognition Security
            </p>
            <div className="flex items-center justify-center mt-4 text-sm text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              {currentTime.toLocaleTimeString()}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Model Loading */}
            {!isModelLoaded && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-300 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Loading AI Models
                  </span>
                  <span className="text-sm text-gray-300 font-mono">
                    {modelLoadingProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 h-3 rounded-full transition-all duration-300 shadow-lg"
                    style={{ width: `${modelLoadingProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Initializing neural networks...
                </p>
              </div>
            )}

            {/* Camera Interface */}
            {isModelLoaded && (
              <>
                {!isCameraActive ? (
                  <div className="text-center">
                    <div className="mb-8">
                      <div className="relative mx-auto w-24 h-24 mb-6">
                        <Camera className="w-24 h-24 text-gray-400 mx-auto" />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full"></div>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        Ready for Face Scan
                      </h3>
                      <p className="text-gray-300 mb-6 leading-relaxed">
                        Position your face in the camera frame for emergency
                        contact identification
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCameraActive(true)}
                      className="w-full bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-700 hover:via-red-700 hover:to-red-800 text-white font-semibold py-5 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-red-500/30"
                    >
                      <Camera className="w-6 h-6 inline mr-3" />
                      Activate Emergency Scanner
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Video Feed */}
                    <div className="relative rounded-2xl overflow-hidden border-2 border-red-400/50 mb-6 bg-black/50 shadow-2xl">
                      <video
                        ref={(el) => setVideoElement(el)}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-72 object-cover"
                      />

                      {/* Scanning Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-4 border-2 border-red-500/60 rounded-2xl">
                          {/* Corner indicators */}
                          <div className="absolute -top-1 -left-1 w-8 h-8 border-l-3 border-t-3 border-red-400"></div>
                          <div className="absolute -top-1 -right-1 w-8 h-8 border-r-3 border-t-3 border-red-400"></div>
                          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-3 border-b-3 border-red-400"></div>
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-3 border-b-3 border-red-400"></div>
                        </div>

                        {/* Scanning line */}
                        <div className="absolute top-8 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent animate-pulse"></div>
                      </div>

                      {/* Processing Overlay */}
                      {faceCaptureLoading && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                          <div className="text-center">
                            <div className="relative mb-4">
                              <Loader2 className="w-12 h-12 animate-spin text-red-400 mx-auto" />
                              <div className="absolute inset-0 w-12 h-12 border-2 border-red-400/30 rounded-full animate-ping mx-auto"></div>
                            </div>
                            <p className="text-white font-medium">
                              Analyzing biometric data...
                            </p>
                            <p className="text-gray-300 text-sm mt-1">
                              Please hold still
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Capture Button */}
                    <button
                      onClick={captureAndProcessFace}
                      disabled={faceCaptureLoading}
                      className="w-full bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:via-emerald-700 hover:to-emerald-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-5 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-xl disabled:cursor-not-allowed border border-emerald-500/30"
                    >
                      {faceCaptureLoading ? (
                        <>
                          <Loader2 className="w-6 h-6 inline mr-3 animate-spin" />
                          Scanning & Processing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-6 h-6 inline mr-3" />
                          Start Emergency Scan
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Messages */}
            {error && (
              <div className="mt-6 bg-red-500/10 border border-red-400/30 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-start">
                  <AlertTriangle className="w-6 h-6 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-red-300 font-semibold text-sm">
                      System Error
                    </p>
                    <p className="text-red-200 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mt-6 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-300 font-semibold text-sm">
                      Success
                    </p>
                    <p className="text-emerald-200 text-sm mt-1">
                      {successMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm flex items-center justify-center">
              <Shield className="w-4 h-4 mr-2" />
              Secure AI-powered emergency response system
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Emergency Matches Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={resetSystem}
            className="absolute top-8 left-8 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Scanner
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4 rounded-full shadow-xl">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Emergency Assistance Ready
          </h1>
          <p className="text-gray-600 text-lg">
            Found{" "}
            <span className="font-semibold text-red-600">{matches.length}</span>{" "}
            trusted contacts nearby who can help you
          </p>

          <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            Last updated: {currentTime.toLocaleString()}
          </div>
        </div>

        {/* Emergency Status Alert */}
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 p-6 mb-8 rounded-r-2xl shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-800">
                Emergency Mode Active
              </h3>
              <p className="text-red-700 mt-1">
                Your location has been shared. Send emergency requests to your
                most trusted connections for immediate assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="font-semibold text-gray-900">Call 911</p>
                <p className="text-sm text-gray-600">Emergency Services</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="font-semibold text-gray-900">Share Location</p>
                <p className="text-sm text-gray-600">GPS Coordinates</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="font-semibold text-gray-900">Broadcast Alert</p>
                <p className="text-sm text-gray-600">All Contacts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="space-y-6">
          {matches.map((match, index) => (
            <div
              key={match.userId}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
            >
              <div className="p-8">
                <div className="flex items-center space-x-6">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <div
                      className={`
                        w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg
                        ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                            : index === 1
                              ? "bg-gradient-to-r from-gray-400 to-gray-600"
                              : index === 2
                                ? "bg-gradient-to-r from-orange-400 to-orange-600"
                                : "bg-gradient-to-r from-blue-500 to-blue-700"
                        }
                      `}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Profile Section */}
                  <div className="flex-shrink-0 relative">
                    {match.profilePicture ? (
                      <img
                        src={match.profilePicture}
                        alt={match.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center shadow-lg">
                        <User className="h-10 w-10 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  {/* User Information */}
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {match.name}
                      </h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {index + 1}
                        {getRankSuffix(index)} closest match
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                          match.score,
                        )}`}
                      >
                        {getScoreLabel(match.score)}
                      </div>
                      <span className="text-sm text-gray-600">
                        Trust Score: {(match.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 space-y-3">
                    <button
                      onClick={() => handleSendRequest(match)}
                      disabled={requestingHelp[match.userId]}
                      className={`
                        w-full px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 text-lg
                        ${
                          requestingHelp[match.userId]
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transform hover:scale-105 shadow-lg hover:shadow-xl"
                        }
                      `}
                    >
                      {requestingHelp[match.userId] ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                          <span>Sending Alert...</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-5 w-5" />
                          <span>Send Emergency Alert</span>
                          <ChevronRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Available Now
                    </span>
                    <span>Verified Emergency Contact</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Match Confidence: {Math.round(match.score * 100)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-900">
                Emergency Protocol Active
              </h3>
            </div>
            <p className="text-blue-700 leading-relaxed">
              Emergency requests include your current location, contact
              information, and timestamp. Your trusted contacts will receive
              immediate notifications about your situation.
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
                  className="text-gray-400 hover:text-gray-600 text-2xl"
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

export default EmergencySystem;
