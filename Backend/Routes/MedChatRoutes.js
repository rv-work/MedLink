import express from 'express';
import { 
  askQuestion, 
  getInternetAnswer, 
  clearHistory,
  getInternetOnly,
  getBookOnly,
  getAllCombined,
  getAllCombinedInternet, // NEW IMPORT
  getMLDiagnosis
} from '../Controllers/MedChatController.js';
import rateLimiter from '../Middleware/RateLimiter.js';

const medChatRouter = express.Router();

medChatRouter.use(rateLimiter);

// Existing routes
medChatRouter.post('/ask', askQuestion);
medChatRouter.post('/internet-answer', getInternetAnswer);
medChatRouter.delete('/clear-history/:sessionId', clearHistory);

// New mode-specific routes
medChatRouter.post('/internet-only', getInternetOnly);
medChatRouter.post('/book-only', getBookOnly);
medChatRouter.post('/all-combined', getAllCombined);
medChatRouter.post('/all-combined-internet', getAllCombinedInternet); // NEW ROUTE
medChatRouter.post('/ml-diagnosis', getMLDiagnosis);

export default medChatRouter;
