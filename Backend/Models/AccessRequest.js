
import mongoose from 'mongoose';

const accessRequestSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthReport',
    required: true,
  },
  guestEmail: String,
  guestPhone: String,
  otp: String,
  otpExpiresAt: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AccessRequest = mongoose.model('AccessRequest', accessRequestSchema);
export default AccessRequest;