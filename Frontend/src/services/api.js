const API_BASE_URL = 'https://medlink-bh5c.onrender.com/api';

export const consultationAPI = {
  // Create consultation request
  createRequest: async (requestData) => {
    const response = await fetch(`${API_BASE_URL}/consultation/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(requestData),
    });
    return response.json();
  },

  // Get pending requests (for doctors)
  getPendingRequests: async () => {
    const response = await fetch(`${API_BASE_URL}/consultation/pending`, {
      credentials: 'include',
    });
    return response.json();
  },

  // Get patient requests
  getPatientRequests: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/consultation/patient/${patientId}`, {
      credentials: 'include',
    });
    return response.json();
  },

  // Accept consultation request
  acceptRequest: async (requestId, doctorId, scheduledTime) => {
    const response = await fetch(`${API_BASE_URL}/consultation/accept/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ doctorId, scheduledTime }),
    });
    return response.json();
  },

  // Start consultation
  startConsultation: async (requestId) => {
    const response = await fetch(`${API_BASE_URL}/consultation/start/${requestId}`, {
      method: 'PUT',
      credentials: 'include',
    });
    return response.json();
  },

  // Complete consultation
  completeConsultation: async (requestId, notes) => {
    const response = await fetch(`${API_BASE_URL}/consultation/complete/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ notes }),
    });
    return response.json();
  },

  // Get consultation by room ID
  getConsultationByRoom: async (roomId) => {
    const response = await fetch(`${API_BASE_URL}/consultation/room/${roomId}`, {
      credentials: 'include',
    });
    return response.json();
  },
};
