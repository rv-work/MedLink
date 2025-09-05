// POST /api/doctor/:doctorId/summary/:summaryId/message


import express from 'express';
import { VerifyDoctor, VerifyToken } from '../Middleware/Verify.js';
import { registerDoctor  , checkMedId, DoctorDashboard, TreatmentDetail, AllTreatments, PostSummaryMessage, CheckDoctor } from '../Controllers/DoctorController.js';


const doctorRouter = express.Router();


doctorRouter.post("/check-medid", checkMedId);
doctorRouter.post("/register", VerifyToken, registerDoctor);
doctorRouter.get("/get-dashboard/", VerifyToken, VerifyDoctor, DoctorDashboard);
doctorRouter.get("/get-treatments", VerifyToken, VerifyDoctor, AllTreatments);
doctorRouter.get("/get-treatment-detail/:treatmentId", VerifyToken, VerifyDoctor, TreatmentDetail);
doctorRouter.post("/summary/:summaryId/", VerifyToken, VerifyDoctor, PostSummaryMessage);
doctorRouter.post("/isavailable", CheckDoctor);


export default doctorRouter;
