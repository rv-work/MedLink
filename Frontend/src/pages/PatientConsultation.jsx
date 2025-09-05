import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import io from "socket.io-client";

const PatientConsultation = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState("connecting"); // connecting, connected, ended
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
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
    // Get user info from localStorage or context
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);

    initializeConsultation();
    return () => {
      cleanup();
    };
  }, [consultationId]);

  const initializeConsultation = async () => {
    try {
      // Fetch consultation details
      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/consultation/${consultationId}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        setConsultation(data.consultation);
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
            targetUserId: consultation.doctor._id,
          });
        }
      };

      // Socket event listeners
      socketRef.current.on("webrtc-offer", async ({ offer, from }) => {
        await peerConnectionRef.current.setRemoteDescription(offer);
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        socketRef.current.emit("webrtc-answer", {
          consultationId,
          answer,
          targetUserId: from,
        });
      });

      socketRef.current.on("webrtc-answer", async ({ answer }) => {
        await peerConnectionRef.current.setRemoteDescription(answer);
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

      socketRef.current.on("consultation-ended", () => {
        setCallStatus("ended");
        toast.info("Doctor has ended the consultation");
      });

      socketRef.current.on("user-left", () => {
        setCallStatus("ended");
        toast.info("Doctor has left the consultation");
      });

      // Join consultation room
      socketRef.current.emit("join-consultation", {
        consultationId,
        userId: user?.id || user?._id,
        userType: "patient",
      });
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
        sender: user?.name || "Patient",
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

  const endConsultation = async () => {
    if (!window.confirm("Are you sure you want to end this consultation?")) {
      return;
    }

    try {
      // Update consultation status
      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/consultation/${consultationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: "completed" }),
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
            Thank you for using our consultation service.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Video Consultation</h1>
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
            {consultation?.doctor?.name || "Doctor"}
          </p>
          <p className="text-sm text-gray-300">
            {consultation?.consultationType}
          </p>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-black">
          {/* Remote Video (Doctor) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local Video (Patient) - Picture in Picture */}
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
                    <span className="text-xl">👤</span>
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
                  Connecting to Doctor...
                </h3>
                <p className="text-gray-300">
                  Please wait while we establish the connection
                </p>
              </div>
            </div>
          )}

          {/* No Remote Stream Placeholder */}
          {callStatus === "connected" && !remoteVideoRef.current?.srcObject && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">👨‍⚕️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Waiting for Doctor's Video
                </h3>
                <p className="text-gray-300">Doctor is joining the call...</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-white border-l border-gray-300 flex flex-col">
          {/* Chat Header */}
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Consultation Chat</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Start a conversation with your doctor</p>
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
            {isAudioEnabled ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9 4a1 1 0 011-1h.01a1 1 0 011 1v6a1 1 0 01-1 1H10a1 1 0 01-1-1V4zM7 8a1 1 0 00-2 0v2a5 5 0 1010 0V8a1 1 0 10-2 0v2a3 3 0 11-6 0V8z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 3.293a1 1 0 010 1.414L15.414 6l1.293 1.293a1 1 0 01-1.414 1.414L14 7.414l-1.293 1.293a1 1 0 01-1.414-1.414L12.586 6l-1.293-1.293a1 1 0 011.414-1.414L14 4.586l1.293-1.293a1 1 0 011.414 0zM9 4a1 1 0 011-1h.01a1 1 0 011 1v6a1 1 0 01-1 1H10a1 1 0 01-1-1V4zM7 8a1 1 0 00-2 0v2a5 5 0 1010 0V8a1 1 0 10-2 0v2a3 3 0 11-6 0V8z"
                  clipRule="evenodd"
                />
              </svg>
            )}
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
            {isVideoEnabled ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* End Call */}
          <button
            onClick={endConsultation}
            className="w-12 h-12 rounded-full bg-red-600 text-white hover:bg-red-700 transition duration-200 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Consultation Info */}
        <div className="mt-4 text-center text-gray-300 text-sm">
          <p>
            {consultation?.problemTitle} • {consultation?.consultationType}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientConsultation;
