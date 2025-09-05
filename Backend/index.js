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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://0.0.0.0:5001',
    'https://dr-av-instructors-threat.trycloudflare.com',
    'https://med-link-rvn.vercel.app',
    'https://med-link-rvn.vercel.app/',
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

// Connect DB
connectDB();

// Create HTTP server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize WebSocket on the same server (path: /ws)
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
