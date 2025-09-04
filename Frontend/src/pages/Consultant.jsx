import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Consultant = () => {
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState("connecting");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    fetchActiveConsultation();
    initializeVideoCall();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const fetchActiveConsultation = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/consultation/active",
        { withCredentials: true }
      );

      if (response.data.success && response.data.data) {
        setActiveConsultation(response.data.data);
        setNotes(response.data.data.notes || "");
      } else {
        setMessage("No active consultation found");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error fetching consultation"
      );
    } finally {
      setLoading(false);
    }
  };

  const initializeVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setCallStatus("connected");
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setMessage("Error accessing camera/microphone");
      setCallStatus("error");
    }
  };

  const handleCompleteConsultation = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/consultation/status/${activeConsultation._id}`,
        { status: "completed", notes },
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage("Consultation completed successfully!");
        setTimeout(() => {
          window.location.href = "http://localhost:5000/consultant-requests";
        }, 2000);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error completing consultation"
      );
    }
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setCallStatus("ended");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading consultation...
      </div>
    );
  }

  if (!activeConsultation) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          No Active Consultation
        </h2>
        <p className="text-gray-600 mb-4">
          There's no active consultation session.
        </p>
        <button
          onClick={() =>
            (window.location.href = "http://localhost:5000/consultant-requests")
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-md rounded-xl p-5 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Video Consultation
        </h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>
            <strong>Patient:</strong> {activeConsultation.patient.name}
          </span>
          <span>
            <strong>Problem:</strong> {activeConsultation.problemTitle}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-200 font-medium">
            {callStatus}
          </span>
        </div>
      </div>

      {/* Messages */}
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

      {/* Video Call Section */}
      <div className="bg-white shadow-md rounded-xl p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          {/* Local video */}
          <div className="relative w-full md:w-1/2 aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
              You
            </span>
          </div>

          {/* Remote video */}
          <div className="relative w-full md:w-1/2 aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
              {activeConsultation.patient.name}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-4">
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full">
            🎤
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full">
            📹
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full"
            onClick={handleEndCall}
          >
            📞 End Call
          </button>
        </div>
      </div>

      {/* Consultation Details */}
      <div className="bg-white shadow-md rounded-xl p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Problem Details
          </h3>
          <p>
            <strong>Type:</strong> {activeConsultation.consultationType}
          </p>
          <p>
            <strong>Urgency:</strong> {activeConsultation.urgency}
          </p>
          <p>
            <strong>Description:</strong>{" "}
            {activeConsultation.problemDescription}
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Consultation Notes
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your consultation notes, diagnosis, and recommendations here..."
            rows="6"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleCompleteConsultation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Complete Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Consultant;
