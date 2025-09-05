import { WebSocketServer } from "ws";

const channels = {}; // channelName -> { userName: { ws, language, joinTime } }

const send = (wsClient, type, body) => {
  if (wsClient && wsClient.readyState === wsClient.OPEN) {
    try {
      wsClient.send(JSON.stringify({ type, body }));
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }
};

const broadcastToChannel = (channelName, type, body, excludeUser = null) => {
  if (channels[channelName]) {
    Object.entries(channels[channelName]).forEach(([userName, userInfo]) => {
      if (userName !== excludeUser) {
        send(userInfo.ws, type, body);
      }
    });
  }
};

const initWebSocket = (server) => {
  const wss = new WebSocketServer({ 
    server, 
    path: "/ws",
    perMessageDeflate: {
      deflate: false,
      threshold: 1024,
      concurrencyLimit: 10,
      clientMaxNoContextTakeover: false,
      serverMaxNoContextTakeover: false,
      serverMaxWindowBits: 15,
      clientMaxWindowBits: 15,
    },
  });
  
  console.log("WebSocket server running on /ws");
  
  wss.on("connection", (socket, request) => {
    console.log("A client has connected!", request.connection.remoteAddress);
    
    socket.isAlive = true;
    socket.lastPong = Date.now();
    
    socket.on('pong', () => {
      socket.isAlive = true;
      socket.lastPong = Date.now();
    });
    
    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
      handleSocketError(socket);
    });
    
    socket.on("message", (message) => {
      try {
        onMessage(socket, message);
      } catch (error) {
        console.error("Error processing message:", error);
        send(socket, "error", { message: "Message processing failed" });
      }
    });
    
    socket.on("close", (code, reason) => {
      console.log(`Socket closed: ${code} - ${reason}`);
      onClose(socket);
    });
  });
  
  // Enhanced health check with timeout handling
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive || (Date.now() - ws.lastPong) > 35000) {
        console.log("Terminating inactive connection");
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  wss.on('close', () => {
    clearInterval(interval);
  });
  
  return wss;
};

const handleSocketError = (socket) => {
  const { channelName, userName } = socket;
  if (channelName && userName) {
    handleUserQuit(channelName, userName);
  }
};

const onMessage = (socket, message) => {
  const { type, body } = JSON.parse(message);
  
  // Add request logging
  console.log(`Received message: ${type} from ${socket.userName || 'unknown'}`);
  
  switch (type) {
    case "join":
      handleJoin(socket, body);
      break;
      
    case "send_offer":
      handleOffer(body);
      break;
      
    case "send_answer":
      handleAnswer(body);
      break;
      
    case "send_ice_candidate":
      handleIceCandidate(body);
      break;
      
    case "chat_message":
      handleChatMessage(body);
      break;
      
    case "translation":
      handleTranslation(body);
      break;
      
    case "language_change":
      handleLanguageChange(socket, body);
      break;
      
    case "quit":
      handleUserQuit(body.channelName, body.userName);
      break;
      
    default:
      console.log(`Unknown message type: ${type}`);
      send(socket, "error", { message: `Unknown message type: ${type}` });
  }
};

const handleJoin = (socket, body) => {
  const { channelName, userName, language = 'hi' } = body;
  
  if (!channelName || !userName) {
    send(socket, "error", { message: "Channel name and user name required" });
    return;
  }
  
  console.log(`User ${userName} joining channel ${channelName} with language ${language}`);
  
  // Initialize channel if it doesn't exist
  if (!channels[channelName]) {
    channels[channelName] = {};
  }
  
  // Check if user already exists and close existing connection
  if (channels[channelName][userName]) {
    const existingSocket = channels[channelName][userName].ws;
    if (existingSocket && existingSocket.readyState === existingSocket.OPEN) {
      console.log(`Closing existing connection for ${userName}`);
      existingSocket.close();
    }
  }
  
  // Add new connection with enhanced info
  channels[channelName][userName] = {
    ws: socket,
    language: language,
    joinTime: Date.now(),
    lastActivity: Date.now()
  };
  
  socket.channelName = channelName;
  socket.userName = userName;
  socket.language = language;
  
  const userList = Object.keys(channels[channelName]).map(name => ({
    userName: name,
    language: channels[channelName][name].language,
    joinTime: channels[channelName][name].joinTime
  }));
  
  // Notify all users about updated user list
  Object.values(channels[channelName]).forEach((userInfo) => {
    send(userInfo.ws, "joined", userList);
  });
  
  console.log(`${userName} joined channel ${channelName}. Total users: ${userList.length}`);
};

const handleOffer = (body) => {
  const { channelName, from, to, sdp } = body;
  
  console.log(`Relaying offer from ${from} to ${to} in channel ${channelName}`);
  
  if (!channels[channelName]) {
    console.error(`Channel ${channelName} not found`);
    return;
  }
  
  if (!channels[channelName][to]) {
    console.error(`User ${to} not found in channel ${channelName}`);
    return;
  }
  
  // Update activity
  if (channels[channelName][from]) {
    channels[channelName][from].lastActivity = Date.now();
  }
  
  send(channels[channelName][to].ws, "offer_sdp_received", { from, sdp });
  console.log(`Offer successfully relayed from ${from} to ${to}`);
};

const handleAnswer = (body) => {
  const { channelName, from, to, sdp } = body;
  
  console.log(`Relaying answer from ${from} to ${to} in channel ${channelName}`);
  
  if (!channels[channelName] || !channels[channelName][to]) {
    console.error(`Target user ${to} not found in channel ${channelName}`);
    return;
  }
  
  // Update activity
  if (channels[channelName][from]) {
    channels[channelName][from].lastActivity = Date.now();
  }
  
  send(channels[channelName][to].ws, "answer_sdp_received", { from, sdp });
  console.log(`Answer successfully relayed from ${from} to ${to}`);
};

const handleIceCandidate = (body) => {
  const { channelName, from, to, candidate } = body;
  
  if (!channels[channelName] || !channels[channelName][to]) {
    console.warn(`ICE candidate target ${to} not found in channel ${channelName}`);
    return;
  }
  
  // Update activity
  if (channels[channelName][from]) {
    channels[channelName][from].lastActivity = Date.now();
  }
  
  send(channels[channelName][to].ws, "ice_candidate_received", { from, candidate });
};

const handleChatMessage = (body) => {
  const { channelName, from, message, timestamp } = body;
  
  console.log(`Chat message from ${from} in channel ${channelName}`);
  
  // Update activity
  if (channels[channelName] && channels[channelName][from]) {
    channels[channelName][from].lastActivity = Date.now();
  }
  
  broadcastToChannel(channelName, "chat_message", {
    from,
    message,
    timestamp
  }, from);
};

const handleTranslation = (body) => {
  const { channelName, from, originalText, translatedText, targetLanguage, timestamp, sourceLanguage } = body;
  
  console.log(`Translation from ${from}: ${sourceLanguage} -> ${targetLanguage} in channel ${channelName}`);
  
  // Update activity
  if (channels[channelName] && channels[channelName][from]) {
    channels[channelName][from].lastActivity = Date.now();
  }
  
  // Broadcast translation to users who speak the target language
  if (channels[channelName]) {
    Object.entries(channels[channelName]).forEach(([userName, userInfo]) => {
      if (userName !== from && userInfo.language === targetLanguage) {
        send(userInfo.ws, "translation_received", {
          from,
          originalText,
          translatedText,
          sourceLanguage,
          targetLanguage,
          timestamp
        });
      }
    });
  }
};

const handleLanguageChange = (socket, body) => {
  const { channelName, userName, newLanguage } = body;
  
  console.log(`${userName} changing language to ${newLanguage} in channel ${channelName}`);
  
  if (channels[channelName] && channels[channelName][userName]) {
    channels[channelName][userName].language = newLanguage;
    channels[channelName][userName].lastActivity = Date.now();
    socket.language = newLanguage;
    
    const userList = Object.keys(channels[channelName]).map(name => ({
      userName: name,
      language: channels[channelName][name].language,
      joinTime: channels[channelName][name].joinTime
    }));
    
    Object.values(channels[channelName]).forEach((userInfo) => {
      send(userInfo.ws, "language_changed", { userName, newLanguage, userList });
    });
    
    console.log(`${userName} successfully changed language to ${newLanguage}`);
  }
};

const handleUserQuit = (channelName, userName) => {
  if (!channelName || !userName) {
    console.warn("Invalid quit request - missing channelName or userName");
    return;
  }
  
  console.log(`${userName} leaving channel ${channelName}`);
  
  if (channels[channelName] && channels[channelName][userName]) {
    const socket = channels[channelName][userName].ws;
    if (socket && socket.readyState === socket.OPEN) {
      socket.close();
    }
    
    delete channels[channelName][userName];
    
    const remainingUsers = Object.keys(channels[channelName]).map(name => ({
      userName: name,
      language: channels[channelName][name].language,
      joinTime: channels[channelName][name].joinTime
    }));
    
    // Notify remaining users
    Object.values(channels[channelName]).forEach((userInfo) => {
      send(userInfo.ws, "joined", remainingUsers);
    });
    
    // Clean up empty channel
    if (remainingUsers.length === 0) {
      delete channels[channelName];
      console.log(`Channel ${channelName} deleted (no users remaining)`);
    }
    
    console.log(`${userName} left channel ${channelName}. Remaining users: ${remainingUsers.length}`);
  } else {
    console.warn(`User ${userName} not found in channel ${channelName} during quit`);
  }
};

const onClose = (socket) => {
  const { channelName, userName } = socket;
  console.log(`Connection closed for ${userName || 'unknown'} in ${channelName || 'unknown'}`);
  
  if (channelName && userName) {
    handleUserQuit(channelName, userName);
  }
};

// Cleanup inactive channels periodically
setInterval(() => {
  const now = Date.now();
  const INACTIVE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  
  Object.entries(channels).forEach(([channelName, users]) => {
    Object.entries(users).forEach(([userName, userInfo]) => {
      if (now - userInfo.lastActivity > INACTIVE_TIMEOUT) {
        console.log(`Removing inactive user ${userName} from ${channelName}`);
        handleUserQuit(channelName, userName);
      }
    });
  });
}, 2 * 60 * 1000); // Check every 2 minutes

export default initWebSocket;
