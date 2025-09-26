// import mongoose from 'mongoose';
// import HealthReport from './HealthReport.js';

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   walletAddress: { type: String, required: true, unique: true },
//   password: { type: String }, 
//   phone: String,
//   gender: String,
//   dob: Date,
//   bloodGroup: String,

//   profilePicture : String,

//   heightRecords: [{
//     value: Number,
//     date: { type: Date, default: Date.now }
//   }],

//   weightRecords: [{
//     value: Number,
//     date: { type: Date, default: Date.now }
//   }],

//   medicalHistory: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'MedicalHistory'
//   },
//   lifestyle: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Lifestyle'
//   },
//   vitals: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Vitals'
//   },
//   emergencyContact: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'EmergencyContact'
//   },
//   reports: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'HealthReport'
//   }],

//   emergencyEnabled: {
//     type: Boolean,
//     default: false
//   }


//   // faceDescriptor: {
//   //   type: [Number],
//   //   validate: {
//   //     validator: function (v) {
//   //       return v.length === 128;
//   //     },
//   //     message: 'Face descriptor must be an array of 128 numbers'
//   //   },
//   //   required: false
//   // },



// } , {timestamps : true});




// const medicalHistorySchema = new mongoose.Schema({
//   allergies: [String],
//   chronicConditions: [String],
//   medications: [String],
//   surgeries: [String],
//   familyHistory: [String],
//   owner : {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// });



// const vitalsSchema = new mongoose.Schema({
//   bloodPressure: {
//     systolic: Number,
//     diastolic: Number
//   },
//   bloodSugar: Number,
//   cholesterol: Number,
//   heartRate: Number,
//   bmi: Number,
//   owner : {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// });



// const lifestyleSchema = new mongoose.Schema({
//   smokingStatus: String,
//   alcoholConsumption: String,
//   exerciseFrequency: String,
//   dietType: String,
//   sleepDuration: String,
//   owner : {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// });


// const emergencyContactSchema = new mongoose.Schema({
//   name: String,
//   phone: String,
//   relation: String,
//   owner : {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// });





// export const UserModel =  mongoose.model('User', userSchema);
// export const MedicalHistory =  mongoose.model('MedicalHistory', medicalHistorySchema);
// export const Vitals =  mongoose.model('Vitals', vitalsSchema);
// export const Lifestyle =  mongoose.model('Lifestyle', lifestyleSchema);
// export const EmergencyContact =  mongoose.model('EmergencyContact', emergencyContactSchema);

































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
  profilePicture: String,

  city: String,
  state: String,
  address: {
  houseNumber: String,
  street: String,
  area: String,
  city: String,
  state: String,
  country: { type: String, default: 'India' },
  pincode: String,
  landmark: String, 
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number], 
      default: [0, 0]
    }
  }
},

  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  donorStatus: {
    type: String,
    enum: ['Available', 'Not Available', 'Recently Donated'],
    default: 'Available'
  },
  lastDonationDate: Date,
  totalDonations: { type: Number, default: 0 },
  donationPreferences: {
    maxDistance: { type: Number, default: 50 }, // km
    availableForEmergency: { type: Boolean, default: true },
    preferredHospitals: [String]
  },

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
  emergencyContacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencyContact'
  }],
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthReport'
  }],

  isDoctor : { type: Boolean, default: false },

  emergencyEnabled: { type: Boolean, default: false },
  pushNotificationToken: String,
  notificationPreferences: {
    bloodRequestAlerts: { type: Boolean, default: true },
    emergencyAlerts: { type: Boolean, default: true },
    communityUpdates: { type: Boolean, default: true }
  }

}, { timestamps: true });




const allergySchema = new mongoose.Schema({
  allergen: { type: String, required: true }, // e.g. Penicillin
  type: String, // Drug Allergy, Food Allergy, etc.
  severity: { type: String, enum: ["Mild", "Moderate", "Severe"] },
  reaction: String,
  onsetDate: Date,
  verifiedBy: String,
  avoidanceInstructions: String,
  emergencyMedication: String,
  lastReaction: Date,
  notes: String
});


const medicineSchema = new mongoose.Schema({
  name: String,
  form : String , 
  dose: String,
  frequency: String,
  timing: {
    type: [String],
    enum: ["Early Morning", "Morning", "Afternoon", "Evening", "Night"]
  }
});


 const chronicConditionSchema = new mongoose.Schema({
  conditionName: { type: String, required: true },
  diagnosedOn: Date,
  severityLevel: { type: String, enum: ["mild", "moderate", "severe"] },
  medicines: [medicineSchema],
  triggers: [String],
  precautions: [String],
  lastReviewDate: Date
});



const surgicalHistorySchema = new mongoose.Schema({
  procedure: String,
  date: Date,
  surgeon: String,
  hospital: String,
  indication: String,
  complications: String,
  recoveryTime: String,
  anesthesia: String,
  pathologyReport: String,
  followUpDate: Date,
  notes: String
});

const immunizationSchema = new mongoose.Schema({
  vaccine: String,
  doses: String,
  lastDate: Date,
  nextDue: Date,
  provider: String,
  lotNumber: String,
  sideEffects: String,
  status: { type: String, enum: ["Current", "Overdue", "Completed"] }
});


const medicalHistorySchema = new mongoose.Schema({
 
  allergiesEncrypted: { type: String },
  chronicConditionsEncrypted: { type: String },
  surgicalHistoryEncrypted: { type: String },
  immunizationsEncrypted: { type: String },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });



const bloodPressureSchema = new mongoose.Schema({
  systolic: { type: Number, required: true },
  diastolic: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const bloodSugarSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const cholesterolSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const heartRateSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const bmiSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const vitalsSchema = new mongoose.Schema(
  {
    bloodPressure: [bloodPressureSchema],
    bloodSugar: [bloodSugarSchema],
    cholesterol: [cholesterolSchema],
    heartRate: [heartRateSchema],
    bmi: [bmiSchema],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);



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


