import pkg from "node-cron"; 
const cron = pkg.default || pkg;

import { TreatmentSummary, Doctor } from "../Models/Doctor.js";
import Treatment from "../Models/Treatment.js";
export const startDailySummaryJob = () => {
  cron.schedule("1 5 * * *", async () => {
    console.log("⏰ Running 4:54AM Treatment Summary Job...");

    try {
      console.log("🔍 Starting summary generation process");
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() );

      const startOfDay = new Date(yesterday);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(yesterday);
      endOfDay.setHours(23, 59, 59, 999);

      console.log(`📅 Processing data for: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

      // Find active treatments with population for better debugging
      const activeTreatments = await Treatment.find({
        status: "active",
        doctor: { $ne: null }
      }).populate('doctor');

      console.log(`📊 Found ${activeTreatments.length} active treatments with assigned doctors`);

      if (activeTreatments.length === 0) {
        console.log("⚠️ No active treatments found with assigned doctors");
        return;
      }

      let processedCount = 0;
      let skippedCount = 0;

      for (const treatment of activeTreatments) {
        console.log(`\n🔄 Processing treatment ID: ${treatment._id}`);
        console.log(`👨‍⚕️ Doctor ID: ${treatment.doctor._id}`);
        console.log(`📝 Treatment has ${treatment.days.length} day records`);

        // Find day record with detailed logging
        const dayRecord = treatment.days.find(d => {
          const dayDate = new Date(d.date);
          const isSameDay = dayDate >= startOfDay && dayDate <= endOfDay;
          console.log(`   📅 Checking day: ${dayDate.toISOString()} - Match: ${isSameDay}`);
          return isSameDay;
        });

        if (!dayRecord) {
          console.log(`   ⚠️ No day record found for ${startOfDay.toDateString()}`);
          skippedCount++;
          continue;
        }

        console.log(`   ✅ Found day record: ${dayRecord.totalMedicinesToTake} due, ${dayRecord.taken} taken`);

        // Find daily notes
        const dailyNotes = treatment.dailyNotes.filter(n => {
          const noteDate = new Date(n.date);
          return noteDate >= startOfDay && noteDate <= endOfDay;
        });

        console.log(`   📝 Found ${dailyNotes.length} daily notes`);

        // Create summary with detailed logging
        const summaryData = {
          treatment: treatment._id,
          doctor: treatment.doctor._id,
          date: startOfDay,
          medicineStats: {
            totalDue: dayRecord.totalMedicinesToTake,
            totalTaken: dayRecord.taken,
            adherence: dayRecord.totalMedicinesToTake === 0 ? 0 : 
              Math.round((dayRecord.taken / dayRecord.totalMedicinesToTake) * 100)
          },
          patientNotes: dailyNotes.flatMap(n => n.notes),
          condition: dailyNotes.length ? dailyNotes[dailyNotes.length - 1].condition : "same",
          conditionNotes: dailyNotes.length ? dailyNotes[dailyNotes.length - 1].conditionNotes : ""
        };

        console.log(`   💾 Creating summary with data:`, JSON.stringify(summaryData, null, 2));

        try {
          const summary = new TreatmentSummary(summaryData);
          const savedSummary = await summary.save();
          
          console.log(`   ✅ Summary saved with ID: ${savedSummary._id}`);

          // Update references with error handling
          await Doctor.findByIdAndUpdate(treatment.doctor._id, {
            $push: { summaries: savedSummary._id }
          });

          await Treatment.findByIdAndUpdate(treatment._id, {
            $push: { summaries: savedSummary._id }
          });

          processedCount++;

        } catch (saveError) {
          console.error(`   ❌ Error saving summary for treatment ${treatment._id}:`, saveError);
        }
      }

      console.log(`\n📊 Summary Generation Complete:`);
      console.log(`   ✅ Processed: ${processedCount}`);
      console.log(`   ⚠️ Skipped: ${skippedCount}`);

    } catch (err) {
      console.error("❌ Error in summary job:", err);
      console.error("Stack trace:", err.stack);
    }
  });
};
