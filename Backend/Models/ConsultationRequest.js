import mongoose from 'mongoose';

const consultationRequestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  problemTitle: {
    type: String,
    required: true,
    trim: true
  },
  problemDescription: {
    type: String,
    required: true
  },
  consultationType: {
    type: String,
    required: true,
    enum: ['General', 'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Psychiatry', 'Other']
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Emergency'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledTime: {
    type: Date,
    default: null
  },
  meetingRoom: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const ConsultationRequest = mongoose.model('ConsultationRequest', consultationRequestSchema);
