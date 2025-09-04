// server.js - Add Socket.IO support
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initializeSocket } from './Socket.js';
import authRouter from "./Routes/AuthRoutes.js";
import userRouter from "./Routes/UserRoutes.js";
import { connectDB } from "./DB/connectDB.js";
import emergencyRouter from "./Routes/EmergencyRoutes.js";
import medChatRouter from "./Routes/MedChatRoutes.js";
import treatMentRouter from "./Routes/TreatMentRoutes.js";
// import { startDailySummaryJob } from "./Cron/dailySummaryJob.js";
import doctorRouter from "./Routes/DocterRoutes.js";
import ConsultationRoutes from "./Routes/ConsultationRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://0.0.0.0:5001',
    'https://dr-av-instructors-threat.trycloudflare.com',
    'https://med-link-rvn.vercel.app/'
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
app.use('/api/consultation', ConsultationRoutes);

app.get("/", (req, res) => {
  res.send("Hii From Backend");
});

connectDB();
// startDailySummaryJob();

server.listen(5000, "0.0.0.0", () => {
  console.log(`Server running on https://medlink-bh5c.onrender.com`);
});
