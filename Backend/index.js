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
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins consultation room
    socket.on('join-consultation', ({ consultationId, userId, userType }) => {
        console.log(`${userType} ${userId} joining consultation ${consultationId}`);
        
        // Join the consultation room
        socket.join(consultationId);
        socket.userId = userId;
        socket.userType = userType;
        socket.consultationId = consultationId;
        
        // Store user socket mapping
        userSockets.set(userId, socket.id);

        // Initialize consultation if not exists
        if (!activeConsultations.has(consultationId)) {
            activeConsultations.set(consultationId, {
                patient: null,
                doctor: null,
                participants: 0,
                ready: false
            });
        }

        const consultation = activeConsultations.get(consultationId);
        
        // Set user role
        if (userType === 'patient') {
            consultation.patient = { userId, socketId: socket.id };
        } else if (userType === 'doctor') {
            consultation.doctor = { userId, socketId: socket.id };
        }
        
        consultation.participants++;

        console.log(`Consultation ${consultationId} status:`, {
            patient: consultation.patient?.userId || 'waiting',
            doctor: consultation.doctor?.userId || 'waiting',
            participants: consultation.participants
        });

        // Notify others in the room that user joined
        socket.to(consultationId).emit('user-joined', { 
            userId, 
            userType,
            socketId: socket.id 
        });

        // If both participants are present, start WebRTC signaling
        if (consultation.patient && consultation.doctor && !consultation.ready) {
            consultation.ready = true;
            console.log(`Both users present in consultation ${consultationId}, starting WebRTC`);
            
            // Give a small delay to ensure both clients are ready
            setTimeout(() => {
                io.to(consultationId).emit('consultation-ready', {
                    participants: consultation.participants,
                    patient: consultation.patient.userId,
                    doctor: consultation.doctor.userId
                });
                
                // Instruct doctor to create offer
                if (consultation.doctor.socketId) {
                    io.to(consultation.doctor.socketId).emit('start-call', {
                        targetUserId: consultation.patient.userId,
                        role: 'caller'
                    });
                }
                
                // Instruct patient to prepare for offer
                if (consultation.patient.socketId) {
                    io.to(consultation.patient.socketId).emit('start-call', {
                        targetUserId: consultation.doctor.userId,
                        role: 'receiver'
                    });
                }
            }, 1000); // 1 second delay
        }
    });

    // Handle WebRTC offer
    socket.on('webrtc-offer', ({ consultationId, offer, targetUserId }) => {
        console.log(`WebRTC offer from ${socket.userId} to ${targetUserId}`);
        
        const targetSocketId = userSockets.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('webrtc-offer', {
                offer,
                from: socket.userId,
                fromType: socket.userType
            });
            console.log(`✅ Offer relayed to ${targetUserId}`);
        } else {
            console.error(`❌ Target user ${targetUserId} not found`);
            socket.emit('webrtc-error', { 
                message: 'Target user not found',
                targetUserId 
            });
        }
    });

    // Handle WebRTC answer
    socket.on('webrtc-answer', ({ consultationId, answer, targetUserId }) => {
        console.log(`WebRTC answer from ${socket.userId} to ${targetUserId}`);
        
        const targetSocketId = userSockets.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('webrtc-answer', {
                answer,
                from: socket.userId,
                fromType: socket.userType
            });
            console.log(`✅ Answer relayed to ${targetUserId}`);
        } else {
            console.error(`❌ Target user ${targetUserId} not found for answer`);
            socket.emit('webrtc-error', { 
                message: 'Target user not found for answer',
                targetUserId 
            });
        }
    });

    // Handle ICE candidates
    socket.on('webrtc-ice-candidate', ({ consultationId, candidate, targetUserId }) => {
        console.log(`ICE candidate from ${socket.userId} to ${targetUserId}`);
        
        const targetSocketId = userSockets.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('webrtc-ice-candidate', {
                candidate,
                from: socket.userId,
                fromType: socket.userType
            });
        } else {
            console.error(`❌ Target user ${targetUserId} not found for ICE candidate`);
        }
    });

    // Handle consultation messages
    socket.on('consultation-message', ({ consultationId, message, sender }) => {
        console.log(`Message in consultation ${consultationId} from ${sender}`);
        
        const messageData = {
            message,
            sender,
            timestamp: new Date(),
            userId: socket.userId
        };

        // Broadcast to all users in the consultation room except sender
        socket.to(consultationId).emit('consultation-message', messageData);
    });

    // Handle consultation status updates
    socket.on('consultation-started', ({ consultationId }) => {
        console.log(`Consultation ${consultationId} started by ${socket.userType}`);
        socket.to(consultationId).emit('consultation-started', {
            startedBy: socket.userId,
            startedByType: socket.userType
        });
    });

    socket.on('consultation-ended', ({ consultationId }) => {
        console.log(`Consultation ${consultationId} ended by ${socket.userType}`);
        socket.to(consultationId).emit('consultation-ended', {
            endedBy: socket.userId,
            endedByType: socket.userType
        });
        
        // Clean up consultation data
        activeConsultations.delete(consultationId);
    });

    // Handle connection status updates
    socket.on('webrtc-connection-state', ({ consultationId, state, targetUserId }) => {
        console.log(`WebRTC connection state from ${socket.userId}: ${state}`);
        
        const targetSocketId = userSockets.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('webrtc-connection-state', {
                state,
                from: socket.userId,
                fromType: socket.userType
            });
        }
    });

    // Handle screen sharing
    socket.on('screen-share-offer', ({ consultationId, offer, targetUserId }) => {
        const targetSocketId = userSockets.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('screen-share-offer', {
                offer,
                from: socket.userId
            });
        }
    });

    socket.on('screen-share-answer', ({ consultationId, answer, targetUserId }) => {
        const targetSocketId = userSockets.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('screen-share-answer', {
                answer,
                from: socket.userId
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log(`User ${socket.id} (${socket.userId}) disconnected: ${reason}`);
        
        // Clean up user socket mapping
        if (socket.userId) {
            userSockets.delete(socket.userId);
        }

        // Notify others in consultation room
        if (socket.consultationId) {
            socket.to(socket.consultationId).emit('user-left', {
                userId: socket.userId,
                userType: socket.userType,
                reason: 'disconnected'
            });

            // Update active consultations
            const consultation = activeConsultations.get(socket.consultationId);
            if (consultation) {
                consultation.participants--;
                
                // Remove user from consultation
                if (socket.userType === 'patient') {
                    consultation.patient = null;
                } else if (socket.userType === 'doctor') {
                    consultation.doctor = null;
                }

                // Clean up if no participants left
                if (consultation.participants <= 0) {
                    activeConsultations.delete(socket.consultationId);
                    console.log(`Consultation ${socket.consultationId} cleaned up`);
                }
            }
        }
    });

    // Handle leave consultation
    socket.on('leave-consultation', ({ consultationId }) => {
        console.log(`${socket.userType} ${socket.userId} leaving consultation ${consultationId}`);
        
        socket.leave(consultationId);
        socket.to(consultationId).emit('user-left', {
            userId: socket.userId,
            userType: socket.userType
        });

        // Clean up
        const consultation = activeConsultations.get(consultationId);
        if (consultation) {
            consultation.participants--;
            if (socket.userType === 'patient') {
                consultation.patient = null;
            } else if (socket.userType === 'doctor') {
                consultation.doctor = null;
            }

            if (consultation.participants <= 0) {
                activeConsultations.delete(consultationId);
            }
        }
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error(`Socket ${socket.id} error:`, error);
    });
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

connectDB();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});