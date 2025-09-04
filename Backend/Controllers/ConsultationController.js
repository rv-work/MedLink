import { ConsultationRequest } from "../Models/ConsultationRequest.js"
import { v4 as uuidv4 } from 'uuid';

// Create consultation request
export const createConsultationRequest = async (req, res) => {
  try {
    const { problemTitle, problemDescription, consultationType, urgency } = req.body;
    const patientId = req.user._id; // From auth middleware

    const consultationRequest = new ConsultationRequest({
      patient: patientId,
      problemTitle,
      problemDescription,
      consultationType,
      urgency
    });

    await consultationRequest.save();
    await consultationRequest.populate('patient', 'name email');

    res.status(201).json({
      success: true,
      message: 'Consultation request created successfully',
      data: consultationRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating consultation request',
      error: error.message
    });
  }
};

// Get all pending requests for doctors
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await ConsultationRequest.find({ status: 'pending' })
      .populate('patient', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message
    });
  }
};

// Accept consultation request
export const acceptConsultationRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const doctorId = req.user._id;

    const meetingRoom = uuidv4(); // Generate unique room ID

    const request = await ConsultationRequest.findByIdAndUpdate(
      requestId,
      {
        doctor: doctorId,
        status: 'accepted',
        meetingRoom,
        scheduledTime: new Date()
      },
      { new: true }
    ).populate('patient', 'name email')
     .populate('doctor', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Consultation request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Request accepted successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accepting request',
      error: error.message
    });
  }
};

// Get user's consultation requests
export const getUserConsultationRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ConsultationRequest.find({
      $or: [
        { patient: userId },
        { doctor: userId }
      ]
    })
    .populate('patient', 'name email')
    .populate('doctor', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consultation requests',
      error: error.message
    });
  }
};

// Get active consultation (accepted and in-progress)
export const getActiveConsultation = async (req, res) => {
  try {
    const userId = req.user._id;

    const activeConsultation = await ConsultationRequest.findOne({
      $or: [
        { patient: userId },
        { doctor: userId }
      ],
      status: { $in: ['accepted', 'in-progress'] }
    })
    .populate('patient', 'name email')
    .populate('doctor', 'name email');

    res.status(200).json({
      success: true,
      data: activeConsultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active consultation',
      error: error.message
    });
  }
};

// Update consultation status
export const updateConsultationStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes } = req.body;

    const request = await ConsultationRequest.findByIdAndUpdate(
      requestId,
      { status, notes },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};


// Controllers/ConsultationController.js - Add these new methods

// Get patient's pending request
export const getPatientPendingRequest = async (req, res) => {
  try {
    const patientId = req.user._id;

    const request = await ConsultationRequest.findOne({
      patient: patientId,
      status: { $in: ['pending', 'accepted'] }
    })
    .populate('patient', 'name email')
    .populate('doctor', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending request',
      error: error.message
    });
  }
};

// Get specific consultation by ID
export const getConsultationById = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const userId = req.user._id;

    const consultation = await ConsultationRequest.findOne({
      _id: consultationId,
      $or: [
        { patient: userId },
        { doctor: userId }
      ]
    })
    .populate('patient', 'name email')
    .populate('doctor', 'name email');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consultation',
      error: error.message
    });
  }
};

// Cancel consultation request
export const cancelConsultationRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await ConsultationRequest.findOneAndUpdate(
      { 
        _id: requestId, 
        patient: userId,
        status: { $in: ['pending', 'accepted'] }
      },
      { status: 'cancelled' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or cannot be cancelled'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling request',
      error: error.message
    });
  }
};
