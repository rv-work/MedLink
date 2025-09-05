import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

export const DoctorVideo = () => {
  const { roomId } = useParams();
  const [isConnected, setIsConnected] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    initializeConnection();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [roomId]);

  const initializeConnection = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebSocket
      const socket = new WebSocket("ws://localhost:8080");
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");
        socket.send(
          JSON.stringify({
            type: "join",
            role: "doctor",
            roomId: roomId,
          })
        );
        setIsConnected(true);
      };

      // Initialize WebRTC
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = pc;

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log("Received remote stream");
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.send(
            JSON.stringify({
              type: "iceCandidate",
              candidate: event.candidate,
              roomId: roomId,
            })
          );
        }
      };

      // Handle WebSocket messages
      socket.onmessage = async (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "createAnswer") {
          await pc.setRemoteDescription(message.sdp);
        } else if (message.type === "iceCandidate") {
          await pc.addIceCandidate(message.candidate);
        }
      };

      // Create and send offer
      setTimeout(async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.send(
          JSON.stringify({
            type: "createOffer",
            sdp: offer,
            roomId: roomId,
          })
        );
      }, 2000);
    } catch (error) {
      console.error("Error initializing connection:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-6 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Doctor Consultation - Room: {roomId}
          </h2>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-700">
              <h3 className="text-white font-medium">Your Video</h3>
            </div>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 lg:h-96 object-cover"
            />
          </div>

          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-700">
              <h3 className="text-white font-medium">Patient Video</h3>
            </div>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-64 lg:h-96 object-cover"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
            End Consultation
          </button>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Mute/Unmute
          </button>
          <button className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
            Turn Camera Off/On
          </button>
        </div>
      </div>
    </div>
  );
};
