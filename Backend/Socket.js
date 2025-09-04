// socket/socketServer.js
import { Server } from 'socket.io';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "https://med-link-rvn.vercel.app"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  const consultationRooms = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-consultation', (consultationId) => {
      socket.join(consultationId);
      
      if (!consultationRooms.has(consultationId)) {
        consultationRooms.set(consultationId, new Set());
      }
      consultationRooms.get(consultationId).add(socket.id);
      
      console.log(`User ${socket.id} joined consultation ${consultationId}`);
    });

    socket.on('doctor-joined', (consultationId) => {
      socket.to(consultationId).emit('doctor-joined');
    });

    socket.on('offer', ({ offer, consultationId }) => {
      socket.to(consultationId).emit('offer', offer);
    });

    socket.on('answer', ({ answer, consultationId }) => {
      socket.to(consultationId).emit('answer', answer);
    });

    socket.on('ice-candidate', ({ candidate, consultationId }) => {
      socket.to(consultationId).emit('ice-candidate', candidate);
    });

    socket.on('end-call', (consultationId) => {
      socket.to(consultationId).emit('call-ended');
    });

    socket.on('consultation-completed', (consultationId) => {
      socket.to(consultationId).emit('consultation-completed');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Clean up consultation rooms
      for (const [consultationId, participants] of consultationRooms.entries()) {
        if (participants.has(socket.id)) {
          participants.delete(socket.id);
          if (participants.size === 0) {
            consultationRooms.delete(consultationId);
          }
        }
      }
    });
  });

  return io;
};
