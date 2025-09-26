import mongoose from 'mongoose';

const bloodDonationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  bloodRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest'
  },
hospital: {
  name: String,
  address: String,
  city: String,
  state: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  }
},

  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  unitsdonated: {
    type: Number,
    required: true,
    min: 1
  },
  donationDate: {
    type: Date,
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  donorPhoto: String, // Cloudinary URL
  certificate: String, // Generated certificate URL
  medicalTests: {
    hemoglobin: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    weight: Number,
    temperature: Number,
    cleared: {
      type: Boolean,
      default: false
    }
  },
  addToCommunity: {
    type: Boolean,
    default: false
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  feedback: {
    rating: Number,
    comment: String
  }
}, { 
  timestamps: true 
});

const BloodDonation = mongoose.model('BloodDonation', bloodDonationSchema);
export default BloodDonation;
