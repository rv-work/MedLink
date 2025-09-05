import { WebSocketServer } from "ws";

const channels = {}; // channelName -> { userName: ws }

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
    Object.entries(channels[channelName]).forEach(([userName, ws]) => {
      if (userName !== excludeUser) {
        send(ws, type, body);
      }
    });
  }
};

const initWebSocket = (server) => {
  const wss = new WebSocketServer({ server, path: "/ws" });
  console.log("WebSocket server running on /ws");

  wss.on("connection", (socket) => {
    console.log("A client has connected!");
    
    // Add ping/pong for connection health
    socket.isAlive = true;
    socket.on('pong', () => {
      socket.isAlive = true;
    });
    
    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
    
    socket.on("message", (message) => onMessage(socket, message));
    socket.on("close", () => onClose(socket));
  });

  // Health check interval
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
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

const onMessage = (socket, message) => {
  try {
    const { type, body } = JSON.parse(message);
    
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
        
      case "quit":
        handleUserQuit(body.channelName, body.userName);
        break;
        
      default:
        console.log(`Unknown message type: ${type}`);
    }
  } catch (err) {
    console.error("Error processing WS message:", err);
    send(socket, "error", { message: "Invalid message format" });
  }
};

const handleJoin = (socket, body) => {
  const { channelName, userName } = body;
  
  if (!channelName || !userName) {
    send(socket, "error", { message: "Channel name and user name required" });
    return;
  }

  // Initialize channel if it doesn't exist
  if (!channels[channelName]) {
    channels[channelName] = {};
  }

  // Check if user already exists in channel
  if (channels[channelName][userName]) {
    // Close existing connection
    const existingSocket = channels[channelName][userName];
    if (existingSocket && existingSocket.readyState === existingSocket.OPEN) {
      existingSocket.close();
    }
  }

  // Add new connection
  channels[channelName][userName] = socket;
  socket.channelName = channelName;
  socket.userName = userName;

  const userList = Object.keys(channels[channelName]);
  
  // Notify all users in channel about updated user list
  Object.values(channels[channelName]).forEach((wsClient) => {
    send(wsClient, "joined", userList);
  });

  console.log(`${userName} joined channel ${channelName}. Total users: ${userList.length}`);
};

const handleOffer = (body) => {
  const { channelName, from, to, sdp } = body;
  
  if (channels[channelName] && channels[channelName][to]) {
    send(channels[channelName][to], "offer_sdp_received", { from, sdp });
    console.log(`Offer sent from ${from} to ${to} in channel ${channelName}`);
  } else {
    console.log(`User ${to} not found in channel ${channelName}`);
  }
};

const handleAnswer = (body) => {
  const { channelName, from, to, sdp } = body;
  
  if (channels[channelName] && channels[channelName][to]) {
    send(channels[channelName][to], "answer_sdp_received", { from, sdp });
    console.log(`Answer sent from ${from} to ${to} in channel ${channelName}`);
  } else {
    console.log(`User ${to} not found in channel ${channelName}`);
  }
};

const handleIceCandidate = (body) => {
  const { channelName, from, to, candidate } = body;
  
  if (channels[channelName] && channels[channelName][to]) {
    send(channels[channelName][to], "ice_candidate_received", { from, candidate });
    console.log(`ICE candidate sent from ${from} to ${to} in channel ${channelName}`);
  } else {
    console.log(`User ${to} not found in channel ${channelName}`);
  }
};

const handleChatMessage = (body) => {
  const { channelName, from, message, timestamp } = body;
  
  broadcastToChannel(channelName, "chat_message", {
    from,
    message,
    timestamp
  }, from);
  
  console.log(`Chat message from ${from} in channel ${channelName}`);
};

const handleUserQuit = (channelName, userName) => {
  if (!channelName || !userName) return;
  
  if (channels[channelName] && channels[channelName][userName]) {
    // Close the socket if it's still open
    const socket = channels[channelName][userName];
    if (socket && socket.readyState === socket.OPEN) {
      socket.close();
    }
    
    // Remove user from channel
    delete channels[channelName][userName];
    
    const remainingUsers = Object.keys(channels[channelName]);
    
    // Notify remaining users
    Object.values(channels[channelName]).forEach((wsClient) => {
      send(wsClient, "joined", remainingUsers);
    });
    
    // Clean up empty channel
    if (remainingUsers.length === 0) {
      delete channels[channelName];
    }
    
    console.log(`${userName} left channel ${channelName}. Remaining users: ${remainingUsers.length}`);
  }
};

const onClose = (socket) => {
  const { channelName, userName } = socket;
  if (channelName && userName) {
    handleUserQuit(channelName, userName);
  }
  console.log("Client disconnected");
};

export default initWebSocket;