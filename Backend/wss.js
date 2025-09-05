import { WebSocketServer } from "ws";

const channels = {}; // channelName -> { userName: ws }

const send = (wsClient, type, body) => {
  if (wsClient.readyState === wsClient.OPEN) {
    wsClient.send(JSON.stringify({ type, body }));
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
    
    socket.on("error", console.error);
    socket.on("message", (message) => onMessage(socket, message));
    socket.on("close", () => onClose(socket));
  });
};

const onMessage = (socket, message) => {
  try {
    const { type, body } = JSON.parse(message);
    const { channelName, userName, from, to, sdp, candidate } = body;

    switch (type) {
      case "join":
        if (!channels[channelName]) channels[channelName] = {};
        channels[channelName][userName] = socket;
        socket.channelName = channelName;
        socket.userName = userName;

        const userList = Object.keys(channels[channelName]);
        Object.values(channels[channelName]).forEach((wsClient) => {
          send(wsClient, "joined", userList);
        });

        console.log(`${userName} joined channel ${channelName}. Total users: ${userList.length}`);
        break;

      case "send_offer":
        if (channels[channelName] && channels[channelName][to]) {
          send(channels[channelName][to], "offer_sdp_received", { from, sdp });
        }
        break;

      case "send_answer":
        if (channels[channelName] && channels[channelName][to]) {
          send(channels[channelName][to], "answer_sdp_received", { from, sdp });
        }
        break;

      case "send_ice_candidate":
        if (channels[channelName] && channels[channelName][to]) {
          send(channels[channelName][to], "ice_candidate_received", { from, candidate });
        }
        break;

      case "chat_message":
        broadcastToChannel(channelName, "chat_message", {
          from: body.from,
          message: body.message,
          timestamp: body.timestamp
        }, userName);
        break;

      case "quit":
        handleUserQuit(channelName, userName);
        break;

      default:
        console.log(`Unknown message type: ${type}`);
    }
  } catch (err) {
    console.error("Error processing WS message:", err);
  }
};

const handleUserQuit = (channelName, userName) => {
  if (channels[channelName] && channels[channelName][userName]) {
    delete channels[channelName][userName];
    
    const remainingUsers = Object.keys(channels[channelName]);
    Object.values(channels[channelName]).forEach((wsClient) => {
      send(wsClient, "joined", remainingUsers);
    });

    if (remainingUsers.length === 0) delete channels[channelName];
  }
};

const onClose = (socket) => {
  const { channelName, userName } = socket;
  if (channelName && userName) handleUserQuit(channelName, userName);
};

export default initWebSocket;
