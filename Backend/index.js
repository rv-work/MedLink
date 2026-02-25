import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';

import authRouter from "./Routes/AuthRoutes.js";
import userRouter from "./Routes/UserRoutes.js";
import emergencyRouter from "./Routes/EmergencyRoutes.js";
import medChatRouter from "./Routes/MedChatRoutes.js";
import treatMentRouter from "./Routes/TreatMentRoutes.js";
import doctorRouter from "./Routes/DocterRoutes.js";
import ClinicRouter from "./Routes/ClinicRoutes.js";

import { connectDB } from "./DB/connectDB.js";
import bloodRouter from "./Routes/BloodRoutes.js";
import { startDailySummaryJob } from "./Cron/CronJob.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(cors({
  origin: [
    'https://medlink-face.onrender.com',
    'https://med-link-rvn.vercel.app',
    'https://medlink-face.onrender.com',
    'http://0.0.0.0:5001',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
}));



app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/emergency", emergencyRouter);
app.use("/api/chat", medChatRouter);
app.use("/api/treatment", treatMentRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/clinic", ClinicRouter);

app.use('/api/blood', bloodRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Medical Consultation Server with WebRTC Support",
    status: "online",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});



connectDB();
startDailySummaryJob()

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});