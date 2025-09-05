import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';

import authRouter from "./Routes/AuthRoutes.js";
import userRouter from "./Routes/UserRoutes.js";
import emergencyRouter from "./Routes/EmergencyRoutes.js";
import medChatRouter from "./Routes/MedChatRoutes.js";
import treatMentRouter from "./Routes/TreatMentRoutes.js";
import doctorRouter from "./Routes/DocterRoutes.js";
import ConsultationRoutes from "./Routes/ConsultationRoutes.js";
import ClinicRouter from "./Routes/ClinicRoutes.js";

import { connectDB } from "./DB/connectDB.js";
import initWebSocket from './wss.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'http://0.0.0.0:5001',
    'https://dr-av-instructors-threat.trycloudflare.com',
    'https://med-link-rvn.vercel.app',
    'https://med-link-rvn.vercel.app/',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Handle preflight requests
app.options('*', cors());

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
  res.json({
    message: "Medical Consultation Server with WebRTC Support",
    status: "online",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path
  });
});

// Connect DB
connectDB();

// Create HTTP server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize WebSocket on the same server (path: /ws)
const wss = initWebSocket(server);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    if (wss) {
      wss.close(() => {
        console.log('WebSocket server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    if (wss) {
      wss.close(() => {
        console.log('WebSocket server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server running on ws://localhost:${PORT}/ws`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});