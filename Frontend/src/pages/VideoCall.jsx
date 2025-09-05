import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const WEBSOCKET_URL = "wss://medlink-bh5c.onrender.com/ws";

export default function SimpleVideoCall() {
  // Basic refs
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const wsRef = useRef(null);
  const peerConnectionsRef = useRef({});

  // Basic states
  const [remoteStreams, setRemoteStreams] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [participants, setParticipants] = useState([]);

  const { consultationId } = useParams();
  const navigate = useNavigate();

  // Channel and user setup
  const channelName = `consultation-${consultationId}`;
  const userName = `user-${Date.now()}`;

  // Step 1: Get user media (camera/mic)
  const setupLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log("✅ Local video setup complete");
    } catch (error) {
      console.error("❌ Error accessing camera/mic:", error);
    }
  };

  // Step 2: WebSocket connection
  const connectWebSocket = () => {
    wsRef.current = new WebSocket(WEBSOCKET_URL);

    wsRef.current.onopen = () => {
      console.log("🔌 WebSocket connected");
      setConnectionStatus("connected");
      joinChannel();
    };

    wsRef.current.onmessage = (message) => {
      const { type, body } = JSON.parse(message.data);
      console.log("📨 Received:", type);

      switch (type) {
        case "joined":
          handleUserJoined(body);
          break;
        case "offer_sdp_received":
          handleOffer(body);
          break;
        case "answer_sdp_received":
          handleAnswer(body);
          break;
        case "ice_candidate_received":
          handleIceCandidate(body);
          break;
      }
    };

    wsRef.current.onerror = () => {
      setConnectionStatus("error");
    };
  };

  // Step 3: Join channel
  const joinChannel = () => {
    const message = {
      type: "join",
      body: { channelName, userName },
    };
    wsRef.current.send(JSON.stringify(message));
  };

  // Step 4: Handle new user joined
  const handleUserJoined = (users) => {
    console.log("👥 Users in channel:", users);
    setParticipants(users);

    // Create peer connection for each new user
    users.forEach((user) => {
      if (
        user.userName !== userName &&
        !peerConnectionsRef.current[user.userName]
      ) {
        createPeerConnection(user.userName);
      }
    });
  };

  // Step 5: Create WebRTC peer connection
  const createPeerConnection = async (remoteUserName) => {
    console.log(`🤝 Creating connection with ${remoteUserName}`);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Add local stream to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log(`📺 Received remote stream from ${remoteUserName}`);
      setRemoteStreams((prev) => ({
        ...prev,
        [remoteUserName]: event.streams[0],
      }));
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage("send_ice_candidate", {
          channelName,
          userName,
          from: userName,
          to: remoteUserName,
          candidate: event.candidate,
        });
      }
    };

    peerConnectionsRef.current[remoteUserName] = pc;

    // Create offer if this user should initiate
    if (userName < remoteUserName) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendMessage("send_offer", {
        channelName,
        userName,
        from: userName,
        to: remoteUserName,
        sdp: offer,
      });
    }
  };

  // Step 6: Handle WebRTC signaling
  const handleOffer = async ({ from, sdp }) => {
    const pc = peerConnectionsRef.current[from];
    if (!pc) return;

    await pc.setRemoteDescription(sdp);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    sendMessage("send_answer", {
      channelName,
      userName,
      from: userName,
      to: from,
      sdp: answer,
    });
  };

  const handleAnswer = async ({ from, sdp }) => {
    const pc = peerConnectionsRef.current[from];
    if (pc) {
      await pc.setRemoteDescription(sdp);
    }
  };

  const handleIceCandidate = async ({ from, candidate }) => {
    const pc = peerConnectionsRef.current[from];
    if (pc) {
      await pc.addIceCandidate(candidate);
    }
  };

  // Helper function to send WebSocket messages
  const sendMessage = (type, body) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, body }));
    }
  };

  // Step 7: Initialize everything
  useEffect(() => {
    if (!consultationId) {
      navigate("/dashboard");
      return;
    }

    setupLocalVideo();
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
    };
  }, [consultationId, navigate]);

  return (
    <div className="h-screen bg-black flex">
      {/* Local Video - Left Side */}
      <div className="w-1/2 relative">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-3 py-1 rounded">
          You ({userName})
        </div>
        <div className="absolute top-4 right-4">
          <div
            className={`px-3 py-1 rounded text-sm ${
              connectionStatus === "connected"
                ? "bg-green-600 text-white"
                : "bg-yellow-600 text-white"
            }`}
          >
            {connectionStatus === "connected" ? "Connected" : "Connecting..."}
          </div>
        </div>
      </div>

      {/* Remote Video - Right Side */}
      <div className="w-1/2 relative">
        {Object.entries(remoteStreams).length > 0 ? (
          Object.entries(remoteStreams).map(([userId, stream]) => (
            <div key={userId} className="w-full h-full relative">
              <video
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                ref={(video) => {
                  if (video && stream) {
                    video.srcObject = stream;
                  }
                }}
              />
              <div className="absolute bottom-4 left-4 bg-purple-600 text-white px-3 py-1 rounded">
                {userId}
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Waiting for other participant...</p>
              <p className="text-sm text-gray-400 mt-2">
                Consultation ID: {consultationId}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Simple Controls - Bottom Center */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium"
          >
            End Call
          </button>
        </div>
      </div>
    </div>
  );
}
