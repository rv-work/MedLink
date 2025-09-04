import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const PatientConsultation = () => {
  const { consultationId } = useParams();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState("connecting");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [message, setMessage] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  useEffect(() => {
    fetchConsultation();
    initializeWebRTC();

    return () => {
      cleanup();
    };
  }, [consultationId]);

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

  const fetchConsultation = async () => {
    try {
      const response = await axios.get(
        `https://medlink-bh5c.onrender.com/api/consultation/${consultationId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setConsultation(response.data.data);
        if (
          response.data.data.status !== "accepted" &&
          response.data.data.status !== "in-progress"
        ) {
          window.location.href = "/waiting-for-doctor";
        }
      }
    } catch (error) {
      setMessage("Error fetching consultation details");
    } finally {
      setLoading(false);
    }
  };

  const initializeWebRTC = async () => {
    try {
      // Get user media first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize Socket.IO connection
      const socket = io("https://medlink-bh5c.onrender.com");
      socketRef.current = socket;

      // Initialize peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log("Received remote stream");
        if (remoteVideoRef.current && event.streams && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setCallStatus("connected");
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log("Connection state:", peerConnection.connectionState);
        if (peerConnection.connectionState === "connected") {
          setCallStatus("connected");
        } else if (
          peerConnection.connectionState === "failed" ||
          peerConnection.connectionState === "disconnected"
        ) {
          setCallStatus("error");
        }
      };

      // Handle ICE connection state
      peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peerConnection.iceConnectionState);
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate");
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            consultationId,
            from: "patient",
          });
        }
      };

      // Socket event handlers
      socket.on("offer", async ({ offer }) => {
        try {
          console.log("Received offer from doctor");
          setCallStatus("processing-offer");

          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          console.log("Set remote description");

          // Process any pending ICE candidates
          for (const candidate of pendingCandidatesRef.current) {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
            console.log("Added pending ICE candidate");
          }
          pendingCandidatesRef.current = [];

          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          console.log("Created and set local description (answer)");

          console.log("Sending answer to doctor");
          socket.emit("answer", {
            answer: peerConnection.localDescription,
            consultationId,
            from: "patient",
          });

          setCallStatus("waiting-for-connection");
        } catch (error) {
          console.error("Error handling offer:", error);
          setMessage("Error establishing connection");
        }
      });

      socket.on("ice-candidate", async ({ candidate, from }) => {
        try {
          if (from !== "patient") {
            // Only process candidates from doctor
            if (peerConnection.remoteDescription) {
              await peerConnection.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
              console.log("Added ICE candidate from doctor");
            } else {
              // Store candidates until remote description is set
              pendingCandidatesRef.current.push(candidate);
              console.log("Stored ICE candidate for later");
            }
          }
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      });

      socket.on("doctor-joined", () => {
        console.log("Doctor joined, waiting for offer");
        setCallStatus("waiting-for-connection");
      });

      socket.on("call-ended", () => {
        setCallStatus("ended");
        handleEndCall();
      });

      // Join consultation room
      socket.emit("join-consultation", consultationId);
      socket.emit("patient-ready", consultationId);

      setCallStatus("waiting-for-doctor");
    } catch (error) {
      console.error("Error initializing WebRTC:", error);
      setMessage("Error accessing camera/microphone");
      setCallStatus("error");
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const handleEndCall = () => {
    cleanup();
    socketRef.current?.emit("end-call", consultationId);
    setCallStatus("ended");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Consultation Not Found
        </h2>
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Dashboard
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
            <strong>Doctor:</strong>{" "}
            {consultation.doctor?.name || "Connecting..."}
          </span>
          <span>
            <strong>Problem:</strong> {consultation.problemTitle}
          </span>
          <span
            className={`px-3 py-1 rounded-full font-medium ${
              callStatus === "connected"
                ? "bg-green-100 text-green-700"
                : callStatus === "connecting" ||
                  callStatus === "waiting-for-connection"
                ? "bg-yellow-100 text-yellow-700"
                : callStatus === "waiting-for-doctor"
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {callStatus.replace("-", " ")}
          </span>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-center text-sm font-medium bg-red-100 text-red-700 border border-red-300">
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
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <span className="text-white">Video Off</span>
              </div>
            )}
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
              Dr. {consultation.doctor?.name || "Doctor"}
            </span>
            {callStatus !== "connected" && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <span className="text-white">
                  {callStatus === "waiting-for-doctor"
                    ? "Waiting for doctor..."
                    : callStatus === "waiting-for-connection"
                    ? "Connecting..."
                    : "Waiting..."}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={toggleAudio}
            className={`px-4 py-2 rounded-full ${
              isAudioEnabled
                ? "bg-gray-200 hover:bg-gray-300"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {isAudioEnabled ? "🎤" : "🔇"}
          </button>
          <button
            onClick={toggleVideo}
            className={`px-4 py-2 rounded-full ${
              isVideoEnabled
                ? "bg-gray-200 hover:bg-gray-300"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {isVideoEnabled ? "📹" : "📷"}
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Consultation Details
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Type:</strong> {consultation.consultationType}
          </p>
          <p>
            <strong>Urgency:</strong> {consultation.urgency}
          </p>
          <p>
            <strong>Started:</strong>{" "}
            {new Date(consultation.scheduledTime).toLocaleString()}
          </p>
          <p>
            <strong>Description:</strong> {consultation.problemDescription}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientConsultation;
