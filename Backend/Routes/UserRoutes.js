import express from 'express';
import { UserDashboard  , UpdateUserReport, UploadUserReportWeb2, UserReports, UserReport, ReportSummary, ReportMedicines, UploadUserReportWeb3} from '../Controllers/UserController.js';
import { VerifyToken } from '../Middleware/Verify.js';
import { uploadReportFile } from '../Middleware/Multer.js';

const userRouter = express.Router();

userRouter.get('/dashboard', VerifyToken, UserDashboard);
userRouter.post('/upload-report', VerifyToken, UploadUserReportWeb3);
userRouter.post('/upload-report-web2', VerifyToken, uploadReportFile.single('file'), UploadUserReportWeb2);
userRouter.put('/reports/:reportId/blockchain', VerifyToken, UpdateUserReport);
userRouter.get('/reports', VerifyToken, UserReports);
userRouter.get('/reports/:id', VerifyToken, UserReport);
userRouter.get('/report-summary', VerifyToken, ReportSummary);
userRouter.post('/report-medicines', VerifyToken, ReportMedicines);

export default userRouter;
