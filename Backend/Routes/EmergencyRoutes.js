import express from 'express';
import { AddFace, approveEmergency, checkApprovalStatus, Emergency, rejectEmergency, sendEmergencyAlert } from '../Controllers/EmergencyController.js';
import uploadEmergency, { uploadPhotoFile } from '../Middleware/Multer.js';
import { VerifyToken } from '../Middleware/Verify.js';


// Middleware for basic validation (optional - add authentication as needed)
const validateEmergencyRequest = (req, res, next) => {
  const { hospitalName, situation, coordinates } = req.body;
  
  if (!hospitalName || !situation || !coordinates) {
    return res.status(400).json({
      error: 'Missing required fields: hospitalName, situation, and coordinates are required'
    });
  }
  
  // if (!coordinates.latitude || !coordinates.longitude) {
  //   return res.status(400).json({
  //     error: 'Invalid coordinates: latitude and longitude are required'
  //   });
  // }
  
  next();
};

const emergencyRouter = express.Router();


emergencyRouter.post('/add-face', VerifyToken ,  uploadEmergency.single('face') ,  AddFace);
emergencyRouter.post('/match-face',  uploadEmergency.single('image') , Emergency);



emergencyRouter.post('/send-alert/:id',  uploadPhotoFile.single('photo'), validateEmergencyRequest, sendEmergencyAlert);
emergencyRouter.get('/check-approval/:emergencyId', checkApprovalStatus);
emergencyRouter.get('/approve/:emergencyId', approveEmergency);
emergencyRouter.get('/reject/:emergencyId', rejectEmergency);



// router.post('/approve/:emergencyId', async (req, res) => {
//   req.query.approvedBy = req.body.approvedBy;
//   approveEmergency(req, res);
// });


// router.post('/reject/:emergencyId', async (req, res) => {
//   req.query.rejectedBy = req.body.rejectedBy;
//   rejectEmergency(req, res);
// });


export default emergencyRouter;
