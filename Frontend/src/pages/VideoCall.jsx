import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import translationService from "../utils/TranslationService";

const URL_WEB_SOCKET = "wss://medlink-bh5c.onrender.com/ws";
const ICE_SERVERS_ENDPOINT = window.__ICE_SERVERS_ENDPOINT || null;

export default function VideoCall() {
  const ws = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const navigate = useNavigate();
  const { consultationId } = useParams();
  const pendingCandidatesRef = useRef({});
  const isInitiatorRef = useRef({});

  // Video play promise tracking to prevent interruption errors
  const playPromisesRef = useRef({});

  const [remoteStreams, setRemoteStreams] = useState({});
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [localVideoReady, setLocalVideoReady] = useState(false);

  // Translation states
  const [selectedLanguage, setSelectedLanguage] = useState("hi");
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(true);
  const [translationVolume, setTranslationVolume] = useState(0.8);
  const [originalVolume, setOriginalVolume] = useState(1.0);
  const [isListening, setIsListening] = useState(false);
  const [translations, setTranslations] = useState([]);
  const [showLanguageGroups, setShowLanguageGroups] = useState(false);
  const [showTranslationSettings, setShowTranslationSettings] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [popularLanguages, setPopularLanguages] = useState([]);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  let channelName = searchParams.get("channelName");
  let userName = searchParams.get("userName");

  if (!channelName && consultationId) {
    channelName = `consultation-${consultationId}`;
  }
  if (!userName && consultationId) {
    const isDoctor = location.pathname.includes("/doctor/");
    userName = isDoctor ? `doctor-${Date.now()}` : `patient-${Date.now()}`;
  }

  const languages = translationService.getSupportedLanguages();
  const languageFamilies = translationService.getLanguageFamilies();
  const stateLanguages = translationService.getStateLanguages();
  const quickSwitchLanguages = translationService.getQuickSwitchLanguages();

  useEffect(() => {
    setPopularLanguages(translationService.getPopularLanguages());
  }, []);

  useEffect(() => {
    let interval;
    if (isCallStarted) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallStarted]);

  // Improved video play function to handle play promise properly
  const safeVideoPlay = useCallback(async (videoElement, userId = "local") => {
    if (!videoElement) return;

    try {
      // Cancel any existing play promise
      if (playPromisesRef.current[userId]) {
        try {
          await playPromisesRef.current[userId];
        } catch (e) {
          // Ignore abort errors from previous play attempts
        }
      }

      // Only attempt to play if video is paused and has data
      if (videoElement.paused && videoElement.readyState >= 2) {
        playPromisesRef.current[userId] = videoElement.play();
        await playPromisesRef.current[userId];
        console.log(`Video started playing for ${userId}`);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn(`Video play failed for ${userId}:`, error);
      }
    } finally {
      delete playPromisesRef.current[userId];
    }
  }, []);

  // Speech Recognition setup
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.maxAlternatives = 3;
      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error("Error restarting recognition:", error);
            setIsListening(false);
          }
        }
      };
    }
  }, [selectedLanguage, isListening]);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0
      ? `${hrs}:${mins.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`
      : `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getIceServers = async () => {
    try {
      if (ICE_SERVERS_ENDPOINT) {
        const res = await fetch(ICE_SERVERS_ENDPOINT, { method: "GET" });
        if (res.ok) {
          const json = await res.json();
          if (json && json.iceServers) {
            console.log("Using iceServers from configured endpoint");
            return json.iceServers;
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch ice servers from endpoint:", err);
    }

    // Improved ICE servers configuration
    const fallback = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun.stunprotocol.org:3478" },
      { urls: "stun:stun.services.mozilla.com" },
      {
        urls: [
          "turn:relay.metered.ca:80",
          "turn:relay.metered.ca:443",
          "turn:relay.metered.ca:443?transport=tcp",
        ],
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ];

    console.warn(
      "Using fallback ICE servers. For production, configure an ICE_SERVERS_ENDPOINT."
    );
    return fallback;
  };

  // WebSocket setup
  useEffect(() => {
    if (!channelName || !userName) {
      toast.error("Invalid consultation session");
      navigate("/dashboard");
      return;
    }

    setupLocalVideo();

    try {
      ws.current = new WebSocket(URL_WEB_SOCKET);
    } catch (err) {
      console.error("WebSocket creation error:", err);
      toast.error("Could not create WebSocket. Check URL.");
      setConnectionStatus("error");
      return;
    }

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("connected");
      if (localStreamRef.current) {
        joinChannel();
      }
    };

    ws.current.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setConnectionStatus("disconnected");
      // Attempt reconnection after a delay
      if (event.code !== 1000) {
        // Not a normal closure
        setTimeout(() => {
          if (ws.current?.readyState === WebSocket.CLOSED) {
            toast.error("Connection lost. Attempting to reconnect...");
            // Implement reconnection logic here
          }
        }, 3000);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
      toast.error("Connection error occurred");
    };

    ws.current.onmessage = (message) => {
      try {
        const { type, body } = JSON.parse(message.data);
        console.log("Received message:", type, body);

        switch (type) {
          case "joined":
            handleJoined(body);
            break;
          case "offer_sdp_received":
            handleOffer(body.from, body.sdp);
            break;
          case "answer_sdp_received":
            handleAnswer(body.from, body.sdp);
            break;
          case "ice_candidate_received":
            handleRemoteIceCandidate(body.from, body.candidate);
            break;
          case "chat_message":
            handleChatMessage(body);
            break;
          case "translation_received":
            handleTranslationReceived(body);
            break;
          case "language_changed":
            handleLanguageChanged(body);
            break;
          default:
            console.warn("Unknown ws message type:", type);
        }
      } catch (err) {
        console.error("Error parsing ws message:", err);
      }
    };

    return () => {
      cleanup();
    };
  }, [channelName, userName, navigate]);

  const setupLocalVideo = async () => {
    try {
      console.log("Setting up local video...");
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
          sampleRate: 44100,
        },
      });

      localStreamRef.current = stream;
      console.log("Local stream obtained:", stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;

        // Improved video loading and play handling
        const handleLoadedMetadata = async () => {
          console.log("Local video metadata loaded");
          setLocalVideoReady(true);
          await safeVideoPlay(localVideoRef.current, "local");
        };

        localVideoRef.current.addEventListener(
          "loadedmetadata",
          handleLoadedMetadata,
          { once: true }
        );

        // Handle play errors gracefully
        localVideoRef.current.addEventListener("error", (error) => {
          console.error("Local video error:", error);
        });
      }

      toast.success("Camera and microphone connected");

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        joinChannel();
      }
    } catch (err) {
      console.error("Error accessing camera/mic", err);
      if (err.name === "NotAllowedError") {
        toast.error(
          "Camera/microphone access denied. Please allow permissions and refresh."
        );
      } else if (err.name === "NotFoundError") {
        toast.error("No camera/microphone found on this device");
      } else {
        toast.error("Unable to access camera/microphone");
      }
      setConnectionStatus("error");
    }
  };

  const joinChannel = () => {
    console.log("Joining channel...");
    sendWsMessage("join", {
      channelName,
      userName,
      language: selectedLanguage,
    });
  };

  const cleanup = () => {
    console.log("Cleaning up...");

    // Clear all play promises
    Object.keys(playPromisesRef.current).forEach((userId) => {
      delete playPromisesRef.current[userId];
    });

    if (ws.current) {
      sendWsMessage("quit", { channelName, userName });
      try {
        ws.current.close();
      } catch (e) {}
      ws.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
      recognitionRef.current = null;
    }

    Object.values(peerConnectionsRef.current).forEach((pc) => {
      try {
        pc.close();
      } catch (e) {}
    });

    peerConnectionsRef.current = {};
    pendingCandidatesRef.current = {};
    isInitiatorRef.current = {};
  };

  const sendWsMessage = useCallback((type, body) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        console.log("Sending message:", type, body);
        ws.current.send(JSON.stringify({ type, body }));
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
      }
    } else {
      console.warn("WebSocket not open; cannot send message:", type);
    }
  }, []);

  const setupPeerConnection = async (
    remoteUserName,
    shouldCreateOffer = false
  ) => {
    console.log(
      `Setting up peer connection with ${remoteUserName}, shouldCreateOffer: ${shouldCreateOffer}`
    );

    if (peerConnectionsRef.current[remoteUserName]) {
      console.log(`Peer connection already exists for ${remoteUserName}`);
      return;
    }

    if (!localStreamRef.current) {
      console.warn(
        "Local stream not available, delaying peer connection setup"
      );
      setTimeout(
        () => setupPeerConnection(remoteUserName, shouldCreateOffer),
        1000
      );
      return;
    }

    let iceServers = [];
    try {
      iceServers = await getIceServers();
    } catch (err) {
      console.warn("getIceServers failed, using empty iceServers", err);
    }

    // Improved RTCPeerConnection configuration
    const pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10,
      bundlePolicy: "balanced",
      rtcpMuxPolicy: "require",
      iceTransportPolicy: "all",
    });

    pendingCandidatesRef.current[remoteUserName] = [];
    isInitiatorRef.current[remoteUserName] = shouldCreateOffer;

    // Add local tracks
    localStreamRef.current.getTracks().forEach((track) => {
      try {
        console.log(`Adding local track to peer connection: ${track.kind}`);
        pc.addTrack(track, localStreamRef.current);
      } catch (err) {
        console.warn("Error adding local track:", err);
      }
    });

    // Handle remote tracks with improved stream management
    pc.ontrack = (event) => {
      console.log(
        `Received remote track from ${remoteUserName}:`,
        event.track.kind
      );
      if (event.streams && event.streams[0]) {
        setRemoteStreams((prev) => {
          const updated = {
            ...prev,
            [remoteUserName]: event.streams[0],
          };
          console.log(`Remote stream updated for ${remoteUserName}`);
          return updated;
        });
      }
    };

    // Improved ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`ICE candidate for ${remoteUserName}:`, event.candidate);
        sendWsMessage("send_ice_candidate", {
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
      } else {
        console.log(`ICE gathering completed for ${remoteUserName}`);
      }
    };

    // Enhanced connection state handling
    pc.onconnectionstatechange = () => {
      console.log(
        `Connection state for ${remoteUserName}:`,
        pc.connectionState
      );

      switch (pc.connectionState) {
        case "connected":
          console.log(`Successfully connected to ${remoteUserName}`);
          toast.success(`Connected to ${remoteUserName}`);
          break;
        case "failed":
          console.log(
            `Connection failed for ${remoteUserName}, attempting restart`
          );
          handleConnectionFailure(remoteUserName, pc);
          break;
        case "disconnected":
          console.log(`Connection disconnected for ${remoteUserName}`);
          // Don't immediately remove stream, wait for reconnection
          setTimeout(() => {
            if (pc.connectionState === "disconnected") {
              setRemoteStreams((prev) => {
                const updated = { ...prev };
                delete updated[remoteUserName];
                return updated;
              });
            }
          }, 5000); // Wait 5 seconds before removing
          break;
        case "closed":
          console.log(`Connection closed for ${remoteUserName}`);
          setRemoteStreams((prev) => {
            const updated = { ...prev };
            delete updated[remoteUserName];
            return updated;
          });
          break;
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(
        `ICE connection state for ${remoteUserName}:`,
        pc.iceConnectionState
      );

      // Handle ICE connection state changes
      if (pc.iceConnectionState === "failed") {
        handleConnectionFailure(remoteUserName, pc);
      }
    };

    // Handle ICE gathering state
    pc.onicegatheringstatechange = () => {
      console.log(
        `ICE gathering state for ${remoteUserName}:`,
        pc.iceGatheringState
      );
    };

    peerConnectionsRef.current[remoteUserName] = pc;

    if (shouldCreateOffer) {
      try {
        console.log(`Creating offer for ${remoteUserName}`);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        sendWsMessage("send_offer", {
          channelName,
          userName,
          from: userName,
          to: remoteUserName,
          sdp: offer,
        });
      } catch (err) {
        console.error(`Error creating offer for ${remoteUserName}:`, err);
      }
    }

    return pc;
  };

  // New function to handle connection failures
  const handleConnectionFailure = async (remoteUserName, pc) => {
    console.log(`Handling connection failure for ${remoteUserName}`);

    try {
      // Attempt ICE restart
      pc.restartIce();
      console.log(`ICE restart initiated for ${remoteUserName}`);
    } catch (error) {
      console.error(`ICE restart failed for ${remoteUserName}:`, error);

      // As a last resort, recreate the peer connection
      setTimeout(() => {
        if (pc.connectionState === "failed") {
          console.log(`Recreating peer connection for ${remoteUserName}`);
          delete peerConnectionsRef.current[remoteUserName];
          delete pendingCandidatesRef.current[remoteUserName];
          delete isInitiatorRef.current[remoteUserName];

          // Recreate with same initiation logic
          const shouldCreateOffer = userName < remoteUserName;
          setupPeerConnection(remoteUserName, shouldCreateOffer);
        }
      }, 3000);
    }
  };

  const handleOffer = async (from, offer) => {
    console.log(`Handling offer from ${from}`);

    let pc = peerConnectionsRef.current[from];
    if (!pc) {
      pc = await setupPeerConnection(from, false);
    }

    if (!pc) {
      console.error(`No peer connection found for ${from}`);
      return;
    }

    try {
      // Check if we can set the remote description
      if (
        pc.signalingState === "stable" ||
        pc.signalingState === "have-local-offer"
      ) {
        console.log(`Setting remote description for ${from}`);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Process pending ICE candidates
        await processPendingCandidates(from, pc);

        console.log(`Creating answer for ${from}`);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        sendWsMessage("send_answer", {
          channelName,
          userName,
          from: userName,
          to: from,
          sdp: answer,
        });
      } else {
        console.warn(
          `Invalid signaling state for setting remote description: ${pc.signalingState}`
        );
      }
    } catch (err) {
      console.error(`Error handling offer from ${from}:`, err);
    }
  };

  const handleAnswer = async (from, answer) => {
    console.log(`Handling answer from ${from}`);
    const pc = peerConnectionsRef.current[from];

    if (!pc) {
      console.error(`No peer connection found for ${from}`);
      return;
    }

    try {
      if (pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`Remote description set for ${from}`);

        // Process pending ICE candidates
        await processPendingCandidates(from, pc);
      } else {
        console.warn(
          `Invalid state for setting remote description: ${pc.signalingState}`
        );
      }
    } catch (err) {
      console.error(`Error handling answer from ${from}:`, err);
    }
  };

  // New function to process pending ICE candidates
  const processPendingCandidates = async (from, pc) => {
    const pending = pendingCandidatesRef.current[from] || [];
    console.log(
      `Processing ${pending.length} pending ICE candidates for ${from}`
    );

    for (const candidate of pending) {
      try {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`Added pending ICE candidate for ${from}`);
        }
      } catch (err) {
        console.error("Error adding pending candidate:", err);
      }
    }
    pendingCandidatesRef.current[from] = [];
  };

  const handleRemoteIceCandidate = async (from, candidate) => {
    console.log(`Received ICE candidate from ${from}`);
    const pc = peerConnectionsRef.current[from];

    if (!pc) {
      console.warn(
        `No peer connection found for ${from}, ignoring ICE candidate`
      );
      return;
    }

    try {
      if (pc.remoteDescription && pc.remoteDescription.sdp) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`Added ICE candidate from ${from}`);
      } else {
        console.log(
          `Queuing ICE candidate from ${from} (no remote description yet)`
        );
        if (!pendingCandidatesRef.current[from]) {
          pendingCandidatesRef.current[from] = [];
        }
        pendingCandidatesRef.current[from].push(candidate);
      }
    } catch (err) {
      console.error(`Error adding ICE candidate from ${from}:`, err);
    }
  };

  const handleJoined = (userNames) => {
    console.log("Users in channel:", userNames);
    setParticipants(userNames);

    if (userNames.length > 1 && !isCallStarted) {
      setIsCallStarted(true);
      toast.success("Call started successfully!");
    }

    const currentConnections = Object.keys(peerConnectionsRef.current);
    const newUsers = userNames.filter(
      (user) =>
        user.userName !== userName &&
        !currentConnections.includes(user.userName)
    );

    newUsers.forEach((user, index) => {
      const shouldCreateOffer = userName < user.userName;
      console.log(
        `Setting up new connection: ${userName} -> ${user.userName}, shouldCreateOffer: ${shouldCreateOffer}`
      );

      setTimeout(() => {
        setupPeerConnection(user.userName, shouldCreateOffer);
      }, 500 * (index + 1)); // Increased delay and staggered
    });

    // Clean up connections for users who left
    const currentUserNames = userNames.map((u) => u.userName);
    currentConnections.forEach((connectionName) => {
      if (!currentUserNames.includes(connectionName)) {
        console.log(`Cleaning up connection for ${connectionName} (user left)`);
        try {
          peerConnectionsRef.current[connectionName].close();
        } catch (e) {
          console.error("Error closing peer connection:", e);
        }
        delete peerConnectionsRef.current[connectionName];
        delete pendingCandidatesRef.current[connectionName];
        delete isInitiatorRef.current[connectionName];

        setRemoteStreams((prev) => {
          const updated = { ...prev };
          delete updated[connectionName];
          return updated;
        });

        toast.info(`${connectionName} left the call`);
      }
    });
  };

  // Speech recognition and translation functions
  const handleSpeechResult = async (event) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript.trim();

    if (event.results[current].isFinal && transcript.length > 0) {
      console.log("Final transcript:", transcript);

      const otherParticipants = participants.filter(
        (p) => p.userName !== userName && p.language !== selectedLanguage
      );

      for (const participant of otherParticipants) {
        try {
          const translatedText = await translationService.translate(
            transcript,
            selectedLanguage,
            participant.language
          );

          sendWsMessage("translation", {
            channelName,
            from: userName,
            originalText: transcript,
            translatedText,
            sourceLanguage: selectedLanguage,
            targetLanguage: participant.language,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Translation failed:", error);
        }
      }
    }
  };

  const handleTranslationReceived = (data) => {
    const {
      from,
      originalText,
      translatedText,
      sourceLanguage,
      targetLanguage,
      timestamp,
    } = data;

    setTranslations((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        from,
        originalText,
        translatedText,
        sourceLanguage,
        targetLanguage,
        timestamp,
      },
    ]);

    if (isTranslationEnabled) {
      speakTranslation(translatedText, targetLanguage);
    }
  };

  const speakTranslation = (text, targetLang) => {
    if (synthRef.current && text) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      utterance.volume = translationVolume;
      utterance.rate = 0.8;
      utterance.pitch = 1.2;

      const voice = translationService.getBestVoice(targetLang);
      if (voice) {
        utterance.voice = voice;
      }

      synthRef.current.speak(utterance);
    }
  };

  const handleLanguageChanged = (data) => {
    const { userName: changedUser, newLanguage, userList } = data;
    setParticipants(userList);
    toast.info(
      `${changedUser} switched to ${languages[newLanguage]?.split("(")[0]}`
    );
  };

  const handleChatMessage = (messageData) => {
    setMessages((prev) => [...prev, messageData]);
  };

  // UI control functions
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
        toast.success(`Camera ${!isVideoEnabled ? "enabled" : "disabled"}`);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
        toast.success(`Microphone ${!isAudioEnabled ? "enabled" : "disabled"}`);
      }
    }
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.success("Speech recognition stopped");
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success("Speech recognition started");
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast.error("Could not start speech recognition");
      }
    }
  };

  const changeLanguage = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLanguage;
    }

    sendWsMessage("language_change", {
      channelName,
      userName,
      newLanguage,
    });

    toast.success(
      `Language changed to ${languages[newLanguage]?.split("(")[0]}`
    );
  };

  const endCall = () => {
    if (window.confirm("Are you sure you want to end the call?")) {
      cleanup();
      toast.success("Call ended");

      const isDoctor = location.pathname.includes("/doctor/");
      if (isDoctor) {
        navigate("/doctor/consultants");
      } else {
        navigate("/dashboard");
      }
    }
  };

  const sendChatMessage = () => {
    if (currentMessage.trim()) {
      const message = {
        from: userName,
        message: currentMessage,
        timestamp: new Date().toISOString(),
      };
      sendWsMessage("chat_message", {
        channelName,
        ...message,
      });
      setMessages((prev) => [...prev, message]);
      setCurrentMessage("");
    }
  };

  // Improved video click handler
  const handleVideoClick = async (videoRef, userId = "unknown") => {
    if (videoRef.current) {
      await safeVideoPlay(videoRef.current, userId);
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-white text-xl font-semibold">
            🏥 Medical Consultation
          </h1>
          {isCallStarted && (
            <p className="text-gray-300 text-sm">
              Duration: {formatDuration(callDuration)}
            </p>
          )}
          {consultationId && (
            <p className="text-gray-400 text-xs">ID: {consultationId}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-white text-sm">भाषा/Language:</label>
            <div className="relative">
              <button
                onClick={() => setShowLanguageGroups(!showLanguageGroups)}
                className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 hover:bg-gray-600 transition-colors"
              >
                <span className="text-sm">
                  {languages[selectedLanguage]?.split("(")[0] ||
                    "Select Language"}
                </span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showLanguageGroups && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border w-80 max-h-96 overflow-y-auto z-50">
                  <div className="p-3 border-b">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      🔥 Popular in India
                    </h4>
                    <div className="grid grid-cols-2 gap-1">
                      {popularLanguages.map((code) => (
                        <button
                          key={code}
                          onClick={() => {
                            changeLanguage(code);
                            setShowLanguageGroups(false);
                          }}
                          className="text-left p-2 hover:bg-blue-50 rounded text-sm text-gray-700 hover:text-blue-600"
                        >
                          {languages[code]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {Object.entries(languageFamilies).map(([family, codes]) => (
                    <div key={family} className="p-3 border-b">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {family}
                      </h4>
                      <div className="space-y-1">
                        {codes.map((code) =>
                          languages[code] ? (
                            <button
                              key={code}
                              onClick={() => {
                                changeLanguage(code);
                                setShowLanguageGroups(false);
                              }}
                              className={`block w-full text-left p-2 hover:bg-blue-50 rounded text-sm transition-colors ${
                                selectedLanguage === code
                                  ? "bg-blue-100 text-blue-600"
                                  : "text-gray-700 hover:text-blue-600"
                              }`}
                            >
                              {languages[code]}
                            </button>
                          ) : null
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="p-3">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      🌍 By Region/City
                    </h4>
                    <select
                      value={selectedRegion}
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        if (e.target.value && stateLanguages[e.target.value]) {
                          const regionLangs = stateLanguages[e.target.value];
                          setPopularLanguages(regionLangs);
                        }
                      }}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Select your region...</option>
                      {Object.keys(stateLanguages)
                        .sort()
                        .map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded">
            <span className="text-xs text-gray-300">Speaking:</span>
            <span className="text-xs text-white font-mono">
              {languages[selectedLanguage]?.split("(")[0]}
            </span>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              connectionStatus === "connected"
                ? "bg-green-100 text-green-800"
                : connectionStatus === "connecting"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {connectionStatus === "connected"
              ? "जुड़ा हुआ/Connected"
              : connectionStatus === "connecting"
              ? "जुड़ रहा है/Connecting..."
              : "कनेक्शन टूटा/Disconnected"}
          </span>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 relative">
          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-full">
            {/* Local Video - Always show */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => handleVideoClick(localVideoRef, "local")}
                onError={(e) => {
                  console.error("Local video error:", e);
                }}
              />

              {!localVideoReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Starting camera...</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                You ({userName})
              </div>
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                🗣️ {languages[selectedLanguage]?.split("(")[0]}
              </div>

              <div className="absolute top-4 right-4 flex flex-col space-y-1">
                {!isVideoEnabled && (
                  <div className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                    📹 बंद/Off
                  </div>
                )}
                {!isAudioEnabled && (
                  <div className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                    🔇 मूक/Mute
                  </div>
                )}
                {isListening && (
                  <div className="bg-green-600 text-white px-2 py-1 rounded text-xs animate-pulse">
                    🎤 सुन रहा है/Listening
                  </div>
                )}
              </div>
            </div>

            {/* Remote Videos */}
            {Object.entries(remoteStreams).map(([userId, stream]) => {
              const userLang =
                participants.find((p) => p.userName === userId)?.language ||
                "en";
              return (
                <div
                  key={userId}
                  className="relative bg-gray-800 rounded-lg overflow-hidden"
                >
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(video) => {
                      if (video && stream && video.srcObject !== stream) {
                        video.srcObject = stream;
                        safeVideoPlay(video, userId);
                      }
                    }}
                    onLoadedMetadata={(e) => {
                      safeVideoPlay(e.target, userId);
                    }}
                    onError={(e) => {
                      console.error(`Remote video error for ${userId}:`, e);
                    }}
                  />
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {userId}
                  </div>
                  <div className="absolute top-4 left-4 bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    🗣️ {languages[userLang]?.split("(")[0] || "Unknown"}
                  </div>
                  {selectedLanguage !== userLang && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                        🔄 अनुवाद/Translate
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Waiting message when no remote users */}
            {Object.keys(remoteStreams).length === 0 &&
              participants.length === 1 && (
                <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-300">
                      अन्य प्रतिभागियों का इंतजार / Waiting for other
                      participants...
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      कंसल्टेशन लिंक साझा करें / Share the consultation link
                    </p>
                  </div>
                </div>
              )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-3 bg-black bg-opacity-75 rounded-full px-6 py-3">
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  isVideoEnabled
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
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
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                    />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  isAudioEnabled
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
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
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-3a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleSpeechRecognition}
                className={`p-3 rounded-full transition-colors relative ${
                  isListening
                    ? "bg-green-600 text-white hover:bg-green-700 animate-pulse"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
                title={
                  isListening
                    ? "अनुवाद बंद करें / Stop translation"
                    : "अनुवाद शुरू करें / Start translation"
                }
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
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                {isListening && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 animate-ping"></span>
                )}
              </button>

              <button
                onClick={() =>
                  setShowTranslationSettings(!showTranslationSettings)
                }
                className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                title="Translation settings"
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-3 rounded-full transition-colors relative ${
                  showChat
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
                title="Toggle chat"
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {(messages.length > 0 || translations.length > 0) && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {messages.length + translations.length}
                  </span>
                )}
              </button>

              <button
                onClick={endCall}
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                title="End call"
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
                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l1.664 1.664M21 21l-1.336-1.336m0 0A10.94 10.94 0 0012 21c-6.075 0-11-4.925-11-11 0-2.997 1.2-5.707 3.146-7.854m0 0L5.482 0.818M21 21l-1.664-1.664"
                  />
                </svg>
              </button>

              <div className="flex items-center bg-gray-800 rounded-full px-3 py-1">
                <span className="text-white text-xs mr-2">Quick:</span>
                {quickSwitchLanguages.map((code) => (
                  <button
                    key={code}
                    onClick={() => changeLanguage(code)}
                    className={`px-2 py-1 mx-1 rounded text-xs transition-colors ${
                      selectedLanguage === code
                        ? "bg-blue-600 text-white"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    }`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Translation Settings Modal */}
          {showTranslationSettings && (
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-4 shadow-lg w-80 z-40">
              <h3 className="font-semibold mb-3">🔧 Translation Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Enable Translation</label>
                  <input
                    type="checkbox"
                    checked={isTranslationEnabled}
                    onChange={(e) => setIsTranslationEnabled(e.target.checked)}
                    className="rounded"
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">
                    Translation Voice Volume
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={translationVolume}
                    onChange={(e) =>
                      setTranslationVolume(Number(e.target.value))
                    }
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">
                    {Math.round(translationVolume * 100)}%
                  </span>
                </div>
                <div>
                  <label className="text-sm block mb-1">
                    Original Audio Volume
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={originalVolume}
                    onChange={(e) => {
                      setOriginalVolume(Number(e.target.value));
                      Object.values(remoteStreams).forEach((stream) => {
                        const audioTracks = stream.getAudioTracks();
                        audioTracks.forEach((track) => {
                          track.enabled = Number(e.target.value) > 0;
                        });
                      });
                    }}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">
                    {Math.round(originalVolume * 100)}%
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowTranslationSettings(false)}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700"
              >
                बंद करें / Close
              </button>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-white border-l flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">
                  💬 चैट और अनुवाद / Chat & Translation
                </h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {participants.length} प्रतिभागी / participants
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {translations.map((trans, index) => (
                <div
                  key={`trans-${trans.id}-${index}`}
                  className="border-l-4 border-green-400 pl-3 py-2 bg-green-50 rounded-r"
                >
                  <div className="text-xs text-green-600 mb-1 flex items-center">
                    🌐 <span className="ml-1">{trans.from} का अनुवाद</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1 hindi-font">
                    <strong>
                      मूल ({languages[trans.sourceLanguage]?.split("(")[0]}):
                    </strong>{" "}
                    {trans.originalText}
                  </div>
                  <div className="text-sm text-gray-800 hindi-font">
                    <strong>
                      अनुवादित ({languages[trans.targetLanguage]?.split("(")[0]}
                      ):
                    </strong>{" "}
                    {trans.translatedText}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>
                      {new Date(trans.timestamp).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() =>
                        speakTranslation(
                          trans.translatedText,
                          trans.targetLanguage
                        )
                      }
                      className="text-blue-600 hover:text-blue-800"
                      title="फिर से सुनें / Play again"
                    >
                      🔊
                    </button>
                  </div>
                </div>
              ))}

              {messages.map((msg, index) => (
                <div
                  key={`chat-${index}`}
                  className={`flex ${
                    msg.from === userName ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm hindi-font ${
                      msg.from === userName
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.from !== userName && (
                      <p className="text-xs opacity-75 mb-1">{msg.from}</p>
                    )}
                    <p>{msg.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {messages.length === 0 && translations.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p>अभी तक कोई संदेश नहीं</p>
                  <p className="text-sm">
                    बातचीत शुरू करें! / Start the conversation!
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                  placeholder="संदेश लिखें... / Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm hindi-font"
                  disabled={connectionStatus !== "connected"}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={
                    !currentMessage.trim() || connectionStatus !== "connected"
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  भेजें / Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
