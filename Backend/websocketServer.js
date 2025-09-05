import { WebSocket, WebSocketServer } from 'ws';

export const initializeWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });
  
  // Store connections by room
  const rooms = new Map();

  wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    
    ws.on('message', function message(data) {
      try {
        const message = JSON.parse(data);
        const roomId = message.roomId;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, { sender: null, receiver: null });
        }

        const room = rooms.get(roomId);

        if (message.type === 'join') {
          if (message.role === 'doctor') {
            console.log(`Doctor joined room: ${roomId}`);
            room.sender = ws;
            ws.role = 'doctor';
            ws.roomId = roomId;
          } else if (message.role === 'patient') {
            console.log(`Patient joined room: ${roomId}`);
            room.receiver = ws;
            ws.role = 'patient';
            ws.roomId = roomId;
          }
        } else if (message.type === 'createOffer') {
          if (ws.role === 'doctor' && room.receiver) {
            console.log("Sending offer to patient");
            room.receiver.send(JSON.stringify({ 
              type: 'createOffer', 
              sdp: message.sdp 
            }));
          }
        } else if (message.type === 'createAnswer') {
          if (ws.role === 'patient' && room.sender) {
            console.log("Sending answer to doctor");
            room.sender.send(JSON.stringify({ 
              type: 'createAnswer', 
              sdp: message.sdp 
            }));
          }
        } else if (message.type === 'iceCandidate') {
          console.log("Sending ice candidate");
          if (ws.role === 'doctor' && room.receiver) {
            room.receiver.send(JSON.stringify({ 
              type: 'iceCandidate', 
              candidate: message.candidate 
            }));
          } else if (ws.role === 'patient' && room.sender) {
            room.sender.send(JSON.stringify({ 
              type: 'iceCandidate', 
              candidate: message.candidate 
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (ws.roomId && rooms.has(ws.roomId)) {
        const room = rooms.get(ws.roomId);
        if (ws.role === 'doctor') {
          room.sender = null;
        } else if (ws.role === 'patient') {
          room.receiver = null;
        }
        
        // Clean up empty rooms
        if (!room.sender && !room.receiver) {
          rooms.delete(ws.roomId);
        }
      }
    });
  });

  return wss;
};
