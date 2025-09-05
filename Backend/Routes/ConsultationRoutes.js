import express from 'express';
import { 
  createConsultationRequest,
  getConsultationRequests,
  acceptConsultationRequest,
  getConsultationById,
  updateConsultationStatus,
  getPatientConsultations,
  getDoctorConsultations
} from '../Controllers/ConsultationController.js';
import { VerifyToken } from '../Middleware/Verify.js';

const router = express.Router();

// Patient routes
router.post('/create', VerifyToken, createConsultationRequest);
router.get('/patient/my-consultations', VerifyToken, getPatientConsultations);
router.get('/:id', VerifyToken, getConsultationById);

// Doctor routes
router.get('/doctor/requests', VerifyToken, getConsultationRequests);
router.get('/doctor/my-consultations', VerifyToken, getDoctorConsultations);
router.put('/:id/accept', VerifyToken, acceptConsultationRequest);
router.put('/:id/status', VerifyToken, updateConsultationStatus);

export default router;