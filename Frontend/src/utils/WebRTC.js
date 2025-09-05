// utils/webrtcUtils.js - WebRTC helper functions
export class WebRTCManager {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.socket = null;
    this.isInitialized = false;
    
    this.pcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };
  }

  // Initialize WebRTC connection
  async initialize(socket, consultationId, userId, userType) {
    try {
      this.socket = socket;
      this.consultationId = consultationId;
      this.userId = userId;
      this.userType = userType;

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.pcConfig);

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Setup event handlers
      this.setupPeerConnectionHandlers();
      this.setupSocketHandlers();

      this.isInitialized = true;
      return this.localStream;
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      throw error;
    }
  }

  setupPeerConnectionHandlers() {
    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote stream');
      this.remoteStream = event.streams[0];
      this.onRemoteStream && this.onRemoteStream(this.remoteStream);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        console.log('Sending ICE candidate');
        this.socket.emit('webrtc-ice-candidate', {
          consultationId: this.consultationId,
          candidate: event.candidate,
          targetUserId: this.getTargetUserId()
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection.connectionState);
      this.onConnectionStateChange && this.onConnectionStateChange(this.peerConnection.connectionState);
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection.iceConnectionState);
      this.onIceConnectionStateChange && this.onIceConnectionStateChange(this.peerConnection.iceConnectionState);
    };
  }

  setupSocketHandlers() {
    // Handle WebRTC offer
    this.socket.on('webrtc-offer', async ({ offer, from }) => {
      console.log('Received WebRTC offer from:', from);
      try {
        await this.peerConnection.setRemoteDescription(offer);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        
        this.socket.emit('webrtc-answer', {
          consultationId: this.consultationId,
          answer,
          targetUserId: from
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    // Handle WebRTC answer
    this.socket.on('webrtc-answer', async ({ answer, from }) => {
      console.log('Received WebRTC answer from:', from);
      try {
        await this.peerConnection.setRemoteDescription(answer);
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    // Handle ICE candidates
    this.socket.on('webrtc-ice-candidate', async ({ candidate, from }) => {
      console.log('Received ICE candidate from:', from);
      try {
        await this.peerConnection.addIceCandidate(candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    // Handle user joined
    this.socket.on('user-joined', async ({ userId, userType }) => {
      console.log(`User joined: ${userType} ${userId}`);
      
      // If we're the doctor and patient joined, create offer
      if (this.userType === 'doctor' && userType === 'patient') {
        await this.createOffer(userId);
      }
    });
  }

  // Create and send offer
  async createOffer(targetUserId) {
    try {
      console.log('Creating offer for:', targetUserId);
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await this.peerConnection.setLocalDescription(offer);
      
      this.socket.emit('webrtc-offer', {
        consultationId: this.consultationId,
        offer,
        targetUserId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  // Get target user ID (opposite of current user type)
  getTargetUserId() {
    // This should be set based on consultation data
    return this.targetUserId;
  }

  setTargetUserId(targetUserId) {
    this.targetUserId = targetUserId;
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Toggle audio
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Get video/audio state
  getMediaState() {
    if (!this.localStream) return { video: false, audio: false };
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    const audioTrack = this.localStream.getAudioTracks()[0];
    
    return {
      video: videoTrack ? videoTrack.enabled : false,
      audio: audioTrack ? audioTrack.enabled : false
    };
  }

  // Screen sharing
  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );

      if (sender) {
        await sender.replaceTrack(videoTrack);
      }

      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      return screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  async stopScreenShare() {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      const videoTrack = cameraStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );

      if (sender) {
        await sender.replaceTrack(videoTrack);
      }

      // Update local stream reference
      const audioTrack = this.localStream.getAudioTracks()[0];
      this.localStream = new MediaStream([videoTrack, audioTrack]);

      return this.localStream;
    } catch (error) {
      console.error('Error stopping screen share:', error);
      throw error;
    }
  }

  // Cleanup
  cleanup() {
    console.log('Cleaning up WebRTC connection');
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.socket) {
      // Remove specific event listeners
      this.socket.off('webrtc-offer');
      this.socket.off('webrtc-answer');
      this.socket.off('webrtc-ice-candidate');
      this.socket.off('user-joined');
    }

    this.isInitialized = false;
  }

  // Set event callbacks
  setCallbacks({ onRemoteStream, onConnectionStateChange, onIceConnectionStateChange }) {
    this.onRemoteStream = onRemoteStream;
    this.onConnectionStateChange = onConnectionStateChange;
    this.onIceConnectionStateChange = onIceConnectionStateChange;
  }
}

// Export utility functions
export const checkBrowserSupport = () => {
  const hasWebRTC = !!(navigator.mediaDevices && 
                      navigator.mediaDevices.getUserMedia && 
                      window.RTCPeerConnection);
  
  const hasGetDisplayMedia = !!(navigator.mediaDevices && 
                               navigator.mediaDevices.getDisplayMedia);
  
  return {
    webrtc: hasWebRTC,
    screenShare: hasGetDisplayMedia,
    supported: hasWebRTC
  };
};

export const getMediaConstraints = (quality = 'high') => {
  const constraints = {
    low: {
      video: { width: 640, height: 480, frameRate: 15 },
      audio: true
    },
    medium: {
      video: { width: 1280, height: 720, frameRate: 24 },
      audio: true
    },
    high: {
      video: { width: 1920, height: 1080, frameRate: 30 },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    }
  };

  return constraints[quality] || constraints.medium;
};