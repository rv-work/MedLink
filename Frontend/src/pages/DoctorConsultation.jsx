import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import io from "socket.io-client";

const DoctorConsultation = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState("connecting");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [user, setUser] = useState(null);

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  // WebRTC Configuration
  const pcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);

    initializeConsultation();
    return () => {
      cleanup();
    };
  }, [consultationId]);

  const initializeConsultation = async () => {
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
        setNotes(data.consultation.notes || "");
        if (data.consultation.status === "accepted") {
          await initializeVideoCall();
        }
      }
    } catch (error) {
      console.error("Error initializing consultation:", error);
      toast.error("Failed to load consultation");
    } finally {
      setLoading(false);
    }
  };

  const initializeVideoCall = async () => {
    try {
      // Initialize socket connection
      socketRef.current = io("https://medlink-bh5c.onrender.com");

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize peer connection
      peerConnectionRef.current = new RTCPeerConnection(pcConfig);

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setCallStatus("connected");
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("webrtc-ice-candidate", {
            consultationId,
            candidate: event.candidate,
            targetUserId: consultation.patient._id,
          });
        }
      };

      // Socket event listeners
      socketRef.current.on("user-joined", async ({ userId, userType }) => {
        if (userType === "patient") {
          // Create offer for patient
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);

          socketRef.current.emit("webrtc-offer", {
            consultationId,
            offer,
            targetUserId: userId,
          });
        }
      });

      socketRef.current.on("webrtc-answer", async ({ answer }) => {
        await peerConnectionRef.current.setRemoteDescription(answer);
        setCallStatus("connected");
      });

      socketRef.current.on("webrtc-ice-candidate", async ({ candidate }) => {
        await peerConnectionRef.current.addIceCandidate(candidate);
      });

      socketRef.current.on(
        "consultation-message",
        ({ message, sender, timestamp }) => {
          setMessages((prev) => [
            ...prev,
            { message, sender, timestamp, isOwn: false },
          ]);
        }
      );

      socketRef.current.on("user-left", () => {
        setCallStatus("ended");
        toast.info("Patient has left the consultation");
      });

      // Join consultation room as doctor
      socketRef.current.emit("join-consultation", {
        consultationId,
        userId: user?.id || user?._id,
        userType: "doctor",
      });

      // Start the consultation
      socketRef.current.emit("consultation-started", { consultationId });
    } catch (error) {
      console.error("Error initializing video call:", error);
      toast.error("Failed to initialize video call");
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      const messageData = {
        message: newMessage,
        sender: user?.name || "Doctor",
        timestamp: new Date(),
      };

      socketRef.current.emit("consultation-message", {
        consultationId,
        ...messageData,
      });

      setMessages((prev) => [...prev, { ...messageData, isOwn: true }]);
      setNewMessage("");
    }
  };

  const saveNotes = async () => {
    try {
      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/consultation/${consultationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ notes }),
        }
      );

      if (response.ok) {
        toast.success("Notes saved successfully");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    }
  };

  const endConsultation = async () => {
    if (!window.confirm("Are you sure you want to end this consultation?")) {
      return;
    }

    try {
      // Save notes and update status
      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/consultation/${consultationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: "completed", notes }),
        }
      );

      if (response.ok) {
        if (socketRef.current) {
          socketRef.current.emit("consultation-ended", { consultationId });
        }
        setCallStatus("ended");
        toast.success("Consultation completed successfully");
      }
    } catch (error) {
      console.error("Error ending consultation:", error);
      toast.error("Failed to end consultation");
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (callStatus === "ended") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold mb-4">Consultation Completed</h2>
          <p className="text-gray-300 mb-8">
            Patient consultation has been successfully completed.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate("/doctor/consultants")}
              className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              View More Consultations
            </button>
            <button
              onClick={() => navigate("/doctor-dashboard")}
              className="w-full px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Patient Consultation</h1>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                callStatus === "connected" ? "bg-green-500" : "bg-yellow-500"
              }`}
            ></div>
            <span className="text-sm capitalize">{callStatus}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium">
            {consultation?.patient?.name || "Patient"}
          </p>
          <p className="text-sm text-gray-300">
            {consultation?.consultationType}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative bg-black">
          {/* Remote Video (Patient) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local Video (Doctor) - Picture in Picture */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-12 h-12 bg-gray-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-xl">👨‍⚕️</span>
                  </div>
                  <p className="text-sm">Camera Off</p>
                </div>
              </div>
            )}
          </div>

          {/* Call Status Overlay */}
          {callStatus === "connecting" && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">
                  Connecting to Patient...
                </h3>
                <p className="text-gray-300">Establishing secure connection</p>
              </div>
            </div>
          )}

          {/* Patient Info Overlay */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
            <h3 className="font-semibold">{consultation?.problemTitle}</h3>
            <p className="text-sm text-gray-300">
              {consultation?.consultationType} • {consultation?.urgency}
            </p>
          </div>
        </div>

        {/* Right Sidebar - Chat and Notes */}
        <div className="w-96 bg-white flex flex-col">
          {/* Tab Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex">
              <button className="flex-1 px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600 bg-white">
                Chat
              </button>
              <button
                onClick={() => document.getElementById("notesTab").click()}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Notes
              </button>
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Start a conversation with your patient</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        msg.isOwn
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.isOwn ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {msg.sender} •{" "}
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Notes Section (Hidden by default, shown when Notes tab is clicked) */}
          <div id="notesSection" className="hidden flex-1 flex flex-col">
            <div className="flex-1 p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Patient Information
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p>
                    <strong>Name:</strong> {consultation?.patient?.name}
                  </p>
                  <p>
                    <strong>Problem:</strong> {consultation?.problemTitle}
                  </p>
                  <p>
                    <strong>Type:</strong> {consultation?.consultationType}
                  </p>
                  <p>
                    <strong>Urgency:</strong> {consultation?.urgency}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Problem Description
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  {consultation?.problemDescription}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Consultation Notes
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your consultation notes here..."
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={saveNotes}
                  className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition duration-200 ${
              isAudioEnabled
                ? "bg-gray-600 text-white hover:bg-gray-500"
                : "bg-red-600 text-white hover:bg-red-500"
            }`}
          >
            {isAudioEnabled ? "🎤" : "🚫🎤"}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition duration-200 ${
              isVideoEnabled
                ? "bg-gray-600 text-white hover:bg-gray-500"
                : "bg-red-600 text-white hover:bg-red-500"
            }`}
          >
            {isVideoEnabled ? "📹" : "🚫📹"}
          </button>

          {/* Save Notes */}
          <button
            onClick={saveNotes}
            className="w-12 h-12 rounded-full bg-green-600 text-white hover:bg-green-700 transition duration-200 flex items-center justify-center"
          >
            💾
          </button>

          {/* End Call */}
          <button
            onClick={endConsultation}
            className="w-12 h-12 rounded-full bg-red-600 text-white hover:bg-red-700 transition duration-200 flex items-center justify-center"
          >
            📞
          </button>
        </div>

        {/* Consultation Info */}
        <div className="mt-4 text-center text-gray-300 text-sm">
          <p>
            {consultation?.problemTitle} • {consultation?.consultationType} •{" "}
            {consultation?.urgency} Priority
          </p>
        </div>
      </div>

      {/* Tab Switching Script */}
      <input
        id="notesTab"
        type="checkbox"
        className="hidden"
        onChange={(e) => {
          const chatSection = document.querySelector(".flex-1.flex.flex-col");
          const notesSection = document.getElementById("notesSection");
          const chatTab = document.querySelector('[class*="border-blue-600"]')
            .parentElement.children[0];
          const notesTabBtn = document.querySelector(
            '[class*="border-blue-600"]'
          ).parentElement.children[1];

          if (e.target.checked) {
            chatSection.classList.add("hidden");
            notesSection.classList.remove("hidden");
            notesSection.classList.add("flex-1", "flex", "flex-col");
            chatTab.classList.remove(
              "text-blue-600",
              "border-blue-600",
              "bg-white"
            );
            chatTab.classList.add("text-gray-500");
            notesTabBtn.classList.remove("text-gray-500");
            notesTabBtn.classList.add(
              "text-blue-600",
              "border-blue-600",
              "bg-white"
            );
          } else {
            chatSection.classList.remove("hidden");
            notesSection.classList.add("hidden");
            notesSection.classList.remove("flex-1", "flex", "flex-col");
            chatTab.classList.add(
              "text-blue-600",
              "border-blue-600",
              "bg-white"
            );
            chatTab.classList.remove("text-gray-500");
            notesTabBtn.classList.add("text-gray-500");
            notesTabBtn.classList.remove(
              "text-blue-600",
              "border-blue-600",
              "bg-white"
            );
          }
        }}
      />
    </div>
  );
};

export default DoctorConsultation;
