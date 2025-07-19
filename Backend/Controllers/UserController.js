import mongoose from 'mongoose';
import HealthReport from '../Models/HealthReport.js';
import { UserModel } from '../Models/UserModel.js';
import { DecryptArrayField } from '../Utils/Encrypt.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();





export const UserDashboard = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id)
      .populate('medicalHistory')
      .populate('lifestyle')
      .populate('vitals')
      .populate('emergencyContact');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.medicalHistory) {
      const med = user.medicalHistory;

      med.chronicConditions = DecryptArrayField(med.chronicConditions[0] || []);
      med.medications = DecryptArrayField(med.medications[0] || []);
      med.surgeries = DecryptArrayField(med.surgeries[0] || []);
      med.familyHistory = DecryptArrayField(med.familyHistory[0] || []);
    }



    return res.json(user);
  } catch (err) {
    console.error('UserDashboard Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const UploadUserReportWeb3 =async (req , res) => {
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
      medicines ,
    } = req.body;

    if(!address){
      return res.json({success : true ,  msg : "Address Not Found Please Login Through Your MetaMask"})
    }

    const acc = await UserModel.findOne({
      walletAddress :address
    })

    if(!acc) {
      return res.json({success : true ,  msg : "Address Not Matched With Registered Address"})
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

    const newReport = new HealthReport({
      owner : req.user._id,
      patientName,
      doctorName,
      hospital,
      diagnosisSummary,
      reasonOfCheckup,
      prescription,
      dateOfReport,
      medicines : parsedMedicines , 
      blockchainTxHash: "pending", 
      type: "web3", 
      reportFileUrl: "Not Availble", 
      reportFilePublicId: "Not Availble",
    });

    const savedReport = await newReport.save();


    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      { $push: { reports: savedReport._id } },
      {new : true}
    );


    return res.status(201).json({ message: "Report uploaded", userId : updatedUser._id , reportId:  savedReport._id });
} catch (err) {
    console.error('UploadUserReport Error:', err);
    return res.status(500).json({ success :false ,  message: 'Server error' });
  }

};



export const UpdateUserReport =async (req , res) => {
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
      medicines
    } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login to upload report"
      });
    }

    console.log("med : " , medicines)

    if (!patientName || !doctorName || !hospital || !diagnosisSummary || !reasonOfCheckup || !prescription || !dateOfReport) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a report file"
      });
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


    const newReport = new HealthReport({
      owner: req.user._id,
      patientName,
      doctorName,
      hospital,
      diagnosisSummary,
      reasonOfCheckup,
      prescription,
      medicines : parsedMedicines ,
      dateOfReport: new Date(dateOfReport),
      reportFileUrl: req.file.path, 
      reportFilePublicId: req.file.filename,
      type: "web2",
      blockchainTxHash: "Not Availble"
    });

    const savedReport = await newReport.save();

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      { $push: { reports: savedReport._id } },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Report uploaded successfully",
      userId: updatedUser._id,
      reportId: savedReport._id,
      data: {
        reportId: savedReport._id,
        patientName: savedReport.patientName,
        doctorName: savedReport.doctorName,
        hospital: savedReport.hospital,
        dateOfReport: savedReport.dateOfReport,
        uploadedAt: savedReport.createdAt,
        fileUrl: savedReport.fileUrl
      }
    });

  } catch (err) {
    console.error('UploadUserReportWeb2 Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred while uploading report'
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


export const UserReport = async (req , res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const report = await HealthReport.findById(id)
      .populate('owner', 'name email walletAddress');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    return res.json({
      success: true,
      report: {
        userId ,
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
        medicines: report.medicines,
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const chat = model.startChat();
    const prompt = `
    You are an expert medical assistant.
    
    Below is some text extracted from a doctor's prescription using OCR. 
    
    Your task is to extract a list of medicines from the text. For each medicine, return:
    
    - "name": the correct name of the medicine based on your knowledge  
    - "dose": dosage if mentioned (e.g., 1 tablet / 5ml syrup). If not mentioned, write "Not mentioned"  
    - "quantity ": quantity if mentioned (e.g., 9,6,12 tablets or 1 pack of 100ml syrup ). If not mentioned, write "Not mentioned"
    - "frequency": frequency if mentioned (e.g., 2/day). If not mentioned, write "Not mentioned"
    - "timing": timing if mentioned (e.g., ["morning", "afternoon", "evening", "night"]). If not mentioned, return an empty array.
    
    Return the result as a JSON array in the following format:
    [
      {
        "name": "Paracetamol Tab",
        "dose": "1 tablet / 5 mL syrup ",
        "frequency": "2/day"
        "quantity": "6"
        "timing" : ["morning" , "afternoon", "evening" , "night"] // empty array if not mentioned
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


    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

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