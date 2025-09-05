import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const WEBSOCKET_URL = "wss://medlink-bh5c.onrender.com/ws";

export default function SimpleVideoCall() {
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const wsRef = useRef(null);
  const peerConnectionsRef = useRef({});

  const [remoteStreams, setRemoteStreams] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [participants, setParticipants] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const { consultationId } = useParams();
  const navigate = useNavigate();

  const channelName = `consultation-${consultationId}`;
  const userName = `user-${Date.now()}`;

  console.log("🎯 Channel:", channelName, "User:", userName);

  // Step 1: Setup local video FIRST
  const setupLocalVideo = async () => {
    try {
      console.log("📹 Getting user media...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log("✅ Local video setup complete");
      setIsInitialized(true);
      return true;
    } catch (error) {
      console.error("❌ Error accessing camera/mic:", error);
      return false;
    }
  };

  // Step 2: WebSocket connection AFTER local video is ready
  const connectWebSocket = () => {
    console.log("🔌 Connecting to WebSocket...");
    wsRef.current = new WebSocket(WEBSOCKET_URL);

    wsRef.current.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnectionStatus("connected");

      // Join channel immediately after connection
      setTimeout(() => {
        joinChannel();
      }, 100);
    };

    wsRef.current.onmessage = async (message) => {
      try {
        const { type, body } = JSON.parse(message.data);
        console.log("📨 Received message:", type, body);

        switch (type) {
          case "joined":
            await handleUserJoined(body);
            break;
          case "offer_sdp_received":
            await handleOffer(body);
            break;
          case "answer_sdp_received":
            await handleAnswer(body);
            break;
          case "ice_candidate_received":
            await handleIceCandidate(body);
            break;
          default:
            console.log("Unknown message type:", type);
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket closed");
      setConnectionStatus("disconnected");
    };
  };

  // Step 3: Join channel
  const joinChannel = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("📞 Joining channel...");
      const message = {
        type: "join",
        body: { channelName, userName },
      };
      wsRef.current.send(JSON.stringify(message));
    }
  };

  // Step 4: Handle users joined
  const handleUserJoined = async (users) => {
    console.log("👥 Users in channel:", users);
    setParticipants(users);

    // Find new users (excluding self)
    const otherUsers = users.filter((user) => user.userName !== userName);

    for (const user of otherUsers) {
      if (!peerConnectionsRef.current[user.userName]) {
        console.log(`🤝 Creating connection with ${user.userName}`);
        await createPeerConnection(user.userName);
      }
    }
  };

  // Step 5: Create WebRTC peer connection with better error handling
  const createPeerConnection = async (remoteUserName) => {
    try {
      console.log(`🔗 Setting up peer connection for ${remoteUserName}`);

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
        ],
      });

      // Store the peer connection
      peerConnectionsRef.current[remoteUserName] = pc;

      // Add local stream tracks to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          console.log(`➕ Adding ${track.kind} track to peer connection`);
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle incoming remote stream
      pc.ontrack = (event) => {
        console.log(
          `📺 Received ${event.track.kind} track from ${remoteUserName}`
        );

        if (event.streams && event.streams[0]) {
          console.log("✅ Setting remote stream for", remoteUserName);
          setRemoteStreams((prev) => ({
            ...prev,
            [remoteUserName]: event.streams[0],
          }));
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`🧊 Sending ICE candidate to ${remoteUserName}`);
          sendMessage("send_ice_candidate", {
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

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log(
          `Connection state with ${remoteUserName}:`,
          pc.connectionState
        );
      };

      // Create offer if this user should initiate (deterministic)
      if (userName < remoteUserName) {
        console.log(`📤 Creating offer for ${remoteUserName}`);
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
    } catch (error) {
      console.error(
        `Error creating peer connection for ${remoteUserName}:`,
        error
      );
    }
  };

  // Step 6: Handle WebRTC signaling messages
  const handleOffer = async ({ from, sdp }) => {
    try {
      console.log(`📥 Handling offer from ${from}`);

      let pc = peerConnectionsRef.current[from];
      if (!pc) {
        await createPeerConnection(from);
        pc = peerConnectionsRef.current[from];
      }

      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log(`📤 Sending answer to ${from}`);
        sendMessage("send_answer", {
          channelName,
          userName,
          from: userName,
          to: from,
          sdp: answer,
        });
      }
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async ({ from, sdp }) => {
    try {
      console.log(`📥 Handling answer from ${from}`);
      const pc = peerConnectionsRef.current[from];

      if (pc && pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log("✅ Answer processed successfully");
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleIceCandidate = async ({ from, candidate }) => {
    try {
      console.log(`📥 Handling ICE candidate from ${from}`);
      const pc = peerConnectionsRef.current[from];

      if (pc && pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ ICE candidate added");
      } else {
        console.log("⚠️ PC not ready for ICE candidate, queuing...");
        // Could queue candidates here if needed
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  };

  // Helper function to send WebSocket messages
  const sendMessage = (type, body) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("📤 Sending:", type);
      wsRef.current.send(JSON.stringify({ type, body }));
    } else {
      console.error("WebSocket not open, cannot send message");
    }
  };

  // Initialize everything in correct order
  useEffect(() => {
    const init = async () => {
      if (!consultationId) {
        navigate("/dashboard");
        return;
      }

      // First setup local video, then connect WebSocket
      const videoReady = await setupLocalVideo();
      if (videoReady) {
        connectWebSocket();
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up...");

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }

      Object.values(peerConnectionsRef.current).forEach((pc) => {
        pc.close();
      });

      if (wsRef.current) {
        wsRef.current.close();
      }
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
          You ({userName.slice(-6)})
        </div>
        <div className="absolute top-4 right-4">
          <div
            className={`px-3 py-1 rounded text-sm ${
              connectionStatus === "connected"
                ? "bg-green-600 text-white"
                : connectionStatus === "connecting"
                ? "bg-yellow-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {connectionStatus === "connected"
              ? "Connected"
              : connectionStatus === "connecting"
              ? "Connecting..."
              : "Disconnected"}
          </div>
        </div>
      </div>

      {/* Remote Video - Right Side */}
      <div className="w-1/2 relative bg-gray-900">
        {Object.keys(remoteStreams).length > 0 ? (
          Object.entries(remoteStreams).map(([userId, stream]) => (
            <div key={userId} className="w-full h-full relative">
              <video
                autoPlay
                playsInline
                muted={false}
                className="w-full h-full object-cover"
                ref={(video) => {
                  if (video && stream && video.srcObject !== stream) {
                    console.log(`🎥 Setting video source for ${userId}`);
                    video.srcObject = stream;
                  }
                }}
                onLoadedMetadata={() => {
                  console.log(`✅ Video metadata loaded for ${userId}`);
                }}
                onError={(e) => {
                  console.error(`❌ Video error for ${userId}:`, e);
                }}
              />
              <div className="absolute bottom-4 left-4 bg-purple-600 text-white px-3 py-1 rounded">
                Remote User ({userId.slice(-6)})
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              {isInitialized ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-lg">Waiting for other participant...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Share this consultation ID:{" "}
                    <span className="font-mono">{consultationId}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-4">
                    Connection: {connectionStatus} | Participants:{" "}
                    {participants.length}
                  </p>
                </>
              ) : (
                <>
                  <div className="animate-pulse">
                    <p className="text-lg">Setting up camera...</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Simple Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              console.log("🔴 Ending call...");
              navigate("/dashboard");
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            End Call
          </button>

          {/* Debug info */}
          <div className="bg-gray-800 text-white px-4 py-2 rounded text-sm">
            Remote streams: {Object.keys(remoteStreams).length} | Participants:{" "}
            {participants.length}
          </div>
        </div>
      </div>
    </div>
  );
}
