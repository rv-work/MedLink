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
        consultationRooms.set(consultationId, { doctor: null, patient: null });
      }
      
      console.log(`User ${socket.id} joined consultation ${consultationId}`);
    });

    // Doctor joins and notifies patient
    socket.on('doctor-joined', (consultationId) => {
      const room = consultationRooms.get(consultationId);
      if (room) {
        room.doctor = socket.id;
        room.doctorReady = true;
      }
      
      console.log(`Doctor ${socket.id} joined consultation ${consultationId}`);
      
      // Notify all participants in the room
      io.to(consultationId).emit('doctor-joined', { 
        consultationId,
        doctorId: socket.id 
      });
      
      // Check if both are ready to start signaling
      if (room && room.patientReady && room.doctorReady) {
        console.log('Both doctor and patient ready, starting signaling');
        io.to(consultationId).emit('start-signaling', consultationId);
      }
    });

    // Patient is ready for connection
    socket.on('patient-ready', (consultationId) => {
      const room = consultationRooms.get(consultationId);
      if (room) {
        room.patient = socket.id;
        room.patientReady = true;
      }
      
      console.log(`Patient ${socket.id} ready for consultation ${consultationId}`);
      
      // Notify all participants in the room
      io.to(consultationId).emit('patient-ready', { 
        consultationId,
        patientId: socket.id 
      });
      
      // Check if both are ready to start signaling
      if (room && room.patientReady && room.doctorReady) {
        console.log('Both doctor and patient ready, starting signaling');
        io.to(consultationId).emit('start-signaling', consultationId);
      }
    });

    // WebRTC signaling - Offer from doctor to patient
    socket.on('offer', ({ offer, consultationId }) => {
      console.log(`Relaying offer for consultation ${consultationId}`);
      socket.to(consultationId).emit('offer', { 
        offer, 
        consultationId,
        from: socket.id 
      });
    });

    // WebRTC signaling - Answer from patient to doctor
    socket.on('answer', ({ answer, consultationId }) => {
      console.log(`Relaying answer for consultation ${consultationId}`);
      socket.to(consultationId).emit('answer', { 
        answer, 
        consultationId,
        from: socket.id 
      });
    });

    // ICE candidates exchange
    socket.on('ice-candidate', ({ candidate, consultationId, from }) => {
      console.log(`Relaying ICE candidate for consultation ${consultationId} from ${from}`);
      socket.to(consultationId).emit('ice-candidate', { 
        candidate, 
        consultationId,
        from 
      });
    });

    // Call termination
    socket.on('end-call', (consultationId) => {
      console.log(`Call ended for consultation ${consultationId}`);
      socket.to(consultationId).emit('call-ended');
    });

    // Consultation completion
    socket.on('consultation-completed', (consultationId) => {
      console.log(`Consultation completed: ${consultationId}`);
      socket.to(consultationId).emit('consultation-completed');
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Clean up consultation rooms
      for (const [consultationId, room] of consultationRooms.entries()) {
        if (room.doctor === socket.id || room.patient === socket.id) {
          // Notify other participant about disconnection
          socket.to(consultationId).emit('participant-disconnected');
          
          // Reset room or delete if both participants left
          if (room.doctor === socket.id) {
            room.doctor = null;
          }
          if (room.patient === socket.id) {
            room.patient = null;
          }
          
          // Remove room if empty
          if (!room.doctor && !room.patient) {
            consultationRooms.delete(consultationId);
            console.log(`Cleaned up consultation room: ${consultationId}`);
          }
        }
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Log active rooms periodically (for debugging)
  setInterval(() => {
    if (consultationRooms.size > 0) {
      console.log('Active consultation rooms:', consultationRooms.size);
    }
  }, 30000); // Every 30 seconds

  return io;
};