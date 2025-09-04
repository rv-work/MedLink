import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const VideoCall = () => {
  const { consultationId } = useParams();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState("initializing");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [remoteUserConnected, setRemoteUserConnected] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const currentUserIdRef = useRef(null);

  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  useEffect(() => {
    console.log("🔄 Component mounted, consultationId:", consultationId);

    if (consultationId) {
      initializeSocket();
      fetchConsultation();
    }

    return () => {
      console.log("🧹 Cleaning up component...");
      cleanup();
    };
  }, [consultationId]);

  // Separate useEffect for WebRTC initialization after role is set
  useEffect(() => {
    if (userRole && !peerConnectionRef.current && !loading) {
      console.log("🎥 Initializing WebRTC for role:", userRole);
      initializeWebRTC();
    }
  }, [userRole, loading]);

  const initializeSocket = () => {
    console.log("🔌 Initializing socket connection...");

    socketRef.current = io("https://medlink-bh5c.onrender.com", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server, ID:", socket.id);
      setMessage("Connected to server");
      socket.emit("join-consultation", consultationId);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      setMessage("Connection failed: " + error.message);
      setCallStatus("error");
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setMessage("Disconnected from server");
    });

    // Listen for doctor joining
    socket.on("doctor-joined", () => {
      console.log("👨‍⚕️ Doctor joined the consultation");
      setRemoteUserConnected(true);
      setMessage("Doctor joined the consultation");
    });

    // Listen for create offer request (doctor only)
    socket.on("create-offer", async () => {
      console.log("📞 Received create-offer request");
      if (userRole === "doctor") {
        console.log("👨‍⚕️ Doctor creating offer...");
        await createOffer();
      }
    });

    // Listen for offer (patient only)
    socket.on("offer", async ({ offer }) => {
      console.log("📨 Received offer");
      if (userRole === "patient") {
        console.log("👤 Patient handling offer...");
        await handleOffer(offer);
      }
    });

    // Listen for answer (doctor only)
    socket.on("answer", async ({ answer }) => {
      console.log("📬 Received answer");
      if (userRole === "doctor") {
        console.log("👨‍⚕️ Doctor handling answer...");
        await handleAnswer(answer);
      }
    });

    // Listen for ICE candidates
    socket.on("ice-candidate", async ({ candidate, from }) => {
      console.log("🧊 Received ICE candidate from:", from);
      if (from !== currentUserIdRef.current && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
          console.log("✅ ICE candidate added successfully");
        } catch (error) {
          console.error("❌ Error adding ICE candidate:", error);
        }
      }
    });

    // Listen for call ended
    socket.on("call-ended", () => {
      console.log("📞 Call ended by other participant");
      setCallStatus("ended");
      setMessage("Call ended by other participant");
      cleanup();
    });

    // Listen for participant disconnected
    socket.on("participant-disconnected", () => {
      console.log("👤 Other participant disconnected");
      setRemoteUserConnected(false);
      setMessage("Other participant disconnected");
    });

    // Listen for consultation completed
    socket.on("consultation-completed", () => {
      console.log("✅ Consultation completed");
      setMessage("Consultation completed successfully!");
      setTimeout(() => {
        if (userRole === "patient") {
          window.location.href = "/dashboard";
        }
      }, 2000);
    });
  };

  const cleanup = () => {
    console.log("🧹 Cleaning up resources...");

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        console.log("🛑 Stopping track:", track.kind);
        track.stop();
      });
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
        console.log("🔒 Peer connection closed");
      } catch (e) {
        console.error("Error closing peer connection:", e);
      }
      peerConnectionRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      console.log("🔌 Socket disconnected");
      socketRef.current = null;
    }
  };

  const fetchConsultation = async () => {
    try {
      console.log("📊 Fetching consultation data...");

      const response = await axios.get(
        `https://medlink-bh5c.onrender.com/api/consultation/${consultationId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        const consultationData = response.data.data;
        setConsultation(consultationData);
        setNotes(consultationData.notes || "");

        console.log("✅ Consultation data fetched:", consultationData);

        // Try to get current user ID from token
        try {
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

          if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            currentUserIdRef.current = payload._id;
            console.log("👤 Current user ID:", payload._id);

            if (
              consultationData.doctor &&
              payload._id === consultationData.doctor._id
            ) {
              setUserRole("doctor");
              console.log("✅ User role set: doctor");
            } else {
              setUserRole("patient");
              console.log("✅ User role set: patient");
            }
          }
        } catch (tokenError) {
          console.error("❌ Error parsing token:", tokenError);
          // Fallback: try to determine role from consultation data
          // You might need to implement a /api/user/me endpoint
          setMessage("Unable to determine user role. Please refresh.");
        }
      }
    } catch (error) {
      console.error("❌ Error fetching consultation:", error);
      setMessage("Error fetching consultation details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeWebRTC = async () => {
    try {
      console.log("🎥 Initializing WebRTC...");

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log("✅ Got user media stream");
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers,
        iceCandidatePoolSize: 10,
      });
      peerConnectionRef.current = peerConnection;

      console.log("✅ Peer connection created");

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
        console.log("➕ Added track to peer connection:", track.kind);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log("📡 Received remote stream");
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setRemoteUserConnected(true);
          setCallStatus("connected");
          setMessage("Connected successfully!");

          // Notify server about successful connection
          socketRef.current?.emit("connection-established", consultationId);
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          console.log("🧊 Sending ICE candidate");
          socketRef.current.emit("ice-candidate", {
            candidate: event.candidate.toJSON(),
            consultationId,
            from: currentUserIdRef.current,
          });
        } else if (!event.candidate) {
          console.log("🧊 ICE gathering complete");
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        console.log("🔄 Connection state changed to:", state);

        switch (state) {
          case "connecting":
            setCallStatus("connecting");
            setMessage("Connecting...");
            break;
          case "connected":
            setCallStatus("connected");
            setMessage("Connected successfully!");
            break;
          case "disconnected":
            setCallStatus("disconnected");
            setMessage("Connection lost");
            break;
          case "failed":
            setCallStatus("failed");
            setMessage("Connection failed");
            break;
          case "closed":
            setCallStatus("ended");
            setMessage("Call ended");
            break;
        }
      };

      // Handle ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        console.log(
          "🧊 ICE connection state:",
          peerConnection.iceConnectionState
        );
      };

      setCallStatus("ready");
      setMessage("Ready to start call");

      // Notify server about role after WebRTC is ready
      if (userRole === "doctor") {
        console.log("👨‍⚕️ Notifying server: doctor joined");
        socketRef.current?.emit("doctor-joined", consultationId);
      }
    } catch (error) {
      console.error("❌ Error initializing WebRTC:", error);
      setMessage("Error accessing camera/microphone: " + error.message);
      setCallStatus("error");
    }
  };

  const createOffer = async () => {
    try {
      console.log("📞 Creating offer...");

      if (!peerConnectionRef.current) {
        console.error("❌ No peer connection");
        return;
      }

      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peerConnectionRef.current.setLocalDescription(offer);
      console.log("✅ Offer created and set as local description");

      // Send offer via Socket.IO
      socketRef.current?.emit("offer", {
        offer: offer,
        consultationId,
      });

      setCallStatus("waiting-for-answer");
      setMessage("Offer sent, waiting for patient to join...");
    } catch (error) {
      console.error("❌ Error creating offer:", error);
      setMessage("Error creating offer: " + error.message);
    }
  };

  const handleOffer = async (offer) => {
    try {
      console.log("📨 Handling received offer...");

      if (!peerConnectionRef.current) {
        console.error("❌ No peer connection");
        return;
      }

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      console.log("✅ Remote description set");

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      console.log("✅ Answer created and set as local description");

      // Send answer via Socket.IO
      socketRef.current?.emit("answer", {
        answer: answer,
        consultationId,
      });

      setMessage("Connected! You can start the conversation.");
    } catch (error) {
      console.error("❌ Error handling offer:", error);
      setMessage("Error connecting to doctor: " + error.message);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      console.log("📬 Handling received answer...");

      if (!peerConnectionRef.current) {
        console.error("❌ No peer connection");
        return;
      }

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      console.log("✅ Answer processed successfully");

      setCallStatus("connected");
      setMessage("Patient connected! You can start the consultation.");
    } catch (error) {
      console.error("❌ Error handling answer:", error);
      setMessage("Error processing patient connection: " + error.message);
    }
  };

  const startCall = () => {
    console.log("🚀 Start call clicked");
    console.log("📊 Current state:");
    console.log("- User Role:", userRole);
    console.log("- Socket connected:", socketRef.current?.connected);
    console.log("- Call status:", callStatus);
    console.log("- Consultation ID:", consultationId);

    if (!socketRef.current || !socketRef.current.connected) {
      console.error("❌ Socket not connected");
      setMessage("Not connected to server. Please refresh the page.");
      return;
    }

    if (!userRole) {
      console.error("❌ User role not determined");
      setMessage("User role not determined. Please refresh the page.");
      return;
    }

    if (!peerConnectionRef.current) {
      console.error("❌ WebRTC not initialized");
      setMessage("Video system not ready. Please wait or refresh.");
      return;
    }

    if (userRole === "patient") {
      console.log("👤 Patient initiating call...");
      socketRef.current.emit("patient-ready", consultationId);
      setMessage("Connecting to doctor...");
      setCallStatus("connecting");
    } else if (userRole === "doctor") {
      console.log("👨‍⚕️ Doctor starting call manually...");
      createOffer();
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
      console.log("🎥 Video toggled:", videoTrack.enabled ? "ON" : "OFF");
    }
  };

  const toggleAudio = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
      console.log("🎤 Audio toggled:", audioTrack.enabled ? "ON" : "OFF");
    }
  };

  const handleEndCall = () => {
    console.log("📞 Ending call...");
    socketRef.current?.emit("end-call", consultationId);
    cleanup();
    setCallStatus("ended");
    setMessage("Call ended");

    setTimeout(() => {
      if (userRole === "doctor") {
        window.location.href = "/doctor/consultants";
      } else {
        window.location.href = "/dashboard";
      }
    }, 2000);
  };

  const handleCompleteConsultation = async () => {
    try {
      console.log("✅ Completing consultation...");

      const response = await axios.put(
        `https://medlink-bh5c.onrender.com/api/consultation/status/${consultationId}`,
        { status: "completed", notes },
        { withCredentials: true }
      );

      if (response.data.success) {
        socketRef.current?.emit("consultation-completed", consultationId);
        setMessage("Consultation completed successfully!");
        setTimeout(() => {
          window.location.href = "/doctor/consultants";
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Error completing consultation:", error);
      setMessage("Error completing consultation: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {userRole === "doctor" ? "Doctor" : "Patient"} Consultation
            </h1>
            <p className="text-sm text-gray-600">
              Status: <span className="capitalize">{callStatus}</span>
              {socketRef.current?.connected ? (
                <span className="ml-2 text-green-600">● Online</span>
              ) : (
                <span className="ml-2 text-red-600">● Offline</span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {consultation && (
                <span>
                  {userRole === "doctor"
                    ? consultation.patient?.name
                    : consultation.doctor?.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
            {/* Main Video Area */}
            <div className="lg:col-span-2">
              <div className="bg-black rounded-lg overflow-hidden h-full relative">
                {/* Remote Video */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Local Video (Picture in Picture) */}
                <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!isVideoEnabled && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <span className="text-white text-sm">Video Off</span>
                    </div>
                  )}
                </div>

                {/* Connection Status Overlay */}
                {!remoteUserConnected && callStatus !== "connected" && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-pulse">
                        <div className="w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        {callStatus === "ready"
                          ? "Ready to connect"
                          : callStatus === "connecting"
                          ? "Connecting..."
                          : callStatus === "waiting-for-answer"
                          ? "Waiting for response..."
                          : "Waiting for connection..."}
                      </h3>
                      <p className="text-gray-300">Status: {callStatus}</p>
                      {!socketRef.current?.connected && (
                        <p className="text-red-400 mt-2">
                          Server connection lost - Please refresh
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full ${
                    isAudioEnabled
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-red-600 hover:bg-red-500"
                  } text-white transition-colors`}
                  title={isAudioEnabled ? "Mute Audio" : "Unmute Audio"}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isAudioEnabled ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11V9a7 7 0 00-14 0v2M12 17a5 5 0 01-5-5v-2a5 5 0 0110 0v2a5 5 0 01-5 5z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11V9a7 7 0 00-14 0v2M12 17a5 5 0 01-5-5v-2a5 5 0 0110 0v2a5 5 0 01-5 5zM9 9l6 6m0-6L9 15"
                      />
                    )}
                  </svg>
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full ${
                    isVideoEnabled
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-red-600 hover:bg-red-500"
                  } text-white transition-colors`}
                  title={isVideoEnabled ? "Turn Off Video" : "Turn On Video"}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isVideoEnabled ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 12M6 6l12 12"
                      />
                    )}
                  </svg>
                </button>

                {(callStatus === "ready" || callStatus === "initializing") && (
                  <button
                    onClick={startCall}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      callStatus === "connecting" ||
                      !socketRef.current?.connected ||
                      !userRole
                    }
                  >
                    {callStatus === "connecting"
                      ? "Connecting..."
                      : "Start Call"}
                  </button>
                )}

                <button
                  onClick={handleEndCall}
                  className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
                  title="End Call"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
              {consultation && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Consultation Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          Patient:
                        </span>
                        <p className="text-gray-600">
                          {consultation.patient?.name}
                        </p>
                      </div>
                      {consultation.doctor && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Doctor:
                          </span>
                          <p className="text-gray-600">
                            {consultation.doctor?.name}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-700">
                          Problem:
                        </span>
                        <p className="text-gray-600">
                          {consultation.problemTitle}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <p className="text-gray-600">
                          {consultation.consultationType}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Urgency:
                        </span>
                        <p className="text-gray-600">{consultation.urgency}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Description:
                        </span>
                        <p className="text-gray-600">
                          {consultation.problemDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Debug Information */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Debug Info
                    </h4>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Role: {userRole || "Unknown"}</p>
                      <p>
                        Socket:{" "}
                        {socketRef.current?.connected
                          ? "Connected"
                          : "Disconnected"}
                      </p>
                      <p>
                        WebRTC:{" "}
                        {peerConnectionRef.current ? "Ready" : "Not Ready"}
                      </p>
                      <p>Status: {callStatus}</p>
                    </div>
                  </div>

                  {userRole === "doctor" && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full h-32 p-3 border rounded-md resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Add consultation notes..."
                      />
                      <button
                        onClick={handleCompleteConsultation}
                        className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
                      >
                        Complete Consultation
                      </button>
                    </div>
                  )}
                </div>
              )}

              {message && (
                <div
                  className={`mt-4 p-3 border rounded-md ${
                    message.includes("Error") || message.includes("failed")
                      ? "bg-red-50 border-red-200 text-red-700"
                      : message.includes("success") ||
                        message.includes("Connected")
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-blue-50 border-blue-200 text-blue-700"
                  }`}
                >
                  <p className="text-sm">{message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
