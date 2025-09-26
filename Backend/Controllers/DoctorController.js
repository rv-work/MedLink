import { Doctor , TreatmentSummary } from "../Models/Doctor.js";
import Treatment from "../Models/Treatment.js";

export const addDoctorMessage = async (req, res) => {
  const { summaryId } = req.params;
  const { message } = req.body;

  const summary = await TreatmentSummary.findById(summaryId);
  if (!summary) return res.status(404).json({ error: "Summary not found" });

  summary.doctorMessage = message;
  await summary.save();

  res.json(summary);
};


export const checkMedId = async (req, res) => {
  try {
    const { doctorMedlinkId } = req.body;

    if (!doctorMedlinkId) {
      return res.status(400).json({ available: false, message: "Medlink ID required" });
    }

    const existing = await Doctor.findOne({ doctorMedlinkId });

    if (existing) {
      return res.json({ available: false, message: "Medlink ID not available ❌" });
    }

    return res.json({ available: true, message: "Medlink ID available ✅" });
  } catch (error) {
    return res.status(500).json({ available: false, message: "Server error", error });
  }
};

export const registerDoctor = async (req, res) => {
  try {
    const user = req.user; 
    const { specialization, hospital, experienceYears, contact, doctorMedlinkId } = req.body;

    const existing = await Doctor.findOne({ doctorMedlinkId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Medlink ID already in use ❌" });
    }

    const doctor = new Doctor({
      user: user._id,
      specialization,
      hospital,
      experienceYears,
      contact,
      doctorMedlinkId,
    });

    await doctor.save();

    user.isDoctor = true;
    await user.save(); 

    return res.json({ success: true, message: "Doctor registered successfully ✅", doctor });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error });
  }
};





export const DoctorDashboard = async (req, res) => {
  try {
    const user = req.user;
    const doctor = req.doctor;

    const activeTreatments = await Treatment.find({
      doctor: doctor._id,
      status: 'active'
    })
    .populate('owner', 'name email')
    .populate('healthReportId')
    .sort({ createdAt: -1 });

    const totalTreatments = await Treatment.countDocuments({ doctor: doctor._id });
    const completedTreatments = await Treatment.countDocuments({ 
      doctor: doctor._id, 
      status: 'completed' 
    });
    
    const recentSummaries = await TreatmentSummary.find({
      doctor: doctor._id
    })
    .populate('treatment', 'patientName')
    .sort({ createdAt: -1 })
    .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        doctor: {
          name: doctor.user?.name,
          specialization: doctor.specialization,
          hospital: doctor.hospital,
          experienceYears: doctor.experienceYears
        },
        stats: {
          activeTreatments: activeTreatments.length,
          totalTreatments,
          completedTreatments
        },
        activeTreatments,
        recentSummaries
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const AllTreatments = async (req, res) => {
  try {
    const user = req.user;
    const doctor = req.doctor;
    
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { doctor: doctor._id };
    if (status) {
      query.status = status;
    }

    const treatments = await Treatment.find(query)
      .populate('owner', 'name email')
      .populate('healthReportId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Treatment.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        treatments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('All treatments error:', error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const TreatmentDetail = async (req, res) => {
  try {
    const user = req.user;
    const doctor = req.doctor;
    const { treatmentId } = req.params;

    const treatment = await Treatment.findOne({
      _id: treatmentId,
      doctor: doctor._id
    })
    .populate('owner', 'name email phone')
    .populate('healthReportId')
    .populate({
      path: 'summaries',
      populate: {
        path: 'doctor',
        select: 'specialization hospital'
      },
      options: { sort: { createdAt: -1 } }
    });

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: "Treatment not found or you don't have access to it"
      });
    }

    // Get all summaries for this treatment
    const summaries = await TreatmentSummary.find({
      treatment: treatmentId
    })
    .populate('doctor', 'specialization hospital')
    .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        treatment,
        summaries
      }
    });

  } catch (error) {
    console.error('Treatment detail error:', error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const PostSummaryMessage = async (req, res) => {
  try {
    const user = req.user;
    const doctor = req.doctor;
    const { summaryId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    // Find the summary and verify it belongs to a treatment this doctor manages
    const summary = await TreatmentSummary.findById(summaryId)
      .populate({
        path: 'treatment',
        match: { doctor: doctor._id }
      });

    if (!summary || !summary.treatment) {
      return res.status(404).json({
        success: false,
        message: "Summary not found or you don't have access to it"
      });
    }

    // Update the summary with doctor's message
    summary.doctorMessage = message.trim();
    await summary.save();

    return res.status(200).json({
      success: true,
      message: "Message posted successfully",
      data: summary
    });

  } catch (error) {
    console.error('Post summary message error:', error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


export const CheckDoctor = async (req, res) => {
  try {
    const { doctorMedlinkId } = req.body;

    if (!doctorMedlinkId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required"
      });
    }

    const doctor = await Doctor.findOne({ doctorMedlinkId })
      .populate('user', 'name email');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "No doctor found with this ID"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor found",
      data: {
        doctorId: doctor.doctorMedlinkId,
        doctorName: doctor.user.name,
        specialization: doctor.specialization,
        hospital: doctor.hospital
      }
    });

  } catch (error) {
    console.error("Error checking doctor:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while checking doctor"
    });
  }
};
