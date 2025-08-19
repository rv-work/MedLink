import express from 'express';
import { askQuestion, getInternetAnswer, clearHistory } from '../Controllers/MedChatController.js';
import rateLimiter from '../Middleware/RateLimiter.js';

const medChatRouter = express.Router();

medChatRouter.use(rateLimiter);

medChatRouter.post('/ask', askQuestion);

medChatRouter.post('/internet-answer', getInternetAnswer);

medChatRouter.delete('/clear-history/:sessionId', clearHistory);

export default medChatRouter;
