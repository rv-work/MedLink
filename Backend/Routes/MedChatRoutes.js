import express from 'express';
import {
  askQuestion,
  getInternetAnswer,
  clearHistory,
  getInternetOnly,
  getBookOnly,
  getAllCombined,
  getAllCombinedInternet,
  getMLDiagnosis,

} from '../Controllers/MedChatController.js';
// import rateLimiter from '../Middleware/RateLimiter.js';

const medChatRouter = express.Router();

// medChatRouter.use(rateLimiter);

// Existing routes
medChatRouter.post('/ask', askQuestion);
medChatRouter.post('/internet-answer', getInternetAnswer);
medChatRouter.delete('/clear-history/:sessionId', clearHistory);

// Mode-specific routes
medChatRouter.post('/internet-only', getInternetOnly);
medChatRouter.post('/book-only', getBookOnly);
medChatRouter.post('/all-combined', getAllCombined);
medChatRouter.post('/all-combined-internet', getAllCombinedInternet);
medChatRouter.post('/ml-diagnosis', getMLDiagnosis); 

// Health check routes
// medChatRouter.get('/health', checkMLServiceHealth);

export default medChatRouter;
