import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  situation: {
    type: String,
    required: true,
    enum: ['car_accident', 'heart_attack', 'stroke', 'fall_injury', 'breathing_difficulty', 'severe_bleeding', 'other']
  },
  description: {
    type: String
  },
  photo: {
    type: String // base64 encoded image or image URL
  },
  coordinates: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: String // Phone number or contact info of who approved
  },
  rejectedBy: {
    type: String // Phone number or contact info of who rejected
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
emergencySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const EmergencyModel  = mongoose.model('Emergency', emergencySchema);