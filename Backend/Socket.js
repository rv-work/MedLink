import socketIo from 'socket.io';

// Store consultation states to prevent race conditions
const consultationStates = new Map();

export const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: ["http://localhost:3000", "https://medlink-frontend.vercel.app"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join consultation room
    socket.on('join-consultation', (consultationId) => {
      console.log(`User ${socket.id} joined consultation ${consultationId}`);
      socket.join(consultationId);
      
      // Initialize consultation state if not exists
      if (!consultationStates.has(consultationId)) {
        consultationStates.set(consultationId, {
          doctor: null,
          patient: null,
          isConnected: false,
          isNegotiating: false,
          lastOfferTime: 0
        });
      }
    });

    // Doctor joined the consultation
    socket.on('doctor-joined', (consultationId) => {
      console.log(`Doctor ${socket.id} joined consultation ${consultationId}`);
      
      const state = consultationStates.get(consultationId);
      if (state) {
        state.doctor = socket.id;
        consultationStates.set(consultationId, state);
      }
      
      // Notify others that doctor joined
      socket.to(consultationId).emit('doctor-joined');
    });

    // Patient ready to start call
    socket.on('patient-ready', (consultationId) => {
      console.log(`Patient ${socket.id} is ready for consultation ${consultationId}`);
      
      const state = consultationStates.get(consultationId);
      if (!state) return;

      state.patient = socket.id;
      
      // Only proceed if not already connected and not currently negotiating
      if (!state.isConnected && !state.isNegotiating) {
        // Prevent multiple simultaneous negotiations
        const now = Date.now();
        if (now - state.lastOfferTime < 5000) { // 5 second cooldown
          console.log(`Skipping offer creation - too recent (${now - state.lastOfferTime}ms ago)`);
          return;
        }

        state.isNegotiating = true;
        state.lastOfferTime = now;
        consultationStates.set(consultationId, state);

        console.log(`Requesting doctor to create offer for consultation ${consultationId}`);
        
        // Tell doctor to create offer only if doctor is present
        if (state.doctor) {
          io.to(state.doctor).emit('create-offer');
        }
      } else if (state.isConnected) {
        console.log(`Consultation ${consultationId} is already connected`);
      } else if (state.isNegotiating) {
        console.log(`Consultation ${consultationId} is already negotiating`);
      }
    });

    // Handle WebRTC offer
    socket.on('offer', ({ offer, consultationId }) => {
      console.log(`Received offer for consultation ${consultationId}`);
      
      const state = consultationStates.get(consultationId);
      if (!state) return;

      // Forward offer to patient
      if (state.patient) {
        io.to(state.patient).emit('offer', { offer });
      }
    });

    // Handle WebRTC answer
    socket.on('answer', ({ answer, consultationId }) => {
      console.log(`Received answer for consultation ${consultationId}`);
      
      const state = consultationStates.get(consultationId);
      if (!state) return;

      // Forward answer to doctor
      if (state.doctor) {
        io.to(state.doctor).emit('answer', { answer });
      }

      // Mark as no longer negotiating since we have answer
      state.isNegotiating = false;
      consultationStates.set(consultationId, state);
    });

    // Handle ICE candidates
    socket.on('ice-candidate', ({ candidate, consultationId, from }) => {
      console.log(`Received ICE candidate from ${from} for consultation ${consultationId}`);
      
      // Forward to the other participant
      socket.to(consultationId).emit('ice-candidate', { candidate, from });
    });

    // Handle ICE restart
    socket.on('ice-restart-offer', ({ offer, consultationId, from }) => {
      console.log(`Received ICE restart offer from ${from} for consultation ${consultationId}`);
      
      // Forward to the other participant
      socket.to(consultationId).emit('ice-restart-offer', { offer, from });
    });

    socket.on('ice-restart-answer', ({ answer, consultationId, from }) => {
      console.log(`Received ICE restart answer from ${from} for consultation ${consultationId}`);
      
      // Forward to the other participant
      socket.to(consultationId).emit('ice-restart-answer', { answer, from });
    });

    // Handle connection success notification
    socket.on('connection-established', (consultationId) => {
      console.log(`WebRTC connection established for consultation ${consultationId}`);
      
      const state = consultationStates.get(consultationId);
      if (state) {
        state.isConnected = true;
        state.isNegotiating = false;
        consultationStates.set(consultationId, state);
      }
    });

    // Handle call end
    socket.on('end-call', (consultationId) => {
      console.log(`Call ended for consultation ${consultationId}`);
      
      // Notify other participant
      socket.to(consultationId).emit('call-ended');
      
      // Clean up consultation state
      consultationStates.delete(consultationId);
    });

    // Handle consultation completion
    socket.on('consultation-completed', (consultationId) => {
      console.log(`Consultation ${consultationId} completed`);
      
      // Notify other participant
      socket.to(consultationId).emit('consultation-completed');
      
      // Clean up consultation state
      consultationStates.delete(consultationId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Clean up states where this socket was a participant
      for (const [consultationId, state] of consultationStates.entries()) {
        if (state.doctor === socket.id || state.patient === socket.id) {
          // Notify other participant about disconnection
          socket.to(consultationId).emit('participant-disconnected', socket.id);
          
          // Reset the disconnected participant
          if (state.doctor === socket.id) {
            state.doctor = null;
          }
          if (state.patient === socket.id) {
            state.patient = null;
          }
          
          // If both are gone, clean up
          if (!state.doctor && !state.patient) {
            consultationStates.delete(consultationId);
          } else {
            state.isConnected = false;
            state.isNegotiating = false;
            consultationStates.set(consultationId, state);
          }
        }
      }
    });

    // Debug endpoint to check consultation states
    socket.on('get-consultation-state', (consultationId) => {
      const state = consultationStates.get(consultationId);
      socket.emit('consultation-state', { consultationId, state });
    });
  });

  // Periodic cleanup of old consultation states (every 30 minutes)
  setInterval(() => {
    const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
    for (const [consultationId, state] of consultationStates.entries()) {
      if (state.lastOfferTime < thirtyMinutesAgo && !state.isConnected) {
        console.log(`Cleaning up stale consultation state: ${consultationId}`);
        consultationStates.delete(consultationId);
      }
    }
  }, 30 * 60 * 1000);

  return io;
};
