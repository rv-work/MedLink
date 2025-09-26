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




// Regular medicine photo storage
export const medicineStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'medicines',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return 'medicine-' + uniqueSuffix;
    }
  }
});
// Updated file filter to handle both image MIME types and octet-stream from ZIP files
const fileFilterPhotoMed = (req, file, cb) => {
  console.log('File received:', file.originalname, 'MIME:', file.mimetype);
  
  // Check if it's an image by MIME type OR by file extension (for ZIP extracted files)
  const isImage = file.mimetype.startsWith('image/') || 
                  file.mimetype === 'application/octet-stream';
  
  const hasImageExtension = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.originalname);
  
  if (isImage && hasImageExtension) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};


export const uploadPhotoFileMed = multer({
  storage: medicineStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilterPhotoMed
});

// Bulk photos upload for bulk add medicines
export const uploadBulkFiles = multer({
  storage: medicineStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 50 // Maximum 50 files
  },
  fileFilter: fileFilterPhotoMed
});

















// Storage for donor photos
const donorPhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blood-donation/donor-photos',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 500, height: 500, crop: 'fill' },
      { quality: 'auto:best' }
    ]
  }
});

// Storage for certificates
const certificateStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blood-donation/certificates',
    allowed_formats: ['pdf', 'jpg', 'png'],
    resource_type: 'auto'
  }
});




const donarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blood-donors',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

const upload = multer({ 
  storage: donarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export const uploadDonorPhoto = upload.single('donorPhoto');

export default uploadEmergency;
