import express from 'express';
import { UserDashboard, UploadUserReport  , UpdateUserReport, UploadUserReportWeb2, UserReports, UserReport} from '../Controllers/UserController.js';
import { VerifyToken } from '../Middleware/Verify.js';
import { uploadReportFile } from '../Middleware/Multer.js';

const userRouter = express.Router();

userRouter.get('/dashboard', VerifyToken, UserDashboard);
userRouter.post('/upload-report', VerifyToken, UploadUserReport);
userRouter.post('/upload-report-web2', VerifyToken, uploadReportFile.single('file'), UploadUserReportWeb2);
userRouter.put('/reports/:reportId/blockchain', VerifyToken, UpdateUserReport);
userRouter.get('/reports', VerifyToken, UserReports);
userRouter.get('/reports/:id', VerifyToken, UserReport);

export default userRouter;
