import mongoose from 'mongoose';

const healthReportSchema = new mongoose.Schema({
  reportFileUrl : String,
  reportFilePublicId : String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientName : String,
  doctorName: String,
  hospital: String,
  diagnosisSummary: String,
  reasonOfCheckup: String,
  prescription: String,
  dateOfReport: {
    type: Date,
    required: true,
  },

  blockchainTxHash: {
    type: String,
  },
  type : {
    type: String,
    enum: ['web2', 'web3'],
    default: 'web2',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  allowedViewers : [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }]
});

const HealthReport = mongoose.model('HealthReport', healthReportSchema);
export default HealthReport;