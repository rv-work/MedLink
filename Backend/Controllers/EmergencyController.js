import {
  UserModel,
} from '../Models/UserModel.js'
import axios from "axios";
import { EmergencyModel } from '../Models/Emergency.js';
import twilio from "twilio";

import dotenv from "dotenv"

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER; 
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;





export const AddFace = async (req , res) => {
    const img = req.file;
    const userId = req.user._id;

    const user = await UserModel.findById(userId);


 try {
    const response = await axios.post("https://medlink-face.onrender.com/signup", {
      userId,
      image: img.buffer.toString("base64"), 
    });


    if (response.data.status === "success") {
      user.emergencyEnabled = true;
      await user.save();
      return res.status(200).json({ status: "success", userName: req.user.name });
    } else {
      return res.status(500).json({ status: "error", message: "Face not processed" });
    }
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};



export const Emergency = async (req, res) => {
  const img = req.file;

  try {
    const response = await axios.post("https://medlink-face.onrender.com/emergency", {
      image: img.buffer.toString("base64"),
    });

    const { matches } = response.data;

    console.log("match : " , matches)

    if (!matches || matches.length === 0) {
      return res.status(404).json({ status: "error", message: "No matches found" });
    }

    const userIdsInOrder = matches.map((m) => m.userId);

    const usersFromDb = await UserModel.find({
      _id: { $in: userIdsInOrder },
    }).select("name profilePicture");

    const userMap = {};
    usersFromDb.forEach((user) => {
      userMap[user._id.toString()] = user;
    });


    const finalResults = matches.map((m) => ({
      userId: m.userId,
      name: userMap[m.userId]?.name || "Unknown",
      profilePicture: userMap[m.userId]?.profilePicture || null,
      score: m.score,
    }));

    return res.status(200).json({
      success: true,
      matches: finalResults,
    });

  } catch (err) {
    console.error("Emergency error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};



export const sendEmergencyAlert = async (req, res) => {
  try {
    const { id: patientId } = req.params;
    const pic = req.file;
    const {
      hospitalName,
      address,
      situation,
      description,
      coordinates,
      patientName,
      doctorName,
    } = req.body;

    const user = await UserModel.findById(patientId);
    if (!user) return res.status(404).json({ error: "Patient not found" });

    const emergency = new EmergencyModel({
      patientId,
      doctorName,
      patientName,
      hospitalName,
      address: address || "",
      coordinates,
      situation,
      description: description || "",
      photo: pic?.path || null,
      status: "pending",
    });

    console.log("cords : " , coordinates)

    await emergency.save();

    const baseUrl = "https://medlink-bh5c.onrender.com";
    const approvalLink = `${baseUrl}/api/emergency/approve/${emergency._id}`;
    const rejectionLink = `${baseUrl}/api/emergency/reject/${emergency._id}`;
    const situationText = situation.replace("_", " ").toUpperCase();
    const locationUrl = `https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`;

    const messageBodyWh = `🚨 EMERGENCY ALERT 🚨

Patient ${patientName} needs immediate medical assistance!

📍 SITUATION: ${situationText}
🏥 HOSPITAL: ${hospitalName}
📍 ADDRESS: ${address || "Not provided"}
📝 DETAILS: ${description || "No additional details"}
👨‍⚕️ DOCTOR: ${doctorName} (Verified)

📍 LOCATION: ${locationUrl}

⚡ URGENT: Please respond immediately
✅ APPROVE ACCESS: ${approvalLink}
❌ DENY ACCESS: ${rejectionLink}`;


    const messageBodySMS = `........... EMERGENCY ALERT .................

Patient ${patientName} needs immediate medical assistance!

 -> SITUATION: ${situationText}
 -> HOSPITAL: ${hospitalName}
 -> ADDRESS: ${address || "Not provided"}
 -> DETAILS: ${description || "No additional details"}
 -> DOCTOR: ${doctorName} (Verified)

 -> LOCATION: ${locationUrl}

 -> URGENT: Please respond immediately
 -> APPROVE ACCESS: ${approvalLink}
 -> DENY ACCESS: ${rejectionLink}`;


    let phoneNumber = "8957553773".trim();
    if (!phoneNumber.startsWith("+")) phoneNumber = "+91" + phoneNumber;

    const messagePromises = [
      // SMS
      client.messages.create({
        body: messageBodySMS,
        from: "+13185344281",
        to: "+918957553773",
      }),
    ];

    // WhatsApp
    if (twilioWhatsApp) {
      messagePromises.push(
        client.messages.create({
          body: messageBodyWh,
          from: `${twilioWhatsApp}`,
          to: `whatsapp:${phoneNumber}`,
        })
      );
    }

    // Voice Call
    messagePromises.push(
      client.calls.create({
        twiml: `<Response>
                  <Say voice="alice">Emergency alert for ${patientName}. 
                  They need immediate medical assistance at ${hospitalName}. 
                  Situation: ${situationText}. 
                  Please check your messages for more details and respond immediately.
                  Repeat: This is an emergency alert for ${patientName}.
                  </Say>
                </Response>`,
        from: "+13185344281",
        to: "+918957553773",
      })
    );

    const results = await Promise.allSettled(messagePromises);
    results.forEach((r, i) => {
      if (r.status === "rejected") console.error("Failed alert #", i, r.reason);
    });

    res.status(200).json({
      success: true,
      message: "Emergency alert sent successfully",
      emergencyId: emergency._id,
    });
  } catch (error) {
    console.error("Error sending emergency alert:", error);
    res.status(500).json({ error: "Failed to send emergency alert" });
  }
};





export const checkApprovalStatus = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const emergency = await EmergencyModel.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ error: "Emergency not found" });
    }

    res.status(200).json({
      status: emergency.status,
      approvedBy: emergency.approvedBy,
      rejectedBy: emergency.rejectedBy,
      updatedAt: emergency.updatedAt,
    });
  } catch (error) {
    console.error("Error checking approval status:", error);
    res.status(500).json({ error: "Failed to check approval status" });
  }
};




export const approveEmergency = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { approvedBy } = req.query;

    const emergency = await EmergencyModel.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ error: "Emergency not found" });
    }

    if (emergency.status !== "pending") {
      return res.status(400).json({ error: "Emergency already processed" });
    }

    emergency.status = "approved";
    emergency.approvedBy = approvedBy || "Emergency Contact";
    await emergency.save();

    console.log("Emergency approved:", emergency._id);

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Emergency Approved</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: green;">✅ Emergency Approved</h1>
        <p>Patient: ${emergency.patientName}</p>
        <p>Hospital: ${emergency.hospitalName}</p>
        <p>Status: ACCESS GRANTED</p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error approving emergency:", error);
    res.status(500).send("Failed to approve emergency");
  }
};




export const rejectEmergency = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { rejectedBy } = req.query;

    const emergency = await EmergencyModel.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ error: "Emergency not found" });
    }

    if (emergency.status !== "pending") {
      return res.status(400).json({ error: "Emergency already processed" });
    }

    emergency.status = "rejected";
    emergency.rejectedBy = rejectedBy || "Emergency Contact";
    await emergency.save();

    console.log("Emergency rejected:", emergency._id);

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Emergency Rejected</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: red;">❌ Emergency Rejected</h1>
        <p>Patient: ${emergency.patientName}</p>
        <p>Hospital: ${emergency.hospitalName}</p>
        <p>Status: ACCESS DENIED</p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error rejecting emergency:", error);
    res.status(500).send("Failed to reject emergency");
  }
};







































































// export const EmergencyPhotoMatch = async (req, res) => {
//   try {
//     const emergencyImage = req.file; 
//     const users = await UserModel.find(); 

//     const emergencyImagePath = emergencyImage.path;

//     const matchPromises = users.map(async (user) => {
//       try {
//         const form = new FormData();

//         form.append("image1", fs.createReadStream(emergencyImagePath), {
//           filename: emergencyImage.originalname,
//         });

//         const cloudImageResponse = await axios.get(user.imageUrl, {
//           responseType: "stream",
//         });

//         form.append("image2", cloudImageResponse.data, {
//           filename: "cloud.jpg",
//         });

//         const response = await axios.post(
//           "https://medlink-bh5c.onrender.com/api/verify-face",
//           form,
//           { headers: form.getHeaders() }
//         );

//         const { matched, score } = response.data;

//         return matched
//           ? { user, score }
//           : null;
//       } catch (err) {
//         console.error(`Error comparing with user ${user.name}:`, err.message);
//         return null;
//       }
//     });

//     const matchResults = await Promise.all(matchPromises);

//     const topMatches = matchResults
//       .filter(Boolean)
//       .sort((a, b) => a.score - b.score)
//       .slice(0, 10)
//       .map((result) => ({
//         name: result.user.name,
//         email: result.user.email,
//         score: result.score,
//       }));

//     if (topMatches.length === 0) {
//       return res.json({ success: false, message: "No match found" });
//     }

//     return res.json({ success: true, topMatches });

//   } catch (err) {
//     console.error("EmergencyPhotoMatch Error:", err);
//     res.status(500).json({ success: false, error: "Internal server error" });
//   }
// };








// from qdrant_client import QdrantClient

// qdrant_client = QdrantClient(
//     url="https://4a0d9e8d-2682-4c00-a63e-93fc4c2477e6.europe-west3-0.gcp.cloud.qdrant.io:6333", 
//     api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.hpmg8p-hGp423-hxr2J33KFTJJ4cx6_0Il99PdUJ3VM",
// )

// print(qdrant_client.get_collections())



// import {QdrantClient} from '@qdrant/js-client-rest';

// const client = new QdrantClient({
//     url: 'https://4a0d9e8d-2682-4c00-a63e-93fc4c2477e6.europe-west3-0.gcp.cloud.qdrant.io:6333',
//     apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.hpmg8p-hGp423-hxr2J33KFTJJ4cx6_0Il99PdUJ3VM',
// });

// try {
//     const result = await client.getCollections();
//     console.log('List of collections:', result.collections);
// } catch (err) {
//     console.error('Could not get collections:', err);
// }


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.hpmg8p-hGp423-hxr2J33KFTJJ4cx6_0Il99PdUJ3VM