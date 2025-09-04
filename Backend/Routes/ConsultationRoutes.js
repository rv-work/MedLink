// Routes/ConsultationRoutes.js - Add new routes
import express from 'express';
import {
  createConsultationRequest,
  getPendingRequests,
  acceptConsultationRequest,
  getUserConsultationRequests,
  getActiveConsultation,
  updateConsultationStatus,
  getPatientPendingRequest,
  getConsultationById,
  cancelConsultationRequest
} from '../Controllers/ConsultationController.js';
import { VerifyToken } from '../Middleware/Verify.js';

const ConsultationRoutes = express.Router();

ConsultationRoutes.post('/create', VerifyToken, createConsultationRequest);
ConsultationRoutes.get('/my-requests', VerifyToken, getUserConsultationRequests);
ConsultationRoutes.get('/my-pending', VerifyToken, getPatientPendingRequest);
ConsultationRoutes.put('/cancel/:requestId', VerifyToken, cancelConsultationRequest);

ConsultationRoutes.get('/pending', VerifyToken, getPendingRequests);
ConsultationRoutes.put('/accept/:requestId', VerifyToken, acceptConsultationRequest);

ConsultationRoutes.get('/active', VerifyToken, getActiveConsultation);
ConsultationRoutes.get('/:consultationId', VerifyToken, getConsultationById);
ConsultationRoutes.put('/status/:requestId', VerifyToken, updateConsultationStatus);

export default ConsultationRoutes;
