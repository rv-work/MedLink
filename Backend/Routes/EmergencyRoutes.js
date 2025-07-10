import express from 'express';
import { Emergency } from '../Controllers/EmergencyController.js';

const emergencyRouter = express.Router();

emergencyRouter.post('/face', Emergency);


export default emergencyRouter;
