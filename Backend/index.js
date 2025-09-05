// server.js - Enhanced with Socket.IO support for video consultations
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { createServer } from "http";
import { Server } from "socket.io";

import authRouter from "./Routes/AuthRoutes.js";
import userRouter from "./Routes/UserRoutes.js";
import { connectDB } from "./DB/connectDB.js";
import emergencyRouter from "./Routes/EmergencyRoutes.js";
import medChatRouter from "./Routes/MedChatRoutes.js";
import treatMentRouter from "./Routes/TreatMentRoutes.js";
import doctorRouter from "./Routes/DocterRoutes.js";
import ConsultationRoutes from "./Routes/ConsultationRoutes.js";
import ClinicRouter from "./Routes/ClinicRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173', 
      'http://0.0.0.0:5001',
      'https://dr-av-instructors-threat.trycloudflare.com',
      'https://med-link-rvn.vercel.app/',
      'https://med-link-rvn.vercel.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://0.0.0.0:5001',
    'https://dr-av-instructors-threat.trycloudflare.com',
    'https://med-link-rvn.vercel.app/',
    'https://med-link-rvn.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/emergency", emergencyRouter);
app.use("/api/chat", medChatRouter);
app.use("/api/treatment", treatMentRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/clinic", ClinicRouter);
app.use('/api/consultation', ConsultationRoutes);

app.get("/", (req, res) => {
  res.send("Medical Consultation Server with WebRTC Support");
});

// Store active consultation rooms and user connections
const consultationRooms = new Map();
const userConnections = new Map();

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a consultation room
  socket.on('join-consultation', (consultationId) => {
    console.log(`User ${socket.id} joining consultation ${consultationId}`);
    
    socket.join(consultationId);
    
    if (!consultationRooms.has(consultationId)) {
      consultationRooms.set(consultationId, {
        doctor: null,
        patient: null,
        status: 'waiting',
        startTime: new Date(),
        reconnectAttempts: {
          doctor: 0,
          patient: 0
        }
      });
    }

    // Store user connection info
    userConnections.set(socket.id, {
      consultationId,
      socketId: socket.id,
      joinedAt: new Date()
    });

    console.log(`Room ${consultationId} participants:`, 
      Array.from(io.sockets.adapter.rooms.get(consultationId) || []));
  });

  // Doctor joins consultation
  socket.on('doctor-joined', (consultationId) => {
    console.log(`Doctor joined consultation ${consultationId}`);
    
    const room = consultationRooms.get(consultationId);
    if (room) {
      room.doctor = socket.id;
      room.status = 'doctor-ready';
      
      // Notify patient that doctor has joined
      socket.to(consultationId).emit('doctor-joined');
      
      console.log(`Doctor ${socket.id} ready for consultation ${consultationId}`);
    }
  });

  // Patient ready for consultation
  socket.on('patient-ready', (consultationId) => {
    console.log(`Patient ready for consultation ${consultationId}`);
    
    const room = consultationRooms.get(consultationId);
    if (room) {
      room.patient = socket.id;
      
      // If doctor is already in room, trigger offer creation
      if (room.doctor) {
        room.status = 'both-ready';
        console.log(`Both parties ready, asking doctor to create offer`);
        io.to(room.doctor).emit('create-offer');
      }
    }
  });

  // Handle WebRTC offer from doctor
  socket.on('offer', ({ offer, consultationId }) => {
    console.log(`Offer received for consultation ${consultationId}`);
    const room = consultationRooms.get(consultationId);
    
    if (room && room.patient) {
      // Forward offer to patient
      socket.to(consultationId).emit('offer', { offer });
      room.status = 'offer-sent';
      console.log(`Offer forwarded to patient`);
    } else {
      console.error(`No patient found in room ${consultationId}`);
    }
  });

  // Handle WebRTC answer from patient
  socket.on('answer', ({ answer, consultationId }) => {
    console.log(`Answer received for consultation ${consultationId}`);
    const room = consultationRooms.get(consultationId);
    
    if (room && room.doctor) {
      // Forward answer to doctor
      socket.to(consultationId).emit('answer', { answer });
      room.status = 'answer-sent';
      console.log(`Answer forwarded to doctor`);
    } else {
      console.error(`No doctor found in room ${consultationId}`);
    }
  });

  // Handle ICE candidates
  socket.on('ice-candidate', ({ candidate, consultationId, from }) => {
    console.log(`ICE candidate from ${from} for consultation ${consultationId}`);
    
    // Forward ICE candidate to other party
    socket.to(consultationId).emit('ice-candidate', { candidate, from });
  });

  // Handle ICE restart offer (for reconnection)
  socket.on('ice-restart-offer', ({ offer, consultationId, from }) => {
    console.log(`ICE restart offer from ${from} for consultation ${consultationId}`);
    socket.to(consultationId).emit('ice-restart-offer', { offer, from });
  });

  // Handle ICE restart answer
  socket.on('ice-restart-answer', ({ answer, consultationId, from }) => {
    console.log(`ICE restart answer from ${from} for consultation ${consultationId}`);
    socket.to(consultationId).emit('ice-restart-answer', { answer, from });
  });

  // Handle call end
  socket.on('end-call', (consultationId) => {
    console.log(`Call ended for consultation ${consultationId}`);
    
    const room = consultationRooms.get(consultationId);
    if (room) {
      room.status = 'ended';
      room.endTime = new Date();
    }
    
    // Notify all parties in the room
    socket.to(consultationId).emit('call-ended');
    
    // Clean up room after a delay
    setTimeout(() => {
      consultationRooms.delete(consultationId);
      console.log(`Cleaned up room ${consultationId}`);
    }, 10000); // 10 seconds delay
  });

  // Handle consultation completion
  socket.on('consultation-completed', (consultationId) => {
    console.log(`Consultation ${consultationId} completed`);
    
    const room = consultationRooms.get(consultationId);
    if (room) {
      room.status = 'completed';
      room.completedAt = new Date();
    }
    
    // Notify patient
    socket.to(consultationId).emit('consultation-completed');
  });

  // Handle connection status updates
  socket.on('connection-status', ({ consultationId, status, userType }) => {
    console.log(`Connection status update: ${status} from ${userType} in ${consultationId}`);
    
    const room = consultationRooms.get(consultationId);
    if (room) {
      // Update room status based on connection state
      if (status === 'connected') {
        room.status = 'active';
        // Reset reconnect attempts on successful connection
        if (room.reconnectAttempts) {
          room.reconnectAttempts[userType] = 0;
        }
      } else if (status === 'reconnecting') {
        if (room.reconnectAttempts) {
          room.reconnectAttempts[userType] += 1;
        }
      }
    }
    
    // Forward status to other party
    socket.to(consultationId).emit('peer-connection-status', { status, userType });
  });

  // Handle media toggle events
  socket.on('media-toggle', ({ consultationId, type, enabled, userType }) => {
    console.log(`Media toggle: ${type} ${enabled ? 'enabled' : 'disabled'} by ${userType}`);
    
    // Forward to other party
    socket.to(consultationId).emit('peer-media-toggle', { type, enabled, userType });
  });

  // Handle reconnection attempts
  socket.on('reconnect-attempt', ({ consultationId, userType, attempt }) => {
    console.log(`Reconnection attempt ${attempt} by ${userType} for ${consultationId}`);
    
    const room = consultationRooms.get(consultationId);
    if (room && room.reconnectAttempts) {
      room.reconnectAttempts[userType] = attempt;
      
      // If too many attempts, notify both parties
      if (attempt >= 3) {
        io.to(consultationId).emit('reconnection-failed', { userType });
      }
    }
  });

  // Handle technical issues reporting
  socket.on('technical-issue', ({ consultationId, issue, userType }) => {
    console.log(`Technical issue reported by ${userType}: ${issue}`);
    
    // Forward to other party
    socket.to(consultationId).emit('peer-technical-issue', { issue, userType });
    
    // Log for monitoring purposes
    const room = consultationRooms.get(consultationId);
    if (room) {
      if (!room.technicalIssues) {
        room.technicalIssues = [];
      }
      room.technicalIssues.push({
        userType,
        issue,
        timestamp: new Date()
      });
    }
  });

  // Handle network quality updates
  socket.on('network-quality', ({ consultationId, quality, userType, stats }) => {
    // Forward network quality info to other party (for UI indicators)
    socket.to(consultationId).emit('peer-network-quality', { quality, userType, stats });
  });

  // Handle chat messages during consultation
  socket.on('consultation-message', ({ consultationId, message, userType, timestamp }) => {
    console.log(`Chat message in consultation ${consultationId} from ${userType}`);
    
    // Forward message to other party
    socket.to(consultationId).emit('consultation-message', { 
      message, 
      userType, 
      timestamp: timestamp || new Date()
    });
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    
    const userInfo = userConnections.get(socket.id);
    if (userInfo) {
      const { consultationId } = userInfo;
      const room = consultationRooms.get(consultationId);
      
      if (room) {
        // Determine if doctor or patient disconnected
        let userType = 'unknown';
        if (room.doctor === socket.id) {
          userType = 'doctor';
          room.doctor = null;
        } else if (room.patient === socket.id) {
          userType = 'patient';
          room.patient = null;
        }
        
        // Notify other party about disconnection
        socket.to(consultationId).emit('peer-disconnected', { userType, reason });
        
        console.log(`${userType} disconnected from consultation ${consultationId}`);
        
        // If both parties are gone, clean up room after delay
        if (!room.doctor && !room.patient) {
          setTimeout(() => {
            if (consultationRooms.has(consultationId)) {
              const currentRoom = consultationRooms.get(consultationId);
              if (!currentRoom.doctor && !currentRoom.patient) {
                consultationRooms.delete(consultationId);
                console.log(`Auto-cleaned empty room ${consultationId}`);
              }
            }
          }, 30000); // 30 seconds delay for potential reconnection
        }
      }
      
      userConnections.delete(socket.id);
    }
  });

  // Ping/pong for connection monitoring
  socket.on('ping', ({ consultationId, timestamp }) => {
    socket.emit('pong', { consultationId, timestamp, serverTime: Date.now() });
  });
});

// Health check endpoint for Socket.IO
app.get('/api/socket/health', (req, res) => {
  const connectedUsers = io.sockets.sockets.size;
  const activeRooms = consultationRooms.size;
  
  res.json({
    success: true,
    socketIO: {
      connected: true,
      connectedUsers,
      activeRooms,
      rooms: Array.from(consultationRooms.keys())
    }
  });
});

// Debug endpoint to get room info
app.get('/api/socket/room/:consultationId', (req, res) => {
  const { consultationId } = req.params;
  const room = consultationRooms.get(consultationId);
  
  if (room) {
    const roomSockets = io.sockets.adapter.rooms.get(consultationId);
    res.json({
      success: true,
      room: {
        ...room,
        connectedSockets: roomSockets ? Array.from(roomSockets) : []
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }
});

// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.IO server initialized with CORS enabled`);
  console.log(`WebRTC signaling server ready for video consultations`);
});