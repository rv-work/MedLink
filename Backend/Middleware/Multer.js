import multer from 'multer';
// import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'reports',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return 'report-' + uniqueSuffix;
    }
  }
});

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/reports/'); 
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });



//photo

const fileFilterPhoto = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images files are allowed'), false);
  }
};


export const uploadPhotoFile = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: fileFilterPhoto
});

//reprot


//single..........

// const fileFilterReport = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
//     cb(null, true);
//   } else {
//     cb(new Error('Only images and PDF files are allowed'), false);
//   }
// };

// export const uploadReportFile = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024, 
//   },
//   fileFilter: fileFilterReport
// });




//multiple...................

// const fileFilterReport = (req, file, cb) => {
//   const allowedMimes = [
//     'image/jpeg',
//     'image/jpg', 
//     'image/png',
//     'application/pdf',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//   ];
  
//   if (allowedMimes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only images, PDF, and Word documents are allowed'), false);
//   }
// };

// export const uploadReportFiles = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB per file
//     files: 5 // Maximum 5 files
//   },
//   fileFilter: fileFilterReport
// });



//..diff names multiple


const fileFilterReport = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDF, and Word documents are allowed'), false);
  }
};

export const uploadReportFiles = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Maximum 5 files
  },
  fileFilter: fileFilterReport
});



//emergency

const storageEm = multer.memoryStorage();

const uploadEmergency = multer({
  storage: storageEm,

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (jpg, jpeg, png) are allowed"));
    }
  },

  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});

export default uploadEmergency;
