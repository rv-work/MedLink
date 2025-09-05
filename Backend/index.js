import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import http from "http"; // for WebSocket server
import { WebSocketServer } from "ws";

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

// Express middleware
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

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/ws" });

const channels = {};

const send = (wsClient, type, body) => {
  wsClient.send(JSON.stringify({ type, body }));
};

wss.on("connection", (socket) => {
  console.log("A client connected to WebSocket");

  socket.on("error", console.error);
  socket.on("message", (message) => handleMessage(socket, message));
  socket.on("close", () => handleClose(socket));
});

const handleMessage = (socket, message) => {
  const { type, body } = JSON.parse(message);
  const { channelName, userName } = body;

  switch (type) {
    case "join":
      if (!channels[channelName]) channels[channelName] = {};
      channels[channelName][userName] = socket;
      send(socket, "joined", Object.keys(channels[channelName]));
      break;

    case "quit":
      if (channels[channelName]) {
        delete channels[channelName][userName];
        if (!Object.keys(channels[channelName]).length) delete channels[channelName];
      }
      break;

    case "send_offer":
    case "send_answer":
    case "send_ice_candidate": {
      const key = type === "send_offer" ? "offer_sdp_received" :
                  type === "send_answer" ? "answer_sdp_received" : "ice_candidate_received";
      Object.entries(channels[channelName] || {}).forEach(([uName, wsClient]) => {
        if (uName !== userName) send(wsClient, key, type === "send_ice_candidate" ? body.candidate : body.sdp);
      });
      break;
    }
  }
};

const handleClose = (socket) => {
  Object.keys(channels).forEach((channelName) => {
    Object.keys(channels[channelName]).forEach((userName) => {
      if (channels[channelName][userName] === socket) {
        delete channels[channelName][userName];
      }
    });
    if (!Object.keys(channels[channelName]).length) delete channels[channelName];
  });
};

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket path: ws://localhost:${PORT}/ws`);
});
