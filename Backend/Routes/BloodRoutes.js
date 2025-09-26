import express from 'express';
import {
  getCommunityStats,
  getAllBloodRequests,
  getMyBloodRequests,
  createBloodRequest,
  updateBloodRequest,
  respondToBloodRequest,
  addDonorDetails,
  getBloodRequestById,
  cancelBloodRequest,
  updateRequestStatus,
  getCommunityFeed, // New endpoint
  getRecentDonations // New endpoint
} from '../Controllers/BloodControllers.js';
import { VerifyDoctor, VerifyToken } from '../Middleware/Verify.js';
import { uploadDonorPhoto } from "../Middleware/Multer.js";

const router = express.Router();

router.get('/community/stats', VerifyToken, getCommunityStats);
router.get('/community/feed', VerifyToken, getCommunityFeed); // New route
router.get('/community/donations', VerifyToken, getRecentDonations); // New route
router.get('/requests/all', VerifyToken, getAllBloodRequests);
router.get('/requests/my', VerifyToken, VerifyDoctor, getMyBloodRequests);
router.get('/requests/:id', VerifyToken, getBloodRequestById);
router.post('/requests/create', VerifyToken, VerifyDoctor, createBloodRequest);
router.put('/requests/:id', VerifyToken, VerifyDoctor, updateBloodRequest);
router.put('/requests/:id/status', VerifyToken, VerifyDoctor, updateRequestStatus);
router.delete('/requests/:id', VerifyToken, VerifyDoctor, cancelBloodRequest);
router.post('/requests/:id/respond', VerifyToken, respondToBloodRequest);
router.post('/donations/add', VerifyToken, VerifyDoctor, uploadDonorPhoto, addDonorDetails);

export default router;
