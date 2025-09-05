import express from 'express';
import { VerifyToken } from '../Middleware/Verify.js';
import {  uploadBulkFiles, uploadPhotoFileMed } from '../Middleware/Multer.js';
import {
  Register,
  AddMedicines,
  UpdateMedicine,
  GetSellerMedicines,
  SearchMedicine,
  BulkAddMedicines
} from '../Controllers/ClinicControllers.js';

const ClinicRouter = express.Router();

// Seller registration
ClinicRouter.post('/register', VerifyToken, Register);

// Add single medicine with photo
ClinicRouter.post('/add-medicine', VerifyToken, uploadPhotoFileMed.single('photo'), AddMedicines);

// Bul
// Bulk add medicines with multiple photos - WITH ERROR HANDLING
ClinicRouter.post('/bulk-add-medicines', VerifyToken, (req, res, next) => {
  uploadBulkFiles.array('photos', 50)(req, res, function (err) {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
        error: err.message
      });
    }
    next();
  });
}, BulkAddMedicines);

// Update medicine
ClinicRouter.put('/update-medicine/:medicineId', VerifyToken, UpdateMedicine);

// Get seller's medicines
ClinicRouter.get('/my-medicines', VerifyToken, GetSellerMedicines);

// Search medicines by location
ClinicRouter.get('/search-medicine', SearchMedicine);

export default ClinicRouter;
