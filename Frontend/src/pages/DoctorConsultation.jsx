import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const DoctorConsultation = () => {
  const { consultationId } = useParams();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState("connecting");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [notes, setNotes] = useState("");
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
        setNotes(response.data.data.notes || "");
      }
    } catch (error) {
      setMessage("Error fetching consultation details");
    } finally {
      setLoading(false);
    }
  };

  const initializeWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const socket = io("https://medlink-bh5c.onrender.com");
      socketRef.current = socket;

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        console.log("Received remote stream from patient");
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

      peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peerConnection.iceConnectionState);
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate");
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            consultationId,
            from: "doctor",
          });
        }
      };

      // Socket event handlers
      socket.on("answer", async ({ answer }) => {
        try {
          console.log("Received answer from patient");
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("Set remote description from answer");

          // Process any pending ICE candidates
          for (const candidate of pendingCandidatesRef.current) {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
            console.log("Added pending ICE candidate");
          }
          pendingCandidatesRef.current = [];

          setCallStatus("waiting-for-connection");
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      });

      socket.on("ice-candidate", async ({ candidate, from }) => {
        try {
          if (from !== "doctor") {
            // Only process candidates from patient
            if (peerConnection.remoteDescription) {
              await peerConnection.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
              console.log("Added ICE candidate from patient");
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

      socket.on("patient-ready", async () => {
        try {
          console.log("Patient ready, creating offer");
          setCallStatus("connecting");

          // Create and send offer
          const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await peerConnection.setLocalDescription(offer);

          console.log("Sending offer to patient");
          socket.emit("offer", {
            offer: peerConnection.localDescription,
            consultationId,
          });
        } catch (error) {
          console.error("Error creating offer:", error);
          setMessage("Error establishing connection");
        }
      });

      socket.on("call-ended", () => {
        setCallStatus("ended");
        handleEndCall();
      });

      // Join consultation room and notify that doctor joined
      socket.emit("join-consultation", consultationId);
      socket.emit("doctor-joined", consultationId);

      setCallStatus("waiting-for-patient");
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

  const handleCompleteConsultation = async () => {
    try {
      const response = await axios.put(
        `https://medlink-bh5c.onrender.com/api/consultation/status/${consultationId}`,
        { status: "completed", notes },
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage("Consultation completed successfully!");
        socketRef.current?.emit("consultation-completed", consultationId);

        setTimeout(() => {
          window.location.href = "/doctor/consultants";
        }, 2000);
      }
    } catch (error) {
      setMessage("Error completing consultation");
    }
  };

  const handleEndCall = () => {
    cleanup();
    socketRef.current?.emit("end-call", consultationId);
    setCallStatus("ended");
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
          onClick={() => (window.location.href = "/doctor/consultants")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
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
            <strong>Patient:</strong> {consultation.patient?.name}
          </span>
          <span>
            <strong>Problem:</strong> {consultation.problemTitle}
          </span>
          <span
            className={`px-3 py-1 rounded-full font-medium ${
              callStatus === "connected"
                ? "bg-green-100 text-green-700"
                : callStatus === "connecting"
                ? "bg-yellow-100 text-yellow-700"
                : callStatus === "waiting-for-patient"
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {callStatus.replace("-", " ")}
          </span>
        </div>
      </div>

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
              You (Doctor)
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
              {consultation.patient?.name}
            </span>
            {callStatus !== "connected" && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <span className="text-white">
                  {callStatus === "waiting-for-patient"
                    ? "Waiting for patient..."
                    : callStatus === "connecting"
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

      {/* Consultation Details and Notes */}
      <div className="bg-white shadow-md rounded-xl p-5">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Patient Information
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {consultation.patient?.name}
              </p>
              <p>
                <strong>Email:</strong> {consultation.patient?.email}
              </p>
              <p>
                <strong>Problem:</strong> {consultation.problemTitle}
              </p>
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
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-700 text-sm mb-2">
                Problem Description:
              </h4>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                {consultation.problemDescription}
              </p>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Consultation Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your consultation notes, diagnosis, treatment recommendations, prescriptions, follow-up instructions..."
              rows="12"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={handleCompleteConsultation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Complete Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsultation;
