import { EmergencyContact } from "../Models/UserModel.js"; 
import { Doctor } from '../Models/Doctor.js';
import HealthReport from '../Models/HealthReport.js';
import Treatment from '../Models/Treatment.js';
import { UserModel , Vitals } from '../Models/UserModel.js';
import { DecryptArrayField  } from '../Utils/Encrypt.js';
import { GoogleGenerativeAI  } from "@google/generative-ai";
import twilio from "twilio";
import dotenv from 'dotenv';
dotenv.config();


async function updateUserVitalsFromReport(userId, vitals, dateOfReport) {
  if (!vitals || Object.keys(vitals).length === 0) return;

  const updateOps = {};
  const vitalsUpdate = {};

  const reportDate = new Date(dateOfReport);

 let heightVal, weightVal;

  if (vitals.height) {
    heightVal = Number(vitals.height);
    updateOps.$push = updateOps.$push || {};
    updateOps.$push.heightRecords = { value: heightVal, date: reportDate };
  }

  if (vitals.weight) {
    weightVal = Number(vitals.weight);
    updateOps.$push = updateOps.$push || {};
    updateOps.$push.weightRecords = { value: weightVal, date: reportDate };
  }

   if (heightVal && weightVal) {
    const heightInMeters = heightVal / 100; 
    const bmiVal = +(weightVal / (heightInMeters ** 2)).toFixed(2);
    vitalsUpdate.$push = vitalsUpdate.$push || {};
    vitalsUpdate.$push.bmi = { value: bmiVal, date: reportDate };
  }

  if (vitals.heartRate) {
    vitalsUpdate.$push = vitalsUpdate.$push || {};
    vitalsUpdate.$push.heartRate = { value: Number(vitals.heartRate), date: reportDate };
  }

  if (vitals.bloodPressure) {
    let systolic, diastolic;
    if (typeof vitals.bloodPressure === 'string') {
      const parts = vitals.bloodPressure.split('/');
      if (parts.length === 2) {
        systolic = Number(parts[0]);
        diastolic = Number(parts[1]);
      }
    } else if (typeof vitals.bloodPressure === 'object') {
      systolic = Number(vitals.bloodPressure.systolic);
      diastolic = Number(vitals.bloodPressure.diastolic);
    }

    if (!isNaN(systolic) && !isNaN(diastolic)) {
      vitalsUpdate.$push = vitalsUpdate.$push || {};
      vitalsUpdate.$push.bloodPressure = { systolic, diastolic, date: reportDate };
    }
  }

  if (Object.keys(updateOps).length > 0) {
    await UserModel.findByIdAndUpdate(userId, updateOps);
  }

  const userDoc = await UserModel.findById(userId);
  if (userDoc?.vitals) {
    await Vitals.findByIdAndUpdate(userDoc.vitals, vitalsUpdate, { upsert: true });
  } else if (Object.keys(vitalsUpdate).length > 0) {
    // Create new Vitals doc if none exists
    const newVitalsDoc = await Vitals.create({ ...Object.fromEntries(Object.entries(vitalsUpdate.$push).map(([k, v]) => [k, [v]])), owner: userId });
    await UserModel.findByIdAndUpdate(userId, { vitals: newVitalsDoc._id });
  }


}




export const UserDashboard = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id)
      .populate('medicalHistory')
      .populate('lifestyle')
      .populate('vitals')
      .populate('emergencyContacts');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let decryptedMedicalHistory = null;
    if (user.medicalHistory) {
      const med = user.medicalHistory;
      
      decryptedMedicalHistory = {
        allergies: med.allergiesEncrypted ? DecryptArrayField(med.allergiesEncrypted) : [],
        chronicConditions: med.chronicConditionsEncrypted ? DecryptArrayField(med.chronicConditionsEncrypted) : [],
        surgicalHistory: med.surgicalHistoryEncrypted ? DecryptArrayField(med.surgicalHistoryEncrypted) : [],
        immunizations: med.immunizationsEncrypted ? DecryptArrayField(med.immunizationsEncrypted) : []
      };
    }

    user.medicalHistory = decryptedMedicalHistory;


    return res.json({
      success: true,
      message: 'User dashboard data retrieved successfully',
      user: user
    });
    
  } catch (err) {
    console.error('UserDashboard Error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error retrieving dashboard data',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

export const UploadUserReportWeb3 = async (req, res) => {
  try {
    const {
      address,
      patientName,
      doctorName,
      hospital,
      diagnosisSummary,
      reasonOfCheckup,
      prescription,
      dateOfReport,
      medicines,
      reportType,
      department,
      vitals,
      ageAtReport,
      isIdAvailable,
      doctorMedlinkId
    } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address Not Found Please Login Through Your MetaMask"
      });
    }

    if (!patientName || !doctorName || !hospital || !diagnosisSummary || !reasonOfCheckup || !prescription || !dateOfReport) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled"
      });
    }

    const acc = await UserModel.findOne({
      walletAddress: address
    });

    if (!acc) {
      return res.status(400).json({
        success: false,
        message: "Address Not Matched With Registered Address"
      });
    }


     let medId = "Not Availble";
    if(isIdAvailable){
     medId = doctorMedlinkId
    }

    let parsedMedicines = medicines;
    if (typeof medicines === 'string') {
      try {
        parsedMedicines = JSON.parse(medicines);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for medicines"
        });
      }
    }

    let parsedVitals = {};
    if (vitals) {
      if (typeof vitals === 'string') {
        try {
          parsedVitals = JSON.parse(vitals);
        } catch (e) {
          console.warn("Invalid vitals format, using empty object");
        }
      } else {
        parsedVitals = vitals;
      }
       ["weightRecords", "heightRecords"].forEach(key => {
        if (Array.isArray(parsedVitals[key])) {
          parsedVitals[key] = parsedVitals[key].map(record => {
            const rawDate = Array.isArray(record.date) ? record.date[0] : record.date;
            const dateObj = rawDate ? new Date(rawDate) : undefined;
            return {
              ...record,
              date: dateObj && !isNaN(dateObj) ? dateObj : undefined
            };
          });
        }
      });
    }


    const rawDate = Array.isArray(dateOfReport) ? dateOfReport[0] : dateOfReport;
    const safeDate = rawDate ? new Date(rawDate) : undefined;
    if (!safeDate || isNaN(safeDate)) {
      return res.status(400).json({ success: false, message: "Invalid dateOfReport" });
    }

    const newReport = new HealthReport({
      owner: req.user._id,
      patientName,
      doctorName,
      hospital,
      diagnosisSummary,
      reasonOfCheckup,
      prescription,
      doctorMedlinkId : medId,
      medicines: parsedMedicines || [],
      dateOfReport: new Date(dateOfReport),
      reportType: reportType || 'Other',
      department: department || '',
      vitals: parsedVitals,
      ageAtReport: ageAtReport ? parseInt(ageAtReport) : undefined,
      type: "web3",
      blockchainTxHash: "pending",
      attachments: [] 
    });

    const savedReport = await newReport.save();

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      { $push: { reports: savedReport._id } },
      { new: true }
    );

    if (Object.keys(parsedVitals).length > 0) {
      await updateUserVitalsFromReport(req.user._id, parsedVitals, dateOfReport);
    }

    let treatment = null;
    if (parsedMedicines && parsedMedicines.length > 0) {
      try {
        treatment = await createTreatmentFromReport(savedReport._id, req.user._id );
      } catch (treatmentError) {
        console.warn('Failed to create treatment:', treatmentError.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Report created successfully, ready for blockchain file upload" + (treatment ? " and treatment created" : ""),
      userId: updatedUser._id,
      reportId: savedReport._id,
      treatmentId: treatment?._id,
      data: {
        reportId: savedReport._id,
        treatmentId: treatment?._id,
        patientName: savedReport.patientName,
        doctorName: savedReport.doctorName,
        hospital: savedReport.hospital,
        dateOfReport: savedReport.dateOfReport,
        uploadedAt: savedReport.createdAt,
        treatmentCreated: !!treatment,
        treatmentDays: treatment?.totalDays,
        filesWillBeStoredOnBlockchain: true
      }
    });

  } catch (err) {
    console.error('UploadUserReportWeb3 Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred while creating report'
    });
  }
};

export const UpdateUserReportWeb3 =async (req , res) => {
  try {

    const { txHash } = req.body;
    const {reportId} = req.params;

    console.log("inside update user : " ,txHash, reportId);


    const report = await HealthReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    if (report.blockchainTxHash !== "pending") {
      return res.status(400).json({ message: "Report already updated on blockchain" });
    }
    report.blockchainTxHash = txHash;

    const savedReport = await report.save();
    
     res.status(201).json({ message: "Report uploaded", reportId: savedReport._id });
  } catch (err) {
    console.error('UploadUserReport Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }

};



const calculateMaxTreatmentDays = (medicines) => {
  if (!medicines || medicines.length === 0) return 0;

  let maxDays = 0;
  
  medicines.forEach(medicine => {
    if (medicine.quantity && medicine.frequency) {
      const quantity = parseInt(medicine.quantity) || 0;
      const frequency = parseInt(medicine.frequency) || 1;
      
      if (quantity > 0 && frequency > 0) {
        const days = Math.ceil(quantity / frequency);
        maxDays = Math.max(maxDays, days);
      }
    }
  });

  return maxDays || 7; 
};

const generateDailySchedule = (medicines, startDate, totalDays) => {
  const days = [];

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    let totalMedicinesToTake = 0;
    const dayMedicines = [];

    medicines.forEach(medicine => {
      const frequency = parseInt(medicine.frequency) || 1;
      const quantity = parseInt(medicine.quantity) || 0;
      
      const daysNeeded = Math.ceil(quantity / frequency);
      if (i < daysNeeded) {
        totalMedicinesToTake += frequency;
        
        const timings = medicine.timing.map(timeSlot => ({
          name: timeSlot,
          taken: false,
          takenAt: null
        }));

        dayMedicines.push({
          name: medicine.name,
          dose: medicine.dose,
          totalToday: frequency,
          timings: timings
        });
      }
    });

    days.push({
      date: currentDate,
      dayNumber: i + 1,
      totalMedicinesToTake,
      taken: 0,
      medicines: dayMedicines
    });
  }

  return days;
};


export const createTreatmentFromReport = async (reportId, userId ) => {
  try {
    const healthReport = await HealthReport.findById(reportId);
    if (!healthReport) {
      throw new Error('Health report not found');
    }

    if (healthReport.owner.toString() !== userId.toString()) {
      throw new Error('Unauthorized access to health report');
    }

    const existingTreatment = await Treatment.findOne({ 
      healthReportId: reportId,
      status: { $ne: 'completed' }
    });

    if (existingTreatment) {
      throw new Error('Active treatment already exists for this report');
    }

    const medicines = healthReport.medicines || [];
    if (medicines.length === 0) {
      throw new Error('No medicines found in health report');
    }

    const startDate = new Date();
    const totalDays = calculateMaxTreatmentDays(medicines);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + totalDays);

    const days = generateDailySchedule(medicines, startDate, totalDays);

    const totalMedicinesDue = days.reduce((sum, day) => sum + day.totalMedicinesToTake, 0);



    let doctorRef = null;

    if (healthReport.doctorMedlinkId) {
      const doctor = await Doctor.findOne({
        doctorMedlinkId: healthReport.doctorMedlinkId,
      });

      if (doctor) {
        doctorRef = doctor._id; 
      } else {
        console.warn(
          "⚠️ No doctor found with this MedlinkId:",
          healthReport.doctorMedlinkId
        );
      }
    }
    


    const newTreatment = new Treatment({
      owner: userId,
      healthReportId: reportId,
      patientName: healthReport.patientName,
      doctorName: healthReport.doctorName,
      hospital: healthReport.hospital,
      startDate,
      endDate,
      totalDays,
      medicines,
      days,
      doctor: doctorRef,
      dailyNotes: [{
        date: startDate,
        notes: [{
          message: 'Treatment started',
          timestamp: new Date()
        }],
        condition: 'same',
        conditionNotes: 'Initial condition'
      }],
      progress: {
        totalMedicinesDue,
        totalMedicinesTaken: 0,
        adherencePercentage: 0
      },
       doctorNotes: [{
        message: "Please take care ",
        fordate: startDate
      }]
    });

    const savedTreatment = await newTreatment.save();


    if (doctorRef) {
      await Doctor.findByIdAndUpdate(doctorRef, {
        $push: { treatments: savedTreatment._id },
      });
    }



    return savedTreatment;
  } catch (error) {
    throw error;
  }
};


export const UploadUserReportWeb2 = async (req, res) => {
  try {
    const {
      patientName,
      doctorName,
      hospital,
      diagnosisSummary,
      reasonOfCheckup,
      prescription,
      dateOfReport,
      medicines,
      reportType,
      department,
      vitals,
      ageAtReport,
      isIdAvailable,
      doctorMedlinkId
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Please login to upload report" });
    }

    if (!patientName || !doctorName || !hospital || !diagnosisSummary || !reasonOfCheckup || !prescription || !dateOfReport) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    if (!req.files?.reportFiles || req.files.reportFiles.length === 0) {
      return res.status(400).json({ success: false, message: "Please upload at least one report file" });
    }

    let medId = isIdAvailable ? doctorMedlinkId : "Not Available";

    let parsedMedicines = medicines;
    if (typeof medicines === "string") {
      try {
        parsedMedicines = JSON.parse(medicines);
      } catch (e) {
        return res.status(400).json({ success: false, message: "Invalid JSON format for medicines" });
      }
    }

    let parsedVitals = {};
    if (vitals) {
      if (typeof vitals === "string") {
        try {
          parsedVitals = JSON.parse(vitals);
        } catch (e) {
          console.warn("Invalid vitals format, using empty object");
          parsedVitals = {};
        }
      } else {
        parsedVitals = vitals;
      }

      ["weightRecords", "heightRecords"].forEach(key => {
        if (Array.isArray(parsedVitals[key])) {
          parsedVitals[key] = parsedVitals[key].map(record => {
            const rawDate = Array.isArray(record.date) ? record.date[0] : record.date;
            const dateObj = rawDate ? new Date(rawDate) : undefined;
            return {
              ...record,
              date: dateObj && !isNaN(dateObj) ? dateObj : undefined
            };
          });
        }
      });
    }

    const attachments = [];
    if (req.files.reportFiles) {
      req.files.reportFiles.forEach(file => {
        attachments.push({
          fileUrl: file.path,
          fileName: file.originalname,
          fileType: file.mimetype
        });
      });
    }

    if (req.files.medicineFile && req.files.medicineFile[0]) {
      attachments.push({
        fileUrl: req.files.medicineFile[0].path,
        fileName: "Medicine List",
        fileType: req.files.medicineFile[0].mimetype
      });
    }

    // Handle top-level date
    const rawDate = Array.isArray(dateOfReport) ? dateOfReport[0] : dateOfReport;
    const safeDate = rawDate ? new Date(rawDate) : undefined;
    if (!safeDate || isNaN(safeDate)) {
      return res.status(400).json({ success: false, message: "Invalid dateOfReport" });
    }

    // Create and save report
    const newReport = new HealthReport({
      owner: req.user._id,
      patientName,
      doctorName,
      hospital,
      diagnosisSummary,
      reasonOfCheckup,
      prescription,
      doctorMedlinkId: medId,
      medicines: parsedMedicines || [],
      dateOfReport: safeDate,
      attachments,
      reportType: reportType || "Other",
      department: department || "",
      vitals: parsedVitals,
      ageAtReport: ageAtReport ? parseInt(ageAtReport) : undefined,
      type: "web2",
      blockchainTxHash: "Not Available"
    });

    const savedReport = await newReport.save();

    // Update user with report
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      { $push: { reports: savedReport._id } },
      { new: true }
    );

    // Update user vitals safely
    await updateUserVitalsFromReport(req.user._id, parsedVitals, safeDate);

    // Create treatment if medicines exist
    let treatment = null;
    if (parsedMedicines && parsedMedicines.length > 0) {
      try {
        treatment = await createTreatmentFromReport(savedReport._id, req.user._id);
      } catch (treatmentError) {
        console.warn("Failed to create treatment:", treatmentError.message);
      }
    }

    // Respond
    return res.status(201).json({
      success: true,
      message: "Report uploaded successfully" + (treatment ? " and treatment created" : ""),
      userId: updatedUser._id,
      reportId: savedReport._id,
      treatmentId: treatment?._id,
      data: {
        reportId: savedReport._id,
        treatmentId: treatment?._id,
        patientName: savedReport.patientName,
        doctorName: savedReport.doctorName,
        hospital: savedReport.hospital,
        dateOfReport: savedReport.dateOfReport,
        uploadedAt: savedReport.createdAt,
        attachments: savedReport.attachments,
        fileCount: attachments.length,
        reportFileCount: req.files?.reportFiles?.length || 0,
        medicineFileUploaded: !!(req.files?.medicineFile && req.files.medicineFile[0]),
        treatmentCreated: !!treatment,
        treatmentDays: treatment?.totalDays
      }
    });

  } catch (err) {
    console.error("UploadUserReportWeb2 Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while uploading report"
    });
  }
};


// Get active treatments for user
export const getActiveTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.find({
      owner: req.user._id,
      status: 'active'
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      treatments
    });
  } catch (error) {
    console.error('Get active treatments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching treatments'
    });
  }
};

export const markMedicineAsTaken = async (req, res) => {

  console.log("body : " , req.body)
  try {
    const { treatmentId, dayIndex, medicineIndex, timingIndex } = req.body;

    const treatment = await Treatment.findOne({
      _id: treatmentId,
      owner: req.user._id
    });

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }

    const day = treatment.days[dayIndex];
    const medicine = day.medicines[medicineIndex];
    const timing = medicine.timings[timingIndex];

    if (timing.taken) {
      return res.status(400).json({
        success: false,
        message: 'Medicine already marked as taken'
      });
    }

    timing.taken = true;
    timing.takenAt = new Date();
    day.taken += 1;

    treatment.updateProgress();
    await treatment.save();

    return res.status(200).json({
      success: true,
      message: 'Medicine marked as taken',
      treatment
    });
  } catch (error) {
    console.error('Mark medicine as taken error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
};

// Add daily note
export const addDailyNote = async (req, res) => {
  try {
    const { treatmentId, message, condition, conditionNotes } = req.body;

    const treatment = await Treatment.findOne({
      _id: treatmentId,
      owner: req.user._id
    });

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayNote = treatment.dailyNotes.find(note => {
      const noteDate = new Date(note.date);
      noteDate.setHours(0, 0, 0, 0);
      return noteDate.getTime() === today.getTime();
    });

    if (!todayNote) {
      todayNote = {
        date: new Date(),
        notes: [],
        condition: condition || 'same',
        conditionNotes: conditionNotes || ''
      };
      treatment.dailyNotes.push(todayNote);
    }

    if (message) {
      todayNote.notes.push({
        message,
        timestamp: new Date()
      });
    }

    if (condition) {
      todayNote.condition = condition;
    }

    if (conditionNotes) {
      todayNote.conditionNotes = conditionNotes;
    }

    await treatment.save();

    return res.status(200).json({
      success: true,
      message: 'Note added successfully',
      dailyNote: todayNote
    });
  } catch (error) {
    console.error('Add daily note error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
};



export const UserReports = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id)
      .populate('reports');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const web2Reports = [];
    const web3Reports = [];

    user.reports.forEach(report => {
      const formattedReport = {
        _id: report._id,
        patientName: report.patientName,
        doctorName: report.doctorName,
        hospital: report.hospital,
        dateOfReport: report.dateOfReport,
        diagnosisSummary: report.diagnosisSummary,
        reasonOfCheckup: report.reasonOfCheckup,
        prescription: report.prescription,
        type: report.type,
        blockchainTxHash: report.blockchainTxHash,
        reportFileUrl: report.reportFileUrl,
      };

      if (report.type ==='web3') {
        web3Reports.push(formattedReport);
      } else {
        web2Reports.push(formattedReport);
      }
    });

    return res.json({
      userId : user._id,
      success: true,
      web2Reports,
      web3Reports,
    });
  } catch (err) {
    console.error('UserReports Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const UserReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const report = await HealthReport.findById(id)
      .populate('owner', 'name email walletAddress');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const reportFiles = [];
    const medicineListFiles = [];
    
    if (report.attachments && report.attachments.length > 0) {
      report.attachments.forEach(attachment => {
        if (attachment.fileName === 'Medicine List') {
          medicineListFiles.push({
            fileUrl: attachment.fileUrl,
            fileName: attachment.fileName,
            fileType: attachment.fileType
          });
        } else {
          reportFiles.push({
            fileUrl: attachment.fileUrl,
            fileName: attachment.fileName,
            fileType: attachment.fileType
          });
        }
      });
    }

    return res.json({
      success: true,
      report: {
        userId,
        _id: report._id,
        patientName: report.patientName,
        doctorName: report.doctorName,
        hospital: report.hospital,
        department: report.department,
        reportType: report.reportType,
        dateOfReport: report.dateOfReport,
        ageAtReport: report.ageAtReport,
        vitals: report.vitals,
        diagnosisSummary: report.diagnosisSummary,
        reasonOfCheckup: report.reasonOfCheckup,
        prescription: report.prescription,
        type: report.type,
        blockchainTxHash: report.blockchainTxHash,
        medicines: report.medicines,
        reportFiles: reportFiles, 
        medicineListFiles: medicineListFiles, 
        owner: {
          name: report.owner.name,
          email: report.owner.email,
          walletAddress: report.owner.walletAddress
        }
      }
    });
  } catch (err) {
    console.error('UserReport Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}




export const ReportMedicines = async (req, res) => {
  try {
    const {reportData} = req.body;


    if (!reportData) {
      return res.status(400).json({ success: false, message: 'OCR extracted text is missing in body.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEYN);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat();
    const prompt = `
    You are an expert medical assistant.
    
    Below is some text extracted from a doctor's prescription using OCR. 
    
    Your task is to extract a list of medicines from the text. For each medicine, return:
    
    - "name": the correct name of the medicine based on your knowledge  
    - "dose": dosage if mentioned (e.g., 1 tablet / 5ml syrup). If not mentioned, write "Not mentioned"  
    - "quantity ": quantity if mentioned (e.g., 9,6,12 tablets or 1 pack of 100ml syrup ). If not mentioned, write "Not mentioned"
    - "frequency": frequency if mentioned (e.g., 2/day). If not mentioned, write "Not mentioned"
    - "timing": timing if mentioned (e.g., ["Early Morning","Morning","Afternoon","Evening","Night"]). If not mentioned, return an empty array.
    
    Return the result as a JSON array in the following format:
    [
      {
        "name": "Paracetamol Tab",
        "dose": "1 tablet / 5 mL syrup ",
        "frequency": "2/day"
        "quantity": "6"
        "timing" : ["Early Morning","Morning","Afternoon","Evening","Night"] // empty array if not mentioned
      },
      ...
    ]
    
    ⚠️ Do not explain anything. Only return the JSON array. If no medicines are found, return an empty array.
    
    Text to process:
    """
    ${reportData}
    """
    `;



    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const rawText = response.text();
    let structuredData = rawText


    if (structuredData.startsWith("```")) {
        structuredData = structuredData.replace(/```json|```/g, "").trim();
    }

    structuredData = JSON.parse(structuredData)


    return res.json({
      success: true,
      summary: structuredData,
    });

  } catch (err) {
    console.error('UserReport Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};



export const ReportSummary = async (req, res) => {
  try {
    const reportId = req.query.reportId;

    if (!reportId) {
      return res.status(400).json({ success: false, message: 'Report Id is missing in body.' });
    }

    const report = await HealthReport.findById(reportId);

    if (!report) {
      return res.status(400).json({ success: false, message: 'Report not found' });
    }


    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEYN);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat();

const prompt = `
You are an expert medical assistant.

Below is some medicines from a doctor's prescription . 
Your task is:

🔹 For each correctly identified medicine, generate a structured explanation using your own knowledge.

The original text is **not reliable** for uses, side effects, dosage, etc. 
Only use it to find the medicine names. Everything else should come from your medical understanding.

Return a structured JSON array of objects. Each object should have:

- medicineName
- quantity (if available from the text, else "Not clearly mentioned")
- whyGiven (what condition it treats)
- uses
- bestWayToTake
- benefits
- sideEffects
- precautions
- anyOtherInfo (optional)

Do not explain the answer. Just return the JSON array. If no medicines are found, return an empty array.

Text to process:
"""
${report.medicines}
"""
`;



    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const rawText = response.text();
    let structuredData = rawText


    if (structuredData.startsWith("```")) {
        structuredData = structuredData.replace(/```json|```/g, "").trim();
    }

    structuredData = JSON.parse(structuredData)

    
    const hindiChat = model.startChat();

    for (let i = 0; i < structuredData.length; i++) {
      const med = structuredData[i];

      const hindiPrompt = `
तुम एक पेशेवर मेडिकल सहायक हो।

नीचे एक दवाई की जानकारी दी गई है। इसे पढ़कर उसके बारे में संक्षिप्त हिंदी में समझाओ जैसे डॉक्टर अपने मरीज़ को समझाते हैं।

दवाई की जानकारी:
"""
दवा का नाम: ${med.medicineName}
क्यों दी गई: ${med.whyGiven}
उपयोग: ${med.uses}
कैसे लेना है: ${med.bestWayToTake}
फायदे: ${med.benefits}
साइड इफेक्ट्स: ${med.sideEffects}
सावधानियाँ: ${med.precautions}
"""
हिंदी में सरल भाषा में 4-5 लाइन का संक्षेप में जवाब दो।
`;

      const hindiResult = await hindiChat.sendMessage(hindiPrompt);
      const hindiResponse = await hindiResult.response;
      const hindiText = await hindiResponse.text();

      structuredData[i].hindiSummary = hindiText.trim();
    }

    console.log("data : " , structuredData)

    return res.json({
      success: true,
      summary: structuredData,
    });

  } catch (err) {
    console.error('UserReport Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};






export const getCriticalData = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user basic info with populated references
    const user = await UserModel.findById(userId)
      .populate('medicalHistory')
      .populate('vitals')
      .populate('emergencyContacts')
      .populate({
        path: 'reports',
        options: { 
          sort: { dateOfReport: -1 }, // Get latest reports first
          limit: 3 // Only get last 3 reports for critical view
        }
      });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get latest vitals data
    const latestVitals = user.vitals ? {
      bloodPressure: user.vitals.bloodPressure?.[user.vitals.bloodPressure.length - 1] || null,
      bloodSugar: user.vitals.bloodSugar?.[user.vitals.bloodSugar.length - 1] || null,
      heartRate: user.vitals.heartRate?.[user.vitals.heartRate.length - 1] || null,
      cholesterol: user.vitals.cholesterol?.[user.vitals.cholesterol.length - 1] || null,
      bmi: user.vitals.bmi?.[user.vitals.bmi.length - 1] || null
    } : null;

    // Get latest weight and height
    const latestWeight = user.weightRecords?.[user.weightRecords.length - 1] || null;
    const latestHeight = user.heightRecords?.[user.heightRecords.length - 1] || null;

    // Decrypt medical history if exists
    let decryptedMedicalHistory = null;
    if (user.medicalHistory) {
      const med = user.medicalHistory;
      
      decryptedMedicalHistory = {
        allergies: med.allergiesEncrypted ? DecryptArrayField(med.allergiesEncrypted) : [],
        chronicConditions: med.chronicConditionsEncrypted ? DecryptArrayField(med.chronicConditionsEncrypted) : [],
        surgicalHistory: med.surgicalHistoryEncrypted ? DecryptArrayField(med.surgicalHistoryEncrypted) : [],
        immunizations: med.immunizationsEncrypted ? DecryptArrayField(med.immunizationsEncrypted) : []
      };
    }

    const allergies = decryptedMedicalHistory?.allergies || [];
    const chronicConditions = decryptedMedicalHistory?.chronicConditions || [];
    const surgicalHistory = decryptedMedicalHistory?.surgicalHistory || [];
    const immunizations = decryptedMedicalHistory?.immunizations || [];

    // Get current medications from latest report or chronic conditions
    const currentMedications = [];
    
    // From latest report
    if (user.reports && user.reports.length > 0) {
      const latestReport = user.reports[0];
      if (latestReport.medicines && latestReport.medicines.length > 0) {
        currentMedications.push(...latestReport.medicines);
      }
    }
    
    // From chronic conditions
    chronicConditions.forEach(condition => {
      if (condition.medicines && condition.medicines.length > 0) {
        currentMedications.push(...condition.medicines.map(med => ({
          ...med,
          condition: condition.conditionName
        })));
      }
    });

    // Prepare critical data response
    const criticalData = {
      // Basic Patient Info
      patientInfo: {
        name: user.name,
        age: user.dob ? Math.floor((new Date() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        phone: user.phone
      },

      // Emergency Contacts
      emergencyContacts: user.emergencyContacts || [],

      // Critical Medical Info
      allergies: allergies.map(allergy => ({
        allergen: allergy.allergen,
        type: allergy.type,
        severity: allergy.severity,
        reaction: allergy.reaction,
        emergencyMedication: allergy.emergencyMedication
      })),

      // Chronic Conditions
      chronicConditions: chronicConditions.map(condition => ({
        conditionName: condition.conditionName,
        severityLevel: condition.severityLevel,
        triggers: condition.triggers,
        precautions: condition.precautions,
        diagnosedOn: condition.diagnosedOn
      })),

      // Current Medications
      currentMedications: currentMedications,

      // Latest Vitals
      latestVitals,
      latestWeight,
      latestHeight,

      // Recent Medical History
      recentSurgeries: surgicalHistory
        .filter(surgery => surgery.date && new Date(surgery.date) > new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)) // Last 2 years
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3),

      // All surgical history (for complete view)
      surgicalHistory: surgicalHistory.sort((a, b) => new Date(b.date) - new Date(a.date)),

      // Immunizations (important for medical procedures)
      immunizations: immunizations.sort((a, b) => {
        // Sort by status priority: Overdue first, then by last date
        if (a.status === 'Overdue' && b.status !== 'Overdue') return -1;
        if (b.status === 'Overdue' && a.status !== 'Overdue') return 1;
        if (a.lastDate && b.lastDate) {
          return new Date(b.lastDate) - new Date(a.lastDate);
        }
        return 0;
      }),

      // Recent Reports
      recentReports: user.reports?.slice(0, 3).map(report => ({
        _id: report._id,
        reportType: report.reportType,
        department: report.department,
        doctorName: report.doctorName,
        hospital: report.hospital,
        diagnosisSummary: report.diagnosisSummary,
        dateOfReport: report.dateOfReport,
        vitals: report.vitals
      })) || [],

      // Emergency Status
      emergencyEnabled: user.emergencyEnabled,
      
      // Timestamp
      accessedAt: new Date()
    };

    res.status(200).json({
      success: true,
      data: criticalData,
      message: 'Critical data retrieved successfully'
    });

  } catch (error) {
    console.error('Error retrieving critical data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const PleaseHelp = async (req, res) => {
  try {
   const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
   const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER; 
   const twilioPhone = process.env.TWILIO_PHONE_NUMBER;


    const user = req.user;
    const { latitude, longitude, timestamp } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Location coordinates are required",
      });
    }

    const emergencyMessage = `🚨 EMERGENCY ALERT!
    
${user.name || "User"} may need immediate assistance!

🕐 Time: ${new Date(timestamp || Date.now()).toLocaleString()}
📍 Location: https://maps.google.com/?q=${latitude},${longitude}
📱 Coordinates: ${latitude}, ${longitude}

This is an automatic accident detection alert. Please check on them immediately and call emergency services if needed.

- MediCare Emergency System`;

    // // Fetch all emergency contacts of user
    // const contacts = await EmergencyContact.find({ owner: user._id });

    // if (!contacts || contacts.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "No emergency contacts configured",
    //   });
    // }

    const results = [];

    // // normalize number => +91XXXXXXXXXX (remove spaces/dashes)
    // const normalizePhone = (phone) =>
    //   phone.replace(/\D/g, "").replace(/^91/, "+91").replace(/^0/, "+91");

    // for (const contact of contacts) {
    //   const phone = normalizePhone(contact.phone);

      // ✅ SMS

      const phone = "+918957553773"
      try {
        const sms = await client.messages.create({
          body: emergencyMessage,
          from: "+13185344281",
          to: "+918957553773",
        });
        results.push({
          contact: phone,
          type: "SMS",
          status: "sent",
          sid: sms.sid,
        });
      } catch (error) {
        results.push({
          contact: phone,
          type: "SMS",
          status: "failed",
          error: error.message,
        });
      }

      // ✅ WhatsApp
      try {
        const whatsapp = await client.messages.create({
          body: emergencyMessage,
          from: twilioWhatsApp.startsWith("whatsapp:")
            ? twilioWhatsApp
            : `whatsapp:${twilioWhatsApp}`,
          to: `whatsapp:${phone}`,
        });
        results.push({
          contact: phone,
          type: "WhatsApp",
          status: "sent",
          sid: whatsapp.sid,
        });
      } catch (error) {
        results.push({
          contact: phone,
          type: "WhatsApp",
          status: "failed",
          error: error.message,
        });
      }

      // ✅ Voice Call
      try {
        const call = await client.calls.create({
          twiml: `<Response>
            <Say voice="alice" rate="slow">
              Emergency Alert! ${user.name || "A user"} may need immediate assistance.
              They were detected in a possible accident at ${new Date(
                timestamp || Date.now()
              ).toLocaleString()}.
              Please check on them immediately. 
              Their location coordinates are ${latitude}, ${longitude}.
              You can find them on Google Maps by searching these coordinates.
              This message will repeat.
            </Say>
          </Response>`,
          from: "+13185344281",
          to: "+918957553773",
        });
        results.push({
          contact: phone,
          type: "Call",
          status: "initiated",
          sid: call.sid,
        });
      } catch (error) {
        results.push({
          contact: phone,
          type: "Call",
          status: "failed",
          error: error.message,
        });
      }
    

    // Final response
    res.status(200).json({
      success: true,
      message: "Emergency alerts sent to all contacts",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      location: {
        latitude,
        longitude,
        timestamp: timestamp || new Date().toISOString(),
      },
      notifications: results,
    });
  } catch (error) {
    console.error("Emergency alert error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send emergency alert",
      error: error.message,
    });
  }
};
