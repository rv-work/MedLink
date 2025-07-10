import HealthReport from '../Models/HealthReport.js';
import { UserModel } from '../Models/UserModel.js';
import { DecryptArrayField } from '../Utils/Encrypt.js';




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

export const UploadUserReport =async (req , res) => {
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

    const newReport = new HealthReport({
      owner : req.user._id,
      patientName,
      doctorName,
      hospital,
      diagnosisSummary,
      reasonOfCheckup,
      prescription,
      dateOfReport,
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
    } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login to upload report"
      });
    }

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

    const newReport = new HealthReport({
      owner: req.user._id,
      patientName,
      doctorName,
      hospital,
      diagnosisSummary,
      reasonOfCheckup,
      prescription,
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
























