import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import io from "socket.io-client";

const PatientConsultation = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState("connecting");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const isInitialized = useRef(false);

  // WebRTC Configuration with multiple STUN servers
  const pcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun.services.mozilla.com" },
      {
        urls: "turn:turn.anyfirewall.com:443?transport=tcp",
        username: "webrtc",
        credential: "webrtc",
      },
    ],
    iceCandidatePoolSize: 10,
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("User data loaded:", userData);

    // Validate user data before proceeding
    if (!userData || (!userData.id && !userData._id && !userData.userId)) {
      console.error("❌ No valid user data found in localStorage");
      toast.error("User not authenticated. Please login again.");
      navigate("/login");
      return;
    }

    setUser(userData);
    initializeConsultation();

    return () => {
      cleanup();
    };
  }, [consultationId]);

  const initializeConsultation = async () => {
    try {
      console.log("🏥 Initializing consultation...");
      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/consultation/${consultationId}`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (data.success) {
        console.log("✅ Consultation data loaded:", data.consultation);
        setConsultation(data.consultation);

        if (data.consultation.status === "accepted") {
          await initializeVideoCall();
        } else {
          setCallStatus("waiting");
          console.log("⏳ Waiting for doctor to accept consultation");
        }
      } else {
        toast.error(data.message || "Failed to load consultation");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("❌ Error initializing consultation:", error);
      toast.error("Failed to load consultation");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const initializeVideoCall = async () => {
    if (isInitialized.current) {
      console.log("⚠️ Video call already initialized");
      return;
    }

    // Check if user data is available
    if (!user || (!user.id && !user._id && !user.userId)) {
      console.error("❌ Cannot initialize video call: user data not available");
      toast.error("User authentication error. Please refresh the page.");
      return;
    }

    isInitialized.current = true;
    console.log("🚀 Starting video call initialization...");

    try {
      // Step 1: Get user media first
      await getUserMedia();

      // Step 2: Initialize Socket.IO
      await initializeSocket();

      // Step 3: Set up peer connection
      await setupPeerConnection();

      console.log("✅ Video call initialization completed");
    } catch (error) {
      console.error("❌ Error initializing video call:", error);
      toast.error("Failed to initialize video call: " + error.message);
      setCallStatus("failed");
      isInitialized.current = false;
    }
  };

  const getUserMedia = async () => {
    try {
      console.log("🎥 Getting user media...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log("✅ User media obtained:", stream);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error("❌ Error getting user media:", error);
      throw new Error(`Camera/Microphone access denied: ${error.message}`);
    }
  };

  const initializeSocket = () => {
    return new Promise((resolve, reject) => {
      console.log("🔌 Connecting to Socket.IO server...");

      socketRef.current = io("https://medlink-bh5c.onrender.com", {
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Socket.IO connected:", socketRef.current.id);
        setupSocketEvents();
        resolve();
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        reject(error);
      });

      // Set timeout for connection
      setTimeout(() => {
        if (!socketRef.current.connected) {
          reject(new Error("Socket connection timeout"));
        }
      }, 10000);
    });
  };

  const setupSocketEvents = () => {
    const socket = socketRef.current;

    // Handle consultation ready signal
    socket.on("consultation-ready", ({ participants, patient, doctor }) => {
      console.log("🎯 Consultation ready:", { participants, patient, doctor });
      setCallStatus("negotiating");
    });

    // Handle start call instruction
    socket.on("start-call", ({ targetUserId, role }) => {
      console.log(`📞 Start call as ${role} with target:`, targetUserId);
      if (role === "receiver") {
        setCallStatus("waiting_for_offer");
        console.log("⏳ Waiting for offer from doctor...");
      }
    });

    // Handle WebRTC offer
    socket.on("webrtc-offer", async ({ offer, from, fromType }) => {
      console.log(`📨 Received offer from ${fromType}:`, from);

      if (peerConnectionRef.current && offer) {
        try {
          await peerConnectionRef.current.setRemoteDescription(offer);
          console.log("✅ Remote description set");

          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          console.log("✅ Answer created and local description set");

          socket.emit("webrtc-answer", {
            consultationId,
            answer,
            targetUserId: from,
          });
          console.log("📤 Answer sent to doctor");

          setCallStatus("connecting");
        } catch (error) {
          console.error("❌ Error handling offer:", error);
          toast.error("Failed to process video call offer");
        }
      }
    });

    // Handle ICE candidates
    socket.on("webrtc-ice-candidate", async ({ candidate, from }) => {
      console.log(`🧊 Received ICE candidate from ${from}`);

      if (peerConnectionRef.current && candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(candidate);
          console.log("✅ ICE candidate added");
        } catch (error) {
          console.error("❌ Error adding ICE candidate:", error);
        }
      }
    });

    // Handle consultation messages
    socket.on("consultation-message", ({ message, sender, timestamp }) => {
      console.log("💬 New message from:", sender);
      setMessages((prev) => [
        ...prev,
        { message, sender, timestamp, isOwn: false },
      ]);
    });

    // Handle consultation ended
    socket.on("consultation-ended", () => {
      console.log("🔚 Consultation ended by doctor");
      setCallStatus("ended");
      toast.info("Doctor has ended the consultation");
    });

    // Handle user left
    socket.on("user-left", ({ userId, userType, reason }) => {
      console.log(`👋 ${userType} ${userId} left:`, reason);
      setCallStatus("ended");
      toast.info("Doctor has left the consultation");
    });

    // Handle WebRTC errors
    socket.on("webrtc-error", ({ message, targetUserId }) => {
      console.error("❌ WebRTC error:", message);
      toast.error(`Connection error: ${message}`);
    });
  };

  const setupPeerConnection = async () => {
    try {
      console.log("🔗 Setting up peer connection...");

      peerConnectionRef.current = new RTCPeerConnection(pcConfig);
      const pc = peerConnectionRef.current;

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          console.log("➕ Adding track to peer connection:", track.kind);
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log("📺 Remote track received:", event.track.kind);

        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setCallStatus("connected");
          console.log("✅ Remote video stream connected");
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          console.log("🧊 Sending ICE candidate");
          socketRef.current.emit("webrtc-ice-candidate", {
            consultationId,
            candidate: event.candidate,
            targetUserId: consultation?.doctor?._id,
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log(`🔄 Connection state changed: ${state}`);

        if (state === "connected") {
          setCallStatus("connected");
          setConnectionAttempts(0);
        } else if (state === "failed") {
          console.error("❌ WebRTC connection failed");
          setCallStatus("failed");
          handleConnectionFailure();
        } else if (state === "disconnected") {
          setCallStatus("connecting");
        } else if (state === "closed") {
          setCallStatus("ended");
        }

        // Notify server about connection state
        if (socketRef.current) {
          socketRef.current.emit("webrtc-connection-state", {
            consultationId,
            state,
            targetUserId: consultation?.doctor?._id,
          });
        }
      };

      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        console.log(`🧊 ICE connection state: ${pc.iceConnectionState}`);

        if (pc.iceConnectionState === "failed") {
          console.log("🔄 ICE connection failed, attempting restart...");
          pc.restartIce();
        }
      };

      // Get userId safely with fallback
      const userId = user?.id || user?._id || user?.userId;

      // Final validation before joining
      if (!userId) {
        throw new Error("Unable to get user ID for joining consultation");
      }

      console.log("👤 Joining consultation as patient:", userId);

      socketRef.current.emit("join-consultation", {
        consultationId,
        userId: userId.toString(),
        userType: "patient",
      });
    } catch (error) {
      console.error("❌ Error setting up peer connection:", error);
      throw error;
    }
  };

  const handleConnectionFailure = () => {
    setConnectionAttempts((prev) => prev + 1);

    if (connectionAttempts < 3) {
      console.log(
        `🔄 Retrying connection (attempt ${connectionAttempts + 1}/3)...`
      );
      setTimeout(() => {
        restartConnection();
      }, 2000);
    } else {
      console.error("❌ Max connection attempts reached");
      toast.error(
        "Unable to establish video connection. Please refresh the page."
      );
    }
  };

  const restartConnection = async () => {
    try {
      console.log("🔄 Restarting connection...");

      // Close existing peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      // Set up new peer connection
      await setupPeerConnection();
    } catch (error) {
      console.error("❌ Error restarting connection:", error);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log(`📹 Video ${videoTrack.enabled ? "enabled" : "disabled"}`);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        console.log(`🎤 Audio ${audioTrack.enabled ? "enabled" : "disabled"}`);
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current && user) {
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
      console.log("💬 Message sent:", messageData.message);
    }
  };

  const endConsultation = async () => {
    if (!window.confirm("Are you sure you want to end this consultation?")) {
      return;
    }

    try {
      console.log("🔚 Ending consultation...");

      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/consultation/${consultationId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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
      console.error("❌ Error ending consultation:", error);
      toast.error("Failed to end consultation");
    }
  };

  const cleanup = () => {
    console.log("🧹 Cleaning up resources...");

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log(`🛑 Stopped ${track.kind} track`);
      });
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      console.log("🔗 Closed peer connection");
    }

    if (socketRef.current) {
      socketRef.current.emit("leave-consultation", { consultationId });
      socketRef.current.disconnect();
      console.log("🔌 Disconnected socket");
    }

    isInitialized.current = false;
  };

  // Status display helpers
  const getStatusMessage = () => {
    switch (callStatus) {
      case "connecting":
        return "Establishing connection...";
      case "negotiating":
        return "Setting up video call...";
      case "waiting_for_offer":
        return "Waiting for doctor to start video...";
      case "failed":
        return "Connection failed. Retrying...";
      case "connected":
        return "Connected";
      default:
        return "Please wait...";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (callStatus === "ended") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-semibold mb-2">Consultation Complete</h2>
          <p className="text-gray-600 mb-4">
            Thank you for using our consultation service.
          </p>
          <button
            onClick={() => navigate("/patient/consultations")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Consultations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Debug Info */}
        <div className="mb-4 p-3 bg-yellow-100 rounded-lg text-sm">
          <strong>Debug:</strong> Status: {callStatus} | User ID:{" "}
          {user?.id || user?._id || user?.userId || "not found"} | Attempts:{" "}
          {connectionAttempts}/3
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div
                className="relative bg-black rounded-lg overflow-hidden"
                style={{ aspectRatio: "16/9" }}
              >
                {/* Remote Video */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!isVideoEnabled && (
                    <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
                      <span className="text-white text-xs">Camera Off</span>
                    </div>
                  )}
                </div>

                {/* Connection Status Overlay */}
                {callStatus !== "connected" && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-lg">{getStatusMessage()}</p>
                      <p className="text-sm text-gray-300 mt-1">
                        {callStatus === "failed"
                          ? `Retrying... (${connectionAttempts}/3)`
                          : "Please wait while we connect you to the doctor"}
                      </p>
                      {callStatus === "failed" && (
                        <button
                          onClick={restartConnection}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Retry Now
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Controls */}
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full transition-colors ${
                    isAudioEnabled
                      ? "bg-gray-200 hover:bg-gray-300"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                  title={isAudioEnabled ? "Mute" : "Unmute"}
                >
                  {isAudioEnabled ? "🎤" : "🔇"}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoEnabled
                      ? "bg-gray-200 hover:bg-gray-300"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                  title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                >
                  {isVideoEnabled ? "📹" : "📷"}
                </button>

                <button
                  onClick={endConsultation}
                  className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition-colors"
                >
                  End Call
                </button>
              </div>
            </div>
          </div>

          {/* Chat and Info Section */}
          <div className="space-y-4">
            {/* Doctor Info */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-2">
                {consultation?.doctor?.name || "Doctor"}
              </h3>
              <p className="text-sm text-gray-600">
                {consultation?.consultationType}
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    callStatus === "connected"
                      ? "bg-green-400"
                      : callStatus === "connecting" ||
                        callStatus === "negotiating"
                      ? "bg-yellow-400"
                      : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-xs text-gray-500">
                  {callStatus === "connected" ? "Online" : "Connecting..."}
                </span>
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3">Chat</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Start a conversation with your doctor
                  </p>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg text-sm ${
                        msg.isOwn ? "bg-blue-100 ml-4" : "bg-gray-100 mr-4"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {msg.sender} •{" "}
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Consultation Details */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-2">Consultation Details</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Problem:</strong> {consultation?.problemTitle}
                </p>
                <p>
                  <strong>Type:</strong> {consultation?.consultationType} •{" "}
                  <strong>Priority:</strong> {consultation?.urgency}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientConsultation;
