import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

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

// Socket.IO setup with CORS
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
  }
});

// Store active consultations and user connections
const activeConsultations = new Map();
const userSockets = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins consultation room
  socket.on('join-consultation', ({ consultationId, userId, userType }) => {
    console.log(`${userType} ${userId} joining consultation ${consultationId}`);
    
    socket.join(consultationId);
    userSockets.set(userId, socket.id);
    
    if (!activeConsultations.has(consultationId)) {
      activeConsultations.set(consultationId, {
        patient: null,
        doctor: null,
        participants: 0
      });
    }
    
    const consultation = activeConsultations.get(consultationId);
    consultation[userType] = { userId, socketId: socket.id };
    consultation.participants++;
    
    // Notify others in the room
    socket.to(consultationId).emit('user-joined', { userId, userType });
    
    // If both participants are present, enable calling
    if (consultation.patient && consultation.doctor) {
      io.to(consultationId).emit('consultation-ready', {
        participants: consultation.participants
      });
    }
  });

  // Handle WebRTC signaling
  socket.on('webrtc-offer', ({ consultationId, offer, targetUserId }) => {
    console.log('Sending WebRTC offer to:', targetUserId);
    const targetSocketId = userSockets.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc-offer', {
        offer,
        from: getUserIdFromSocket(socket.id)
      });
    }
  });

  socket.on('webrtc-answer', ({ consultationId, answer, targetUserId }) => {
    console.log('Sending WebRTC answer to:', targetUserId);
    const targetSocketId = userSockets.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc-answer', {
        answer,
        from: getUserIdFromSocket(socket.id)
      });
    }
  });

  socket.on('webrtc-ice-candidate', ({ consultationId, candidate, targetUserId }) => {
    console.log('Sending ICE candidate to:', targetUserId);
    const targetSocketId = userSockets.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc-ice-candidate', {
        candidate,
        from: getUserIdFromSocket(socket.id)
      });
    }
  });

  // Handle consultation status updates
  socket.on('consultation-started', ({ consultationId }) => {
    socket.to(consultationId).emit('consultation-started');
  });

  socket.on('consultation-ended', ({ consultationId }) => {
    socket.to(consultationId).emit('consultation-ended');
    // Clean up consultation data
    activeConsultations.delete(consultationId);
  });

  // Handle chat messages during consultation
  socket.on('consultation-message', ({ consultationId, message, sender }) => {
    socket.to(consultationId).emit('consultation-message', {
      message,
      sender,
      timestamp: new Date()
    });
  });

  // Handle screen sharing
  socket.on('screen-share-offer', ({ consultationId, offer, targetUserId }) => {
    const targetSocketId = userSockets.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('screen-share-offer', {
        offer,
        from: getUserIdFromSocket(socket.id)
      });
    }
  });

  socket.on('screen-share-answer', ({ consultationId, answer, targetUserId }) => {
    const targetSocketId = userSockets.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('screen-share-answer', {
        answer,
        from: getUserIdFromSocket(socket.id)
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and remove user from userSockets
    let disconnectedUserId = null;
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        userSockets.delete(userId);
        break;
      }
    }
    
    // Update active consultations
    if (disconnectedUserId) {
      for (const [consultationId, consultation] of activeConsultations.entries()) {
        if (consultation.patient?.userId === disconnectedUserId || 
            consultation.doctor?.userId === disconnectedUserId) {
          consultation.participants--;
          
          // Notify other participant
          socket.to(consultationId).emit('user-left', { userId: disconnectedUserId });
          
          // Clean up if no participants left
          if (consultation.participants <= 0) {
            activeConsultations.delete(consultationId);
          }
          break;
        }
      }
    }
  });
});

// Helper function to get userId from socketId
function getUserIdFromSocket(socketId) {
  for (const [userId, sId] of userSockets.entries()) {
    if (sId === socketId) {
      return userId;
    }
  }
  return null;
}

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

connectDB();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});