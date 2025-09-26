import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
    unique: true,
  },
  specialization: String,
  hospital: String,
  experienceYears: Number,
  contact: {
    email: String,
    phone: String,
  },

  doctorMedlinkId : {
    type : String,
    required : true,
    unique : true
  },

  treatments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Treatment"
  }],

 summaries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "TreatmentSummary"
  }]
}, {
  timestamps: true
});




const treatmentSummarySchema = new mongoose.Schema({
  treatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Treatment",
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  date: {
    type: Date, 
    required: true
  },
  medicineStats: {
    totalDue: Number,   
    totalTaken: Number, 
    adherence: Number  
  },
  patientNotes: [{
    message: String,
    timestamp: Date
  }],
  condition: {
    type: String,
    enum: ['same', 'better', 'worse'],
    default: 'same'
  },
  conditionNotes: String,

  doctorMessage: {
    type: String,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TreatmentSummary = mongoose.model("TreatmentSummary", treatmentSummarySchema);
const Doctor = mongoose.model("Doctor", doctorSchema);
export {Doctor , TreatmentSummary} ;











