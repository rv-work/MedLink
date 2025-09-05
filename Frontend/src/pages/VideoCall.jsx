import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const URL_WEB_SOCKET = "wss://medlink-bh5c.onrender.com/ws";

export default function VideoCall() {
  const ws = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const navigate = useNavigate();
  const { consultationId } = useParams();

  const [remoteStreams, setRemoteStreams] = useState({});
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [localStreamReady, setLocalStreamReady] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  let channelName = searchParams.get("channelName");
  let userName = searchParams.get("userName");

  // Fallback if no params provided - create from consultation ID
  if (!channelName && consultationId) {
    channelName = `consultation-${consultationId}`;
  }
  if (!userName && consultationId) {
    // Determine user type based on current route
    const isDoctor = location.pathname.includes("/doctor/");
    userName = isDoctor ? `doctor-${Date.now()}` : `patient-${Date.now()}`;
  }

  // Call duration timer
  useEffect(() => {
    let interval;
    if (isCallStarted) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallStarted]);

  // Format call duration
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0
      ? `${hrs}:${mins.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`
      : `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Setup media devices first, then connect WebSocket
  useEffect(() => {
    if (!channelName || !userName) {
      toast.error("Invalid consultation session");
      navigate("/dashboard");
      return;
    }

    const initializeCall = async () => {
      try {
        // Setup media devices first
        await setupDevice();
        // Then connect WebSocket
        connectWebSocket();
      } catch (error) {
        console.error("Failed to initialize call:", error);
        toast.error("Failed to initialize camera and microphone");
        setConnectionStatus("error");
      }
    };

    initializeCall();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, userName, navigate]);

  const connectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
    }

    ws.current = new WebSocket(URL_WEB_SOCKET);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("connected");
      // Join channel only after WebSocket is connected and media is ready
      if (localStreamReady) {
        sendWsMessage("join", { channelName, userName });
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket closed");
      setConnectionStatus("disconnected");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
      toast.error("Connection error occurred");
    };

    ws.current.onmessage = (message) => {
      const { type, body } = JSON.parse(message.data);
      switch (type) {
        case "joined":
          handleJoined(body);
          break;
        case "offer_sdp_received":
          handleOffer(body.from, body.sdp);
          break;
        case "answer_sdp_received":
          handleAnswer(body.from, body.sdp);
          break;
        case "ice_candidate_received":
          handleRemoteIceCandidate(body.from, body.candidate);
          break;
        case "chat_message":
          handleChatMessage(body);
          break;
        default:
          break;
      }
    };
  };

  const sendWsMessage = useCallback((type, body) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, body }));
    } else {
      console.warn("WebSocket not ready, message not sent:", type);
    }
  }, []);

  const setupDevice = async () => {
    try {
      // Stop any existing streams
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;
      setLocalStreamReady(true);

      // Set video element source and ensure it plays
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        try {
          await localVideoRef.current.play();
        } catch (playError) {
          console.warn(
            "Auto-play prevented, user interaction required:",
            playError
          );
        }
      }

      // Join channel if WebSocket is already connected
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        sendWsMessage("join", { channelName, userName });
      }

      toast.success("Camera and microphone connected");
    } catch (err) {
      console.error("Error accessing camera/mic:", err);
      toast.error(
        "Unable to access camera/microphone. Please check permissions."
      );
      setConnectionStatus("error");
    }
  };

  const handleJoined = (userNames) => {
    console.log("Users in channel:", userNames);
    setParticipants(userNames);

    if (userNames.length > 1 && !isCallStarted) {
      setIsCallStarted(true);
      toast.success("Call started successfully!");
    }

    userNames.forEach((uid) => {
      if (uid === userName) return;
      if (!peerConnectionsRef.current[uid]) {
        setupPeerConnection(uid, true);
      }
    });
  };

  const setupPeerConnection = async (remoteUserName, isOfferer = false) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun.services.mozilla.com" },
      ],
    });

    // Add local stream tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        console.log("Adding track to peer connection:", track.kind);
        pc.addTrack(track, localStreamRef.current);
      });
    } else {
      console.warn("No local stream available when setting up peer connection");
    }

    pc.ontrack = (event) => {
      console.log("Received remote track:", event.streams[0]);
      setRemoteStreams((prev) => ({
        ...prev,
        [remoteUserName]: event.streams[0],
      }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWsMessage("send_ice_candidate", {
          channelName,
          userName,
          from: userName,
          to: remoteUserName,
          candidate: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(
        `Connection state with ${remoteUserName}:`,
        pc.connectionState
      );
    };

    pc.oniceconnectionstatechange = () => {
      console.log(
        `ICE connection state with ${remoteUserName}:`,
        pc.iceConnectionState
      );
    };

    peerConnectionsRef.current[remoteUserName] = pc;

    if (isOfferer) {
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        sendWsMessage("send_offer", {
          channelName,
          userName,
          from: userName,
          to: remoteUserName,
          sdp: offer,
        });
      } catch (err) {
        console.error("Error creating offer:", err);
      }
    }
  };

  const handleOffer = async (from, offer) => {
    if (!peerConnectionsRef.current[from]) {
      await setupPeerConnection(from, false);
    }

    const pc = peerConnectionsRef.current[from];
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendWsMessage("send_answer", {
        channelName,
        userName,
        from: userName,
        to: from,
        sdp: answer,
      });
    } catch (err) {
      console.error("Error handling offer:", err);
    }
  };

  const handleAnswer = async (from, answer) => {
    const pc = peerConnectionsRef.current[from];
    if (!pc) return;

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error("Error handling answer:", err);
    }
  };

  const handleRemoteIceCandidate = async (from, candidate) => {
    const pc = peerConnectionsRef.current[from];
    if (!pc) return;

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Error adding remote ICE candidate:", err);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
        toast.success(`Camera ${!isVideoEnabled ? "enabled" : "disabled"}`);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
        toast.success(`Microphone ${!isAudioEnabled ? "enabled" : "disabled"}`);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        const videoTrack = screenStream.getVideoTracks()[0];

        // Replace video track in all peer connections
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        // Update local video display
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);
        toast.success("Screen sharing started");

        videoTrack.onended = () => {
          stopScreenShare();
        };
      } catch (err) {
        console.error("Error starting screen share:", err);
        toast.error("Unable to start screen sharing");
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];

      // Replace screen share track with camera track in all peer connections
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        const sender = pc
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Restore local video display
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }

    setIsScreenSharing(false);
    toast.success("Screen sharing stopped");
  };

  const cleanup = () => {
    if (ws.current) {
      sendWsMessage("quit", { channelName, userName });
      ws.current.close();
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    Object.values(peerConnectionsRef.current).forEach((pc) => {
      pc.close();
    });

    peerConnectionsRef.current = {};
  };

  const endCall = () => {
    if (window.confirm("Are you sure you want to end the call?")) {
      cleanup();
      toast.success("Call ended");

      // Navigate back based on user type
      const isDoctor = location.pathname.includes("/doctor/");
      if (isDoctor) {
        navigate("/doctor/consultants");
      } else {
        navigate("/dashboard");
      }
    }
  };

  const sendChatMessage = () => {
    if (currentMessage.trim()) {
      const message = {
        from: userName,
        message: currentMessage,
        timestamp: new Date().toISOString(),
      };
      sendWsMessage("chat_message", {
        channelName,
        ...message,
      });
      setMessages((prev) => [...prev, message]);
      setCurrentMessage("");
    }
  };

  const handleChatMessage = (messageData) => {
    setMessages((prev) => [...prev, messageData]);
  };

  const ConnectionStatus = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Waiting for other participants to join...</p>
      <p className="text-gray-500 text-sm mt-2">
        Share the consultation link with other participants
      </p>
    </div>
  );

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-white text-xl font-semibold">
            Medical Consultation
          </h1>
          {isCallStarted && (
            <p className="text-gray-300 text-sm">
              Duration: {formatDuration(callDuration)}
            </p>
          )}
          {consultationId && (
            <p className="text-gray-400 text-xs">ID: {consultationId}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              connectionStatus === "connected"
                ? "bg-green-100 text-green-800"
                : connectionStatus === "connecting"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {connectionStatus === "connected"
              ? "Connected"
              : connectionStatus === "connecting"
              ? "Connecting..."
              : "Disconnected"}
          </span>
          <span className="text-white text-sm">
            {participants.length} participant
            {participants.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {participants.length > 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-full">
              {/* Local Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  You ({userName})
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  {!isVideoEnabled && (
                    <div className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                      Video Off
                    </div>
                  )}
                  {!isAudioEnabled && (
                    <div className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                      Muted
                    </div>
                  )}
                  {isScreenSharing && (
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      Sharing Screen
                    </div>
                  )}
                </div>
              </div>

              {/* Remote Videos */}
              {Object.entries(remoteStreams).map(([userId, stream]) => (
                <div
                  key={userId}
                  className="relative bg-gray-800 rounded-lg overflow-hidden"
                >
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(video) => {
                      if (video && video.srcObject !== stream) {
                        video.srcObject = stream;
                        video.play().catch(console.error);
                      }
                    }}
                  />
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {userId}
                  </div>
                </div>
              ))}

              {/* Empty slots for more participants */}
              {participants.length === 2 && (
                <>
                  <div className="bg-gray-700 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">
                      Waiting for more participants...
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">
                      Waiting for more participants...
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <ConnectionStatus />
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  isVideoEnabled
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
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
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                    />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  isAudioEnabled
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
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
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-3a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full transition-colors ${
                  isScreenSharing
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
                title={isScreenSharing ? "Stop screen share" : "Share screen"}
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
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-3 rounded-full transition-colors relative ${
                  showChat
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
                title="Toggle chat"
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {messages.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {messages.length}
                  </span>
                )}
              </button>

              <button
                onClick={endCall}
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                title="End call"
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
                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l1.664 1.664M21 21l-1.336-1.336m0 0A10.94 10.94 0 0012 21c-6.075 0-11-4.925-11-11 0-2.997 1.2-5.707 3.146-7.854m0 0L5.482 0.818M21 21l-1.664-1.664"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-white border-l flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5"
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
              <p className="text-sm text-gray-600 mt-1">
                {participants.length} participants
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.from === userName ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.from === userName
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.from !== userName && (
                        <p className="text-xs opacity-75 mb-1">{msg.from}</p>
                      )}
                      <p>{msg.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={connectionStatus !== "connected"}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={
                    !currentMessage.trim() || connectionStatus !== "connected"
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
