import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

const PeerVideoCall = () => {
  const [peerId, setPeerId] = useState(""); // My Peer ID
  const [callToId, setCallToId] = useState(""); // ID to call
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    // 1. Initialize PeerJS
    const peer = new Peer(); // Uses default public PeerJS server
    peerRef.current = peer;

    peer.on("open", (id) => {
      console.log("My Peer ID:", id);
      setPeerId(id);
    });

    // 2. Get local media (camera + mic)
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 3. Listen for incoming calls
        peer.on("call", (call) => {
          call.answer(stream); // answer call with local stream
          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        });
      })
      .catch((err) => console.error("Failed to get local stream", err));

    return () => {
      peer.destroy();
    };
  }, []);

  // 4. Call another peer
  const callPeer = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        const call = peerRef.current.call(callToId, stream);
        call.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h2>Your Peer ID: {peerId}</h2>
      <input
        type="text"
        placeholder="Enter peer ID to call"
        value={callToId}
        onChange={(e) => setCallToId(e.target.value)}
      />
      <button onClick={callPeer}>Call</button>

      <div style={{ display: "flex", marginTop: 20 }}>
        <div>
          <h3>Local Video</h3>
          <video ref={localVideoRef} autoPlay muted style={{ width: 300 }} />
        </div>
        <div>
          <h3>Remote Video</h3>
          <video ref={remoteVideoRef} autoPlay style={{ width: 300 }} />
        </div>
      </div>
    </div>
  );
};

export default PeerVideoCall;
