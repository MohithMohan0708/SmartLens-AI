import express from "express";
import multer from "multer";
import { uploadNote, getUserNotes, getNoteById, deleteNote } from "../controllers/noteController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Configure multer with size limits for Render deployment
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 1 // Only 1 file per request
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
    }
  }
});

// Apply upload limiter only in non-test environment
const uploadMiddleware = process.env.NODE_ENV === 'test' 
  ? [verifyToken, upload.single("file"), uploadNote]
  : [uploadLimiter, verifyToken, upload.single("file"), uploadNote];

router.post("/upload", ...uploadMiddleware);
router.get("/", verifyToken, getUserNotes);
router.get("/note/:noteId", verifyToken, getNoteById);
router.delete("/note/:noteId", verifyToken, deleteNote);

export default router;
