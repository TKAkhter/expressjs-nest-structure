import { Request } from "express";
import multer from "multer";
// Import path from 'path';
// Import fs from 'fs';

// Const storage = multer.diskStorage({
//   Destination: (req, file, cb) => {
//     Const uploadDir = './uploads';
//     If (!fs.existsSync(uploadDir)) {
//       Fs.mkdirSync(uploadDir);
//     }
//     Cb(null, uploadDir);
//   },
//   Filename: (req, file, cb) => {
//     Const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     Cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "video/mp4", "video/mkv"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Invalid file type. Only images (JPEG, PNG) and videos (MP4, MKV) are allowed."),
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const uploadMiddleware = upload.single("file");
