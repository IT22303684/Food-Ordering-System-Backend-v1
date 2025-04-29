import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and PDFs are allowed'));
  }
};

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).fields([
  { name: 'businessLicense', maxCount: 1 },
  { name: 'foodSafetyCert', maxCount: 1 },
  { name: 'exteriorPhoto', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'mainImage', maxCount: 1 },
  { name: 'thumbnailImage', maxCount: 1 }
]);