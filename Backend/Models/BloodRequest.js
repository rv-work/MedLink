import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  hospital: {
    name: { type: String, required: true },
    address: String,
    city: String,
    state: String,
    contactNumber: String,
     location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number], 
      default: [0, 0]
    }
  }
  },
  patient: {
    name: String,
    age: Number,
    condition: String
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  urgency: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  unitsRequired: {
    type: Number,
    required: true,
    min: 1
  },
  requiredBy: {
    type: Date,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['Active', 'Fulfilled', 'Cancelled', 'Expired'],
    default: 'Active'
  },
  responses: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Interested', 'Confirmed', 'Donated', 'Cancelled'],
      default: 'Interested'
    },
    donorDetails: {
      name: String,
      phone: String,
      email: String,
      lastDonationDate: Date,
      medicalClearance: Boolean
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
export default BloodRequest;
