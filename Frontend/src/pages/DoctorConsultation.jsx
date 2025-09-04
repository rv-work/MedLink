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
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const reconnectTimeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const isCreatingOfferRef = useRef(false); // Prevent multiple offers

  // Production-ready ICE servers with TURN
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ];

  useEffect(() => {
    fetchConsultation();
    initializeWebRTC();

    return () => {
      cleanup();
    };
  }, [consultationId]);

  const cleanup = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }
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

  const processPendingCandidates = async () => {
    for (const candidate of pendingCandidatesRef.current) {
      try {
        if (
          peerConnectionRef.current &&
          peerConnectionRef.current.remoteDescription
        ) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
          console.log("Added pending ICE candidate");
        }
      } catch (error) {
        console.error("Error adding pending candidate:", error);
      }
    }
    pendingCandidatesRef.current = [];
  };

  const verifyStreamTracks = (stream) => {
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();

    console.log("Stream verification:", {
      videoTracks: videoTracks.length,
      audioTracks: audioTracks.length,
      videoEnabled: videoTracks[0]?.enabled,
      audioEnabled: audioTracks[0]?.enabled,
      videoReadyState: videoTracks[0]?.readyState,
      audioReadyState: audioTracks[0]?.readyState,
    });

    return videoTracks.length > 0 && audioTracks.length > 0;
  };

  const attemptReconnection = async () => {
    if (reconnectAttempts >= 3) {
      setCallStatus("error");
      setMessage(
        "Connection failed after multiple attempts. Please refresh and try again."
      );
      return;
    }

    setReconnectAttempts((prev) => prev + 1);
    setCallStatus("reconnecting");
    console.log(`Reconnection attempt ${reconnectAttempts + 1}`);

    try {
      if (
        peerConnectionRef.current &&
        peerConnectionRef.current.iceConnectionState === "failed"
      ) {
        const offer = await peerConnectionRef.current.createOffer({
          iceRestart: true,
        });
        await peerConnectionRef.current.setLocalDescription(offer);

        socketRef.current?.emit("ice-restart-offer", {
          offer: peerConnectionRef.current.localDescription,
          consultationId,
          from: "doctor",
        });
      }
    } catch (error) {
      console.error("Reconnection failed:", error);
      reconnectTimeoutRef.current = setTimeout(attemptReconnection, 3000);
    }
  };

  const initializeWebRTC = async () => {
    try {
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

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const socket = io("https://medlink-bh5c.onrender.com", {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });
      socketRef.current = socket;

      const peerConnection = new RTCPeerConnection({
        iceServers,
        iceCandidatePoolSize: 10,
        iceTransportPolicy: "all",
      });

      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        console.log("Received remote stream from patient");
        if (remoteVideoRef.current && event.streams && event.streams[0]) {
          const stream = event.streams[0];

          if (verifyStreamTracks(stream)) {
            remoteVideoRef.current.srcObject = stream;

            // Wait for video to actually start playing
            remoteVideoRef.current.onloadedmetadata = () => {
              console.log("Remote video metadata loaded");
              setCallStatus("connected");
              setReconnectAttempts(0);
              if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current);
              }
            };
          } else {
            console.error("Received stream has no tracks");
          }
        }
      };

      // Enhanced connection state monitoring
      peerConnection.onconnectionstatechange = () => {
        console.log("Connection state:", peerConnection.connectionState);
        switch (peerConnection.connectionState) {
          case "connecting":
            setCallStatus("connecting");
            break;
          case "connected":
            console.log("WebRTC connection established successfully");
            setCallStatus("connected");
            setReconnectAttempts(0);
            isCreatingOfferRef.current = false; // Reset offer flag
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            if (connectionTimeoutRef.current) {
              clearTimeout(connectionTimeoutRef.current);
            }
            break;
          case "disconnected":
            console.log("Connection disconnected, attempting reconnection");
            if (callStatus !== "connected") return; // Don't reconnect if never connected
            setCallStatus("reconnecting");
            reconnectTimeoutRef.current = setTimeout(attemptReconnection, 2000);
            break;
          case "failed":
            console.log("Connection failed, attempting reconnection");
            attemptReconnection();
            break;
          case "closed":
            console.log("Connection closed");
            setCallStatus("ended");
            break;
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peerConnection.iceConnectionState);
        if (
          peerConnection.iceConnectionState === "failed" &&
          callStatus === "connected"
        ) {
          attemptReconnection();
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(
            "Sending ICE candidate:",
            event.candidate.type,
            event.candidate.candidate
          );
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            consultationId,
            from: "doctor",
          });
        } else {
          console.log("ICE candidate gathering completed");
        }
      };

      // Socket event handlers
      socket.on("create-offer", async () => {
        try {
          // Prevent multiple offers
          if (
            isCreatingOfferRef.current ||
            peerConnection.connectionState === "connected"
          ) {
            console.log(
              "Skipping offer creation - already creating or connected"
            );
            return;
          }

          isCreatingOfferRef.current = true;
          console.log("Creating offer for patient");
          setCallStatus("creating-offer");

          // Ensure we have local stream attached
          if (
            localStreamRef.current &&
            peerConnection.getSenders().length === 0
          ) {
            localStreamRef.current.getTracks().forEach((track) => {
              peerConnection.addTrack(track, localStreamRef.current);
            });
          }

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

          setCallStatus("waiting-for-answer");
        } catch (error) {
          console.error("Error creating offer:", error);
          setMessage("Error establishing connection");
          isCreatingOfferRef.current = false;
        }
      });

      socket.on("answer", async ({ answer }) => {
        try {
          console.log("Received answer from patient");

          // Check if we already have a remote description
          if (peerConnection.remoteDescription) {
            console.log("Already have remote description, skipping");
            return;
          }

          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("Set remote description from answer");
          await processPendingCandidates();
          setCallStatus("connecting");

          // Set a more reasonable connection timeout (30 seconds for ICE gathering)
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
          }
          connectionTimeoutRef.current = setTimeout(() => {
            if (peerConnection.connectionState !== "connected") {
              console.log("Connection timeout after answer");
              attemptReconnection();
            }
          }, 30000);
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      });

      socket.on("ice-candidate", async ({ candidate, from }) => {
        try {
          if (from !== "doctor") {
            if (peerConnection.remoteDescription) {
              await peerConnection.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
              console.log("Added ICE candidate from patient");
            } else {
              pendingCandidatesRef.current.push(candidate);
              console.log("Stored ICE candidate for later");
            }
          }
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      });

      // Handle ICE restart
      socket.on("ice-restart-answer", async ({ answer, from }) => {
        try {
          if (from === "patient") {
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(answer)
            );
            console.log("ICE restart completed");
            setCallStatus("connecting");
          }
        } catch (error) {
          console.error("Error handling ICE restart answer:", error);
        }
      });

      socket.on("patient-ready", () => {
        console.log("Patient is ready, waiting for create-offer signal");
        setCallStatus("patient-connected");

        // Only emit create-offer if not already creating one
        if (
          !isCreatingOfferRef.current &&
          peerConnection.connectionState !== "connected"
        ) {
          socket.emit("create-offer", consultationId);
        }
      });

      socket.on("call-ended", () => {
        setCallStatus("ended");
        handleEndCall();
      });

      socket.on("connect", () => {
        console.log("Socket connected");
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        if (callStatus === "connected") {
          setCallStatus("reconnecting");
        }
      });

      // Join consultation room and notify that doctor joined
      socket.emit("join-consultation", consultationId);
      socket.emit("doctor-joined", consultationId);

      setCallStatus("waiting-for-patient");
    } catch (error) {
      console.error("Error initializing WebRTC:", error);
      setMessage(
        "Error accessing camera/microphone. Please check permissions and try again."
      );
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
                : callStatus === "connecting" ||
                  callStatus === "creating-offer" ||
                  callStatus === "waiting-for-answer"
                ? "bg-yellow-100 text-yellow-700"
                : callStatus === "reconnecting"
                ? "bg-orange-100 text-orange-700"
                : callStatus === "waiting-for-patient" ||
                  callStatus === "patient-connected"
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {callStatus.replace("-", " ")}
            {callStatus === "reconnecting" && ` (${reconnectAttempts}/3)`}
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
                    : callStatus === "patient-connected"
                    ? "Patient connected, establishing video..."
                    : callStatus === "creating-offer"
                    ? "Creating connection..."
                    : callStatus === "waiting-for-answer"
                    ? "Waiting for patient response..."
                    : callStatus === "connecting"
                    ? "Connecting..."
                    : callStatus === "reconnecting"
                    ? "Reconnecting..."
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
