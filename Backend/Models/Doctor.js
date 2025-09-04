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















// import mongoose from 'mongoose';

// const treatmentSchema = new mongoose.Schema({
//   owner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   healthReportId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'HealthReport',
//     required: true,
//   },
//   patientName: String,
//   doctorName: String,
//   hospital: String,
//   startDate: {
//     type: Date,
//     required: true,
//   },
//   endDate: {
//     type: Date,
//     required: true,
//   },
//   totalDays: {
//     type: Number,
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ['active', 'completed', 'paused'],
//     default: 'active',
//   },
  
//   medicines: [{
//     name: String,
//     dose: String,
//     frequency: String,
//     quantity: String,
//     timing: {
//       type: [String],
//       enum: ['Early Morning', 'Morning', 'Afternoon', 'Evening', 'Night'],
//     }
//   }],

//   days: [{
//     date: Date,
//     dayNumber: Number, 
//     totalMedicinesToTake: Number, 
//     taken: {
//       type: Number,
//       default: 0
//     },
//     medicines: [{
//       name: String,
//       dose: String,
//       totalToday: Number, 
//       timings: [{
//         name: {
//           type: String,
//           enum: ['Early Morning', 'Morning', 'Afternoon', 'Evening', 'Night'],
//         },
//         taken: {
//           type: Boolean,
//           default: false
//         },
//         takenAt: Date 
//       }]
//     }]
//   }],

//   dailyNotes: [{
//     date: Date,
//     notes: [{
//       message: String,
//       timestamp: {
//         type: Date,
//         default: Date.now
//       }
//     }],
//     condition: {
//       type: String,
//       enum: ['same', 'better', 'worse'],
//       default: 'same'
//     },
//     conditionNotes: String 
//   }],

//   progress: {
//     totalMedicinesDue: Number,
//     totalMedicinesTaken: Number,
//     adherencePercentage: {
//       type: Number,
//       default: 0
//     }
//   },

//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },

//   doctor: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Doctor',
//     default: null
//   },

//   summaries: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "TreatmentSummary"
//   }]

// });

// treatmentSchema.pre('save', function(next) {
//   this.updatedAt = new Date();
//   next();
// });

// treatmentSchema.methods.calculateAdherence = function() {
//   if (this.progress.totalMedicinesDue === 0) return 0;
//   return Math.round((this.progress.totalMedicinesTaken / this.progress.totalMedicinesDue) * 100);
// };

// treatmentSchema.methods.updateProgress = function() {
//   let totalDue = 0;
//   let totalTaken = 0;

//   this.days.forEach(day => {
//     totalDue += day.totalMedicinesToTake;
//     totalTaken += day.taken;
//   });

//   this.progress.totalMedicinesDue = totalDue;
//   this.progress.totalMedicinesTaken = totalTaken;
//   this.progress.adherencePercentage = this.calculateAdherence();
// };

// const Treatment =  mongoose.model("Treatment", treatmentSchema);

// export default Treatment;



// import cron from "node-cron";
// import {TreatmentSummary , Doctor} from "../Models/Doctor.js";
// import Treatment from "../Models/Treatment.js";

// export const startDailySummaryJob = () => {



//   cron.schedule("0 4 * * *", async () => {
//     console.log("⏰ Running 4AM Treatment Summary Job...");

//     try {
//       const yesterday = new Date();
//       yesterday.setDate(yesterday.getDate() - 1);
//       const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
//       const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

//       const activeTreatments = await Treatment.find({
//         status: "active",
//         doctor: { $ne: null }
//       });

//       for (const treatment of activeTreatments) {
//         const dayRecord = treatment.days.find(d =>
//           d.date >= startOfDay && d.date <= endOfDay
//         );

//         if (!dayRecord) continue;

//         const dailyNotes = treatment.dailyNotes.filter(n =>
//           n.date >= startOfDay && n.date <= endOfDay
//         );

//         const summary = new TreatmentSummary({
//           treatment: treatment._id,
//           doctor: treatment.doctor,
//           date: startOfDay,
//           medicineStats: {
//             totalDue: dayRecord.totalMedicinesToTake,
//             totalTaken: dayRecord.taken,
//             adherence:
//               dayRecord.totalMedicinesToTake === 0
//                 ? 0
//                 : Math.round((dayRecord.taken / dayRecord.totalMedicinesToTake) * 100)
//           },
//           patientNotes: dailyNotes.flatMap(n => n.notes),
//           condition: dailyNotes.length ? dailyNotes[dailyNotes.length - 1].condition : "same",
//           conditionNotes: dailyNotes.length ? dailyNotes[dailyNotes.length - 1].conditionNotes : ""
//         });

//         const savedSummary = await summary.save();

//         await Doctor.findByIdAndUpdate(treatment.doctor, {
//           $push: { summaries: savedSummary._id }
//         });

//         await Treatment.findByIdAndUpdate(treatment._id, {
//           $push: { summaries: savedSummary._id }
//         });
//       }

//       console.log("✅ Treatment summaries generated for yesterday");
//     } catch (err) {
//       console.error("❌ Error in summary job:", err);
//     }
//   });
// };
