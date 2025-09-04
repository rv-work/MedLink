import mongoose from 'mongoose';

const treatmentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  healthReportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthReport',
    required: true,
  },
  patientName: String,
  doctorName: String,
  hospital: String,
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active',
  },
  
  medicines: [{
    name: String,
    dose: String,
    frequency: String,
    quantity: String,
    timing: {
      type: [String],
      enum: ['Early Morning', 'Morning', 'Afternoon', 'Evening', 'Night'],
    }
  }],

  days: [{
    date: Date,
    dayNumber: Number, 
    totalMedicinesToTake: Number, 
    taken: {
      type: Number,
      default: 0
    },
    medicines: [{
      name: String,
      dose: String,
      totalToday: Number, 
      timings: [{
        name: {
          type: String,
          enum: ['Early Morning', 'Morning', 'Afternoon', 'Evening', 'Night'],
        },
        taken: {
          type: Boolean,
          default: false
        },
        takenAt: Date 
      }]
    }]
  }],

  dailyNotes: [{
    date: Date,
    notes: [{
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    condition: {
      type: String,
      enum: ['same', 'better', 'worse'],
      default: 'same'
    },
    conditionNotes: String 
  }],

  progress: {
    totalMedicinesDue: Number,
    totalMedicinesTaken: Number,
    adherencePercentage: {
      type: Number,
      default: 0
    }
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null
  },

  summaries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "TreatmentSummary"
  }]

});

treatmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

treatmentSchema.methods.calculateAdherence = function() {
  if (this.progress.totalMedicinesDue === 0) return 0;
  return Math.round((this.progress.totalMedicinesTaken / this.progress.totalMedicinesDue) * 100);
};

treatmentSchema.methods.updateProgress = function() {
  let totalDue = 0;
  let totalTaken = 0;

  this.days.forEach(day => {
    totalDue += day.totalMedicinesToTake;
    totalTaken += day.taken;
  });

  this.progress.totalMedicinesDue = totalDue;
  this.progress.totalMedicinesTaken = totalTaken;
  this.progress.adherencePercentage = this.calculateAdherence();
};

const Treatment =  mongoose.model("Treatment", treatmentSchema);

export default Treatment;
