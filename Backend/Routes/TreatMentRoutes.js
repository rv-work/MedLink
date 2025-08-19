import express from 'express';
import { addDailyNote, getActiveTreatments, markMedicineAsTaken } from '../Controllers/UserController.js';
import { VerifyToken } from '../Middleware/Verify.js';





const treatMentRouter = express.Router();

treatMentRouter.get('/active', VerifyToken ,  getActiveTreatments);

treatMentRouter.put('/mark-taken',  VerifyToken , markMedicineAsTaken);

treatMentRouter.post('/add-note',  VerifyToken , addDailyNote);

export default treatMentRouter;
