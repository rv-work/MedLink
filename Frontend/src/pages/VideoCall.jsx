import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const RemoteVideo = ({ stream, userId }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div>
      <h4>Remote User: {userId}</h4>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "300px", border: "2px solid green", margin: "5px" }}
      />
    </div>
  );
};

const VideoCall = () => {
  const { consultationId } = useParams();
  const localVideoRef = useRef();
  const localStreamRef = useRef();
  const peersRef = useRef({});
  const socketRef = useRef();
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState([]);

  const pcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    initializeCall();
    return cleanup;
  }, [consultationId]);

  const initializeCall = async () => {
    try {
      // Get user media first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localVideoRef.current.srcObject = stream;
      localStreamRef.current = stream;

      // Initialize socket connection
      socketRef.current = io("https://medlink-bh5c.onrender.com");

      setupSocketListeners();

      // Join the room
      socketRef.current.emit("join-room", { roomId: consultationId });
    } catch (error) {
      console.error("Error initializing call:", error);
    }
  };

  const setupSocketListeners = () => {
    // When someone is already in the room
    socketRef.current.on("other-user", (userId) => {
      console.log("Other user in room:", userId);
      callUser(userId);
    });

    // When a new user joins
    socketRef.current.on("user-joined", (userId) => {
      console.log("User joined:", userId);
      setConnectedUsers((prev) => [
        ...prev.filter((id) => id !== userId),
        userId,
      ]);
    });

    // Handle incoming offer
    socketRef.current.on("offer", async ({ sdp, caller }) => {
      console.log("Received offer from:", caller);
      await handleOffer(sdp, caller);
    });

    // Handle answer to our offer
    socketRef.current.on("answer", async ({ sdp, caller }) => {
      console.log("Received answer from:", caller);
      await handleAnswer(sdp, caller);
    });

    // Handle ICE candidates
    socketRef.current.on("ice-candidate", ({ candidate, from }) => {
      console.log("Received ICE candidate from:", from);
      handleIceCandidate(candidate, from);
    });

    // Handle user disconnect
    socketRef.current.on("user-left", (userId) => {
      console.log("User left:", userId);
      removeUser(userId);
    });
  };

  const callUser = async (userId) => {
    console.log("Calling user:", userId);
    const peer = createPeerConnection(userId);
    peersRef.current[userId] = peer;

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socketRef.current.emit("offer", {
        target: userId,
        sdp: offer,
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const createPeerConnection = (userId) => {
    const peer = new RTCPeerConnection(pcConfig);

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote stream
    peer.ontrack = (event) => {
      console.log("Received remote stream from:", userId);
      const [remoteStream] = event.streams;

      setRemoteStreams((prev) => ({
        ...prev,
        [userId]: remoteStream,
      }));
    };

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          target: userId,
          candidate: event.candidate,
        });
      }
    };

    // Connection state changes
    peer.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, peer.connectionState);
      if (peer.connectionState === "failed") {
        // Attempt to restart ICE
        peer.restartIce();
      }
    };

    return peer;
  };

  const handleOffer = async (sdp, caller) => {
    try {
      const peer = createPeerConnection(caller);
      peersRef.current[caller] = peer;

      await peer.setRemoteDescription(new RTCSessionDescription(sdp));

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socketRef.current.emit("answer", {
        target: caller,
        sdp: answer,
      });

      setConnectedUsers((prev) => [
        ...prev.filter((id) => id !== caller),
        caller,
      ]);
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async (sdp, caller) => {
    try {
      const peer = peersRef.current[caller];
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
        setConnectedUsers((prev) => [
          ...prev.filter((id) => id !== caller),
          caller,
        ]);
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleIceCandidate = async (candidate, from) => {
    try {
      const peer = peersRef.current[from];
      if (peer && peer.remoteDescription) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  };

  const removeUser = (userId) => {
    const peer = peersRef.current[userId];
    if (peer) {
      peer.close();
      delete peersRef.current[userId];
    }

    setRemoteStreams((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });

    setConnectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !isAudioOn;
      setIsAudioOn(!isAudioOn);
    }
  };

  const cleanup = () => {
    // Clean up streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Clean up peer connections
    Object.values(peersRef.current).forEach((peer) => peer.close());

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  return (
    <div>
      <h3>Consultation ID: {consultationId}</h3>
      <p>Connected Users: {connectedUsers.length}</p>

      <div>
        <h4>Local Video (You)</h4>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "300px", border: "2px solid blue", margin: "5px" }}
        />
        <div style={{ marginBottom: "20px" }}>
          <button onClick={toggleVideo}>
            {isVideoOn ? "Stop Video" : "Start Video"}
          </button>
          <button onClick={toggleAudio}>{isAudioOn ? "Mute" : "Unmute"}</button>
        </div>
      </div>

      <div>
        <h4>Remote Videos</h4>
        {Object.entries(remoteStreams).map(([userId, stream]) => (
          <RemoteVideo key={userId} userId={userId} stream={stream} />
        ))}
        {Object.keys(remoteStreams).length === 0 && (
          <p>Waiting for other participants...</p>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
