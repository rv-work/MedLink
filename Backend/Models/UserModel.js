import mongoose from 'mongoose';
import HealthReport from './HealthReport.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true, unique: true },
  password: { type: String }, 
  phone: String,
  gender: String,
  dob: Date,
  bloodGroup: String,

  heightRecords: [{
    value: Number,
    date: { type: Date, default: Date.now }
  }],

  weightRecords: [{
    value: Number,
    date: { type: Date, default: Date.now }
  }],

  medicalHistory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalHistory'
  },
  lifestyle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lifestyle'
  },
  vitals: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vitals'
  },
  emergencyContact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencyContact'
  },
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthReport'
  }],

  faceDescriptor: {
    type: [Number],
    validate: {
      validator: function (v) {
        return v.length === 128;
      },
      message: 'Face descriptor must be an array of 128 numbers'
    },
    required: false
  },

  createdAt: { type: Date, default: Date.now }
});




const medicalHistorySchema = new mongoose.Schema({
  allergies: [String],
  chronicConditions: [String],
  medications: [String],
  surgeries: [String],
  familyHistory: [String],
  owner : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});



const vitalsSchema = new mongoose.Schema({
  bloodPressure: {
    systolic: Number,
    diastolic: Number
  },
  bloodSugar: Number,
  cholesterol: Number,
  heartRate: Number,
  bmi: Number,
  owner : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});



const lifestyleSchema = new mongoose.Schema({
  smokingStatus: String,
  alcoholConsumption: String,
  exerciseFrequency: String,
  dietType: String,
  sleepDuration: String,
  owner : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});


const emergencyContactSchema = new mongoose.Schema({
  name: String,
  phone: String,
  relation: String,
  owner : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});





export const UserModel =  mongoose.model('User', userSchema);
export const MedicalHistory =  mongoose.model('MedicalHistory', medicalHistorySchema);
export const Vitals =  mongoose.model('Vitals', vitalsSchema);
export const Lifestyle =  mongoose.model('Lifestyle', lifestyleSchema);
export const EmergencyContact =  mongoose.model('EmergencyContact', emergencyContactSchema);


