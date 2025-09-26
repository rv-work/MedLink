

import cron from "node-cron";
import {TreatmentSummary , Doctor} from "../Models/Doctor.js";
import Treatment from "../Models/Treatment.js";

export const startDailySummaryJob = () => {



  cron.schedule("0 4 * * *", async () => {
    console.log("⏰ Running 4AM Treatment Summary Job...");

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

      const activeTreatments = await Treatment.find({
        status: "active",
        doctor: { $ne: null }
      });

      for (const treatment of activeTreatments) {
        const dayRecord = treatment.days.find(d =>
          d.date >= startOfDay && d.date <= endOfDay
        );

        if (!dayRecord) continue;

        const dailyNotes = treatment.dailyNotes.filter(n =>
          n.date >= startOfDay && n.date <= endOfDay
        );

        const summary = new TreatmentSummary({
          treatment: treatment._id,
          doctor: treatment.doctor,
          date: startOfDay,
          medicineStats: {
            totalDue: dayRecord.totalMedicinesToTake,
            totalTaken: dayRecord.taken,
            adherence:
              dayRecord.totalMedicinesToTake === 0
                ? 0
                : Math.round((dayRecord.taken / dayRecord.totalMedicinesToTake) * 100)
          },
          patientNotes: dailyNotes.flatMap(n => n.notes),
          condition: dailyNotes.length ? dailyNotes[dailyNotes.length - 1].condition : "same",
          conditionNotes: dailyNotes.length ? dailyNotes[dailyNotes.length - 1].conditionNotes : ""
        });

        const savedSummary = await summary.save();

        await Doctor.findByIdAndUpdate(treatment.doctor, {
          $push: { summaries: savedSummary._id }
        });

        await Treatment.findByIdAndUpdate(treatment._id, {
          $push: { summaries: savedSummary._id }
        });
      }

      console.log("✅ Treatment summaries generated for yesterday");
    } catch (err) {
      console.error("❌ Error in summary job:", err);
    }
  });
};
