import mongoose from 'mongoose';

const communityStatsSchema = new mongoose.Schema({
  city: String,
  state: String,
  country: { type: String, default: 'India' },
  totalDonations: { type: Number, default: 0 },
  totalDonors: { type: Number, default: 0 },
  activeRequests: { type: Number, default: 0 },
  bloodGroupStats: {
    'A+': { donors: Number, donations: Number },
    'A-': { donors: Number, donations: Number },
    'B+': { donors: Number, donations: Number },
    'B-': { donors: Number, donations: Number },
    'AB+': { donors: Number, donations: Number },
    'AB-': { donors: Number, donations: Number },
    'O+': { donors: Number, donations: Number },
    'O-': { donors: Number, donations: Number }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

const CommunityStats = mongoose.model('CommunityStats', communityStatsSchema);
export default CommunityStats;
