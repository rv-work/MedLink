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
  
  // All medicines in this treatment
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

  // Day-wise breakdown
  days: [{
    date: Date,
    dayNumber: Number, // 1, 2, 3...
    totalMedicinesToTake: Number, // Total medicine doses for the day
    taken: {
      type: Number,
      default: 0
    },
    medicines: [{
      name: String,
      dose: String,
      totalToday: Number, // How many times this medicine should be taken today
      timings: [{
        name: {
          type: String,
          enum: ['Early Morning', 'Morning', 'Afternoon', 'Evening', 'Night'],
        },
        taken: {
          type: Boolean,
          default: false
        },
        takenAt: Date // When it was actually taken
      }]
    }]
  }],

  // Daily notes and condition tracking
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
    conditionNotes: String // Additional notes about the condition
  }],

  // Overall treatment progress
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
  }
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

const Treatment = mongoose.model('Treatment', treatmentSchema);
export default Treatment;