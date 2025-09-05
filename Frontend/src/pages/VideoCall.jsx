import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function SimpleVideoCall() {
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const wsRef = useRef(null);
  const peerConnectionsRef = useRef({});

  const [remoteStreams, setRemoteStreams] = useState({});

  const { consultationId } = useParams();
  const navigate = useNavigate();

  const channelName = `consultation-${consultationId}`;
  const userName = `user-${Date.now()}`;

  // Get camera/mic
  const setupLocalVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  };

  // WebSocket connection
  const connectWebSocket = () => {
    wsRef.current = new WebSocket("wss://medlink-bh5c.onrender.com/ws");

    wsRef.current.onopen = () => {
      // Join channel
      wsRef.current.send(
        JSON.stringify({
          type: "join",
          body: { channelName, userName },
        })
      );
    };

    wsRef.current.onmessage = async (message) => {
      const { type, body } = JSON.parse(message.data);

      if (type === "joined") {
        // Existing users in the room
        body.forEach((user) => {
          if (user.userName !== userName) {
            createPeerConnection(user.userName, true); // I joined later, so I'm initiator
          }
        });
      }

      if (type === "offer_sdp_received") {
        const pc = peerConnectionsRef.current[body.from];
        if (!pc) return;

        if (!pc.currentRemoteDescription) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(body.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            wsRef.current.send(
              JSON.stringify({
                type: "send_answer",
                body: {
                  channelName,
                  userName,
                  from: userName,
                  to: body.from,
                  sdp: answer,
                },
              })
            );
          } catch (err) {
            console.error("Error handling offer:", err);
          }
        } else {
          console.log("Offer already applied, skipping duplicate.");
        }
      }

      if (type === "answer_sdp_received") {
        const pc = peerConnectionsRef.current[body.from];
        if (!pc) return;

        if (!pc.currentRemoteDescription) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(body.sdp));
          } catch (err) {
            console.error("Error setting remote answer:", err);
          }
        } else {
          console.log("Answer already applied, skipping duplicate.");
        }
      }

      if (type === "ice_candidate_received") {
        const pc = peerConnectionsRef.current[body.from];
        if (pc && body.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(body.candidate));
          } catch (err) {
            console.error("Error adding ICE candidate", err);
          }
        }
      }
    };
  };

  // Create WebRTC connection
  const createPeerConnection = async (remoteUserName, isInitiator = false) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun.services.mozilla.com" },
      ],
    });

    peerConnectionsRef.current[remoteUserName] = pc;

    // Add local tracks
    localStreamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

    // Get remote stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams((prev) => ({
        ...prev,
        [remoteUserName]: remoteStream,
      }));
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current.send(
          JSON.stringify({
            type: "send_ice_candidate",
            body: {
              channelName,
              userName,
              from: userName,
              to: remoteUserName,
              candidate: event.candidate,
            },
          })
        );
      }
    };

    // If I'm initiator → create offer
    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        wsRef.current.send(
          JSON.stringify({
            type: "send_offer",
            body: {
              channelName,
              userName,
              from: userName,
              to: remoteUserName,
              sdp: offer,
            },
          })
        );
      } catch (err) {
        console.error("Error creating offer:", err);
      }
    }
  };

  // Initialize
  useEffect(() => {
    setupLocalVideo().then(() => {
      connectWebSocket();
    });

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
      wsRef.current?.close();
    };
  }, []);

  return (
    <div>
      {/* Local Video */}
      <video ref={localVideoRef} autoPlay muted width="400" height="300" />

      {/* Remote Videos */}
      {Object.entries(remoteStreams).map(([userId, stream]) => (
        <video
          key={userId}
          autoPlay
          width="400"
          height="300"
          ref={(video) => {
            if (video && stream) {
              video.srcObject = stream;
            }
          }}
        />
      ))}

      {/* End Call Button */}
      <button onClick={() => navigate("/dashboard")}>End Call</button>
    </div>
  );
}
