import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const URL_WEB_SOCKET = "wss://medlink-bh5c.onrender.com/ws";

export default function VideoCall() {
  const ws = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // Get query params from URL
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const channelName = searchParams.get("channelName");
  const userName = searchParams.get("userName");

  useEffect(() => {
    ws.current = new WebSocket(URL_WEB_SOCKET);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setupDevice();
    };

    ws.current.onclose = () => console.log("WebSocket closed");

    ws.current.onmessage = (message) => {
      const { type, body } = JSON.parse(message.data);

      switch (type) {
        case "joined":
          console.log("Users in this channel", body);
          break;
        case "offer_sdp_received":
          handleOffer(body);
          break;
        case "answer_sdp_received":
          handleAnswer(body);
          break;
        case "ice_candidate_received":
          handleRemoteIceCandidate(body);
          break;
        default:
          break;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendWsMessage = (type, body) => {
    ws.current.send(JSON.stringify({ type, body }));
  };

  const setupDevice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;
      localStreamRef.current = stream;

      sendWsMessage("join", { channelName, userName });

      setupPeerConnection();
    } catch (err) {
      console.error("Error accessing camera/mic", err);
    }
  };

  const setupPeerConnection = () => {
    const pc = new RTCPeerConnection();

    // Add local tracks
    localStreamRef.current
      .getTracks()
      .forEach((track) => pc.addTrack(track, localStreamRef.current));

    // Listen for remote tracks
    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // Send ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWsMessage("ice_candidate", {
          channelName,
          userName,
          candidate: event.candidate,
        });
      }
    };

    peerConnectionRef.current = pc;

    createAndSendOffer();
  };

  const createAndSendOffer = async () => {
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);

    sendWsMessage("send_offer", { channelName, userName, sdp: offer });
  };

  const handleOffer = async (offer) => {
    const pc = new RTCPeerConnection();

    localStreamRef.current
      .getTracks()
      .forEach((track) => pc.addTrack(track, localStreamRef.current));

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWsMessage("ice_candidate", {
          channelName,
          userName,
          candidate: event.candidate,
        });
      }
    };

    peerConnectionRef.current = pc;

    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    sendWsMessage("send_answer", { channelName, userName, sdp: answer });
  };

  const handleAnswer = async (answer) => {
    await peerConnectionRef.current.setRemoteDescription(answer);
  };

  const handleRemoteIceCandidate = async (candidate) => {
    try {
      await peerConnectionRef.current.addIceCandidate(candidate);
    } catch (err) {
      console.error("Error adding remote ICE candidate", err);
    }
  };

  return (
    <div className="flex flex-row w-full justify-center items-center m-auto p-8 h-screen">
      <video
        ref={localVideoRef}
        autoPlay
        muted
        style={{ width: 640, height: 480 }}
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        style={{ width: 640, height: 480 }}
      />
    </div>
  );
}
