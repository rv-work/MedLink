import { ConsultationRequest } from '../Models/ConsultationRequest.js';
import { v4 as uuidv4 } from 'uuid';

// Create new consultation request
export const createConsultationRequest = async (req, res) => {
  try {
    const { problemTitle, problemDescription, consultationType, urgency, scheduledTime } = req.body;
    const patientId = req.user._id;

    const consultation = new ConsultationRequest({
      patient: patientId,
      problemTitle,
      problemDescription,
      consultationType,
      urgency,
      scheduledTime: scheduledTime || null
    });

    await consultation.save();
    await consultation.populate('patient', 'name email profilePicture');

    res.status(201).json({
      success: true,
      message: 'Consultation request created successfully',
      consultation
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create consultation request'
    });
  }
};

// Get consultation requests for doctors
export const getConsultationRequests = async (req, res) => {
  try {
    const { consultationType, urgency, status = 'pending' } = req.query;
    const doctorId = req.user._id;

    // Build filter
    let filter = { status };
    if (consultationType && consultationType !== 'All') {
      filter.consultationType = consultationType;
    }
    if (urgency) {
      filter.urgency = urgency;
    }

    const consultations = await ConsultationRequest.find(filter)
      .populate('patient', 'name email profilePicture phone')
      .populate('doctor', 'name email profilePicture')
      .sort({ createdAt: -1, urgency: -1 });

    res.status(200).json({
      success: true,
      consultations
    });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consultation requests'
    });
  }
};

// Accept consultation request
export const acceptConsultationRequest = async (req, res) => {
  try {
    const consultationId = req.params.id;
    const doctorId = req.user._id;
    const { scheduledTime } = req.body;

    // Generate unique meeting room ID
    const meetingRoom = uuidv4();

    const consultation = await ConsultationRequest.findByIdAndUpdate(
      consultationId,
      {
        doctor: doctorId,
        status: 'accepted',
        scheduledTime: scheduledTime || new Date(),
        meetingRoom
      },
      { new: true }
    ).populate('patient', 'name email profilePicture phone')
     .populate('doctor', 'name email profilePicture');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation accepted successfully',
      consultation
    });
  } catch (error) {
    console.error('Error accepting consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept consultation'
    });
  }
};

// Get consultation by ID
export const getConsultationById = async (req, res) => {
  try {
    const consultationId = req.params.id;
    const userId = req.user._id;

    const consultation = await ConsultationRequest.findById(consultationId)
      .populate('patient', 'name email profilePicture phone')
      .populate('doctor', 'name email profilePicture specialization');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

   

    res.status(200).json({
      success: true,
      consultation
    });
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consultation'
    });
  }
};

// Update consultation status
export const updateConsultationStatus = async (req, res) => {
  try {
    const consultationId = req.params.id;
    const { status, notes } = req.body;
    const userId = req.user._id;

    const consultation = await ConsultationRequest.findById(consultationId);
    
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Check authorization
    if (consultation.patient.toString() !== userId && 
        consultation.doctor?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedConsultation = await ConsultationRequest.findByIdAndUpdate(
      consultationId,
      { status, notes: notes || consultation.notes },
      { new: true }
    ).populate('patient', 'name email profilePicture')
     .populate('doctor', 'name email profilePicture');

    res.status(200).json({
      success: true,
      message: 'Consultation updated successfully',
      consultation: updatedConsultation
    });
  } catch (error) {
    console.error('Error updating consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consultation'
    });
  }
};

// Get patient's consultations
export const getPatientConsultations = async (req, res) => {
  try {
    const patientId = req.user._id;

    const consultations = await ConsultationRequest.find({ patient: patientId })
      .populate('doctor', 'name email profilePicture specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      consultations
    });
  } catch (error) {
    console.error('Error fetching patient consultations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consultations'
    });
  }
};

// Get doctor's consultations
export const getDoctorConsultations = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const consultations = await ConsultationRequest.find({ doctor: doctorId })
      .populate('patient', 'name email profilePicture phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      consultations
    });
  } catch (error) {
    console.error('Error fetching doctor consultations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consultations'
    });
  }
};