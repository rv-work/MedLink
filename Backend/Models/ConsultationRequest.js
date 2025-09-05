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
    trim: true,
    maxLength: 200
  },
  problemDescription: {
    type: String,
    required: true,
    maxLength: 2000
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
    default: '',
    maxLength: 5000
  },
  // Additional consultation metadata
  acceptedAt: {
    type: Date,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  endedAt: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: {
    type: String,
    maxLength: 1000,
    default: ''
  }
}, {
  timestamps: true
});

// Index for better query performance
consultationRequestSchema.index({ patient: 1, createdAt: -1 });
consultationRequestSchema.index({ doctor: 1, createdAt: -1 });
consultationRequestSchema.index({ status: 1, urgency: -1, createdAt: -1 });
consultationRequestSchema.index({ consultationType: 1, status: 1 });

// Virtual for consultation duration in human readable format
consultationRequestSchema.virtual('durationFormatted').get(function() {
  if (this.duration === 0) return 'Not completed';
  
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Pre-save middleware to calculate duration
consultationRequestSchema.pre('save', function(next) {
  if (this.startedAt && this.endedAt) {
    this.duration = Math.round((this.endedAt - this.startedAt) / (1000 * 60)); // Convert to minutes
  }
  next();
});

// Methods
consultationRequestSchema.methods.accept = function(doctorId, scheduledTime) {
  this.doctor = doctorId;
  this.status = 'accepted';
  this.acceptedAt = new Date();
  this.scheduledTime = scheduledTime || new Date();
  this.meetingRoom = require('uuid').v4(); // Generate unique meeting room ID
  return this.save();
};

consultationRequestSchema.methods.start = function() {
  this.status = 'in-progress';
  this.startedAt = new Date();
  return this.save();
};

consultationRequestSchema.methods.complete = function(notes, rating) {
  this.status = 'completed';
  this.endedAt = new Date();
  if (notes) this.notes = notes;
  if (rating) this.rating = rating;
  return this.save();
};

consultationRequestSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Static methods for analytics
consultationRequestSchema.statics.getConsultationStats = function(doctorId, startDate, endDate) {
  const matchStage = { doctor: mongoose.Types.ObjectId(doctorId) };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalConsultations: { $sum: 1 },
        completedConsultations: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledConsultations: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        averageRating: { $avg: '$rating' },
        totalDuration: { $sum: '$duration' },
        averageDuration: { $avg: '$duration' }
      }
    }
  ]);
};

export const ConsultationRequest = mongoose.model('ConsultationRequest', consultationRequestSchema);