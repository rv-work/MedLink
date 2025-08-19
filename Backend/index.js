import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from 'cookie-parser';
import authRouter from "./Routes/AuthRoutes.js";
import userRouter from "./Routes/UserRoutes.js";
import { connectDB } from "./DB/connectDB.js";
import emergencyRouter from "./Routes/EmergencyRoutes.js";
import medChatRouter from "./Routes/MedChatRoutes.js";
import treatMentRouter from "./Routes/TreatMentRoutes.js";

dotenv.config()

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://0.0.0.0:5001',
    '*'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));








app.use("/api/auth" , authRouter)
app.use("/api/user" , userRouter)
app.use("/api/emergency" , emergencyRouter)
app.use("/api/chat" , medChatRouter)
app.use("/api/treatment" , treatMentRouter)


app.get("/" , (req , res) => {
  res.send("Hii From Backend")
})


connectDB();
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
