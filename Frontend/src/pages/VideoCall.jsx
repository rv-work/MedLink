import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const VideoCall = () => {
  const { consultationId } = useParams();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState("initializing");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [userRole, setUserRole] = useState(null); // 'doctor' or 'patient'
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [remoteUserConnected, setRemoteUserConnected] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const dataChannelRef = useRef(null);
  const offerCreatedRef = useRef(false);

  // Simple ICE servers - no TURN needed for basic P2P
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

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

        // Determine user role
        const currentUser =
          response.data.data.doctor || response.data.data.patient;
        if (
          response.data.data.doctor &&
          currentUser._id === response.data.data.doctor._id
        ) {
          setUserRole("doctor");
        } else {
          setUserRole("patient");
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

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Create data channel for signaling
      const dataChannel = peerConnection.createDataChannel("signaling", {
        ordered: true,
      });
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log("Data channel opened");
        setCallStatus("connected");
      };

      dataChannel.onmessage = (event) => {
        handleDataChannelMessage(JSON.parse(event.data));
      };

      // Handle incoming data channel
      peerConnection.ondatachannel = (event) => {
        const channel = event.channel;
        channel.onmessage = (event) => {
          handleDataChannelMessage(JSON.parse(event.data));
        };
      };

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log("Received remote stream");
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setRemoteUserConnected(true);
          setCallStatus("connected");
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // In a serverless setup, you'd exchange ICE candidates through the data channel
          // or through a simple signaling mechanism
          console.log("ICE candidate:", event.candidate);
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        console.log("Connection state:", state);

        switch (state) {
          case "connecting":
            setCallStatus("connecting");
            break;
          case "connected":
            setCallStatus("connected");
            break;
          case "disconnected":
            setCallStatus("disconnected");
            break;
          case "failed":
            setCallStatus("failed");
            break;
          case "closed":
            setCallStatus("ended");
            break;
        }
      };

      setCallStatus("ready");
    } catch (error) {
      console.error("Error initializing WebRTC:", error);
      setMessage("Error accessing camera/microphone");
      setCallStatus("error");
    }
  };

  const handleDataChannelMessage = (data) => {
    switch (data.type) {
      case "user-joined":
        setRemoteUserConnected(true);
        break;
      case "user-left":
        setRemoteUserConnected(false);
        break;
      case "call-ended":
        setCallStatus("ended");
        break;
    }
  };

  const sendDataChannelMessage = (data) => {
    if (dataChannelRef.current?.readyState === "open") {
      dataChannelRef.current.send(JSON.stringify(data));
    }
  };

  const createOffer = async () => {
    if (offerCreatedRef.current) return;
    offerCreatedRef.current = true;

    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      // In a real serverless setup, you'd share this offer through:
      // 1. QR code
      // 2. Copy-paste mechanism
      // 3. Simple HTTP endpoint
      // 4. WebSocket for just signaling

      console.log("Offer created:", offer);
      setCallStatus("waiting-for-answer");

      // For demo purposes, copy to clipboard
      navigator.clipboard.writeText(JSON.stringify(offer));
      setMessage(
        "Offer copied to clipboard. Share with the other participant."
      );
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const createAnswer = async (offer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      console.log("Answer created:", answer);

      // Copy answer to clipboard
      navigator.clipboard.writeText(JSON.stringify(answer));
      setMessage(
        "Answer copied to clipboard. Share with the other participant."
      );
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      setCallStatus("connected");
    } catch (error) {
      console.error("Error handling answer:", error);
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
    sendDataChannelMessage({ type: "call-ended" });
    cleanup();
    setCallStatus("ended");

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
      const response = await axios.put(
        `https://medlink-bh5c.onrender.com/api/consultation/status/${consultationId}`,
        { status: "completed", notes },
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage("Consultation completed successfully!");
        setTimeout(() => {
          window.location.href = "/doctor/consultants";
        }, 2000);
      }
    } catch (error) {
      setMessage("Error completing consultation");
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
                </div>

                {/* Connection Status Overlay */}
                {!remoteUserConnected && (
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
                        Waiting for connection...
                      </h3>
                      <p className="text-gray-300">
                        {callStatus === "ready"
                          ? "Ready to connect"
                          : `Status: ${callStatus}`}
                      </p>
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

                {callStatus === "ready" && (
                  <button
                    onClick={createOffer}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full transition-colors"
                  >
                    Start Call
                  </button>
                )}

                <button
                  onClick={handleEndCall}
                  className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
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
                      d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l18 18"
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

                  {/* Simple Connection Instructions */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Connection Instructions
                    </h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>1. Click "Start Call" to create connection</p>
                      <p>2. Copy the offer/answer from clipboard</p>
                      <p>3. Share with the other participant</p>
                      <p>4. Paste their offer/answer below</p>
                    </div>

                    {/* Simple paste area for offers/answers */}
                    <div className="mt-4">
                      <textarea
                        className="w-full h-24 p-2 border rounded-md text-xs"
                        placeholder="Paste offer or answer here..."
                        onChange={(e) => {
                          try {
                            const data = JSON.parse(e.target.value);
                            if (data.type === "offer") {
                              createAnswer(data);
                            } else if (data.type === "answer") {
                              handleAnswer(data);
                            }
                          } catch (err) {
                            // Invalid JSON, ignore
                          }
                        }}
                      />
                    </div>
                  </div>

                  {userRole === "doctor" && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full h-32 p-3 border rounded-md resize-none"
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
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">{message}</p>
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
