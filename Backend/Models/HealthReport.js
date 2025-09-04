import mongoose from 'mongoose';

const healthReportSchema = new mongoose.Schema({
 
  ageAtReport: Number,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vitals: {
  bloodPressure: String, // "120/80"
  heartRate: Number,
  temperature: Number,
  oxygenSaturation: Number,
  weight: Number,
  height: Number,
  bmi: Number
},
attachments: [{
  fileUrl: String,
  fileName : String, // report  , medicine list 
  fileType: String, // PDF, Image, etc.
}],
  reportType: {
  type: String,
  enum: ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'ECG', 'General Checkup', 'Other']
},
department: {
  type: String, // e.g., Cardiology, Neurology, Orthopedics
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

  medicines : [{
    name: String,
    dose: String,
    frequency: String,
    quantity : String,
    timing : {
      type: [String],
      enum: ['Early Morning' ,'Morning', 'Afternoon', 'Evening', 'Night'],
    }
  }],

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
  }],

 doctorMedlinkId: {
  type: String,
  index: true  
}
});

const HealthReport = mongoose.model('HealthReport', healthReportSchema);


export default HealthReport;


