import express from 'express';
import { UserDashboard  , UpdateUserReport, UploadUserReportWeb2, UserReports, UserReport, ReportSummary, ReportMedicines, UploadUserReportWeb3, getCriticalData} from '../Controllers/UserController.js';
import { VerifyToken } from '../Middleware/Verify.js';
import { uploadReportFiles } from '../Middleware/Multer.js';

const userRouter = express.Router();

userRouter.get('/dashboard', VerifyToken, UserDashboard);
userRouter.post('/upload-report', VerifyToken, UploadUserReportWeb3);

//single
// userRouter.post('/upload-report-web2', VerifyToken, uploadReportFile.single('file'), UploadUserReportWeb2);

// Updated route to handle multiple files
// userRouter.post('/upload-report-web2', 
//   VerifyToken, 
//   uploadReportFiles.array('files', 5), // Allow up to 5 files with field name 'files'
//   UploadUserReportWeb2
// );


// Updated route to handle separate file types
userRouter.post('/upload-report-web2', 
  VerifyToken, 
  uploadReportFiles.fields([
    { name: 'reportFiles', maxCount: 5 }, // Up to 5 report files
    { name: 'medicineFile', maxCount: 1 }  // 1 medicine list file for extraction
  ]),
  UploadUserReportWeb2
);


userRouter.put('/reports/:reportId/blockchain', VerifyToken, UpdateUserReport);
userRouter.get('/reports', VerifyToken, UserReports);
userRouter.get('/reports/:id', VerifyToken, UserReport);
userRouter.get('/report-summary', VerifyToken, ReportSummary);
userRouter.post('/report-medicines', VerifyToken, ReportMedicines);


userRouter.get('/:userId', getCriticalData);

export default userRouter;
