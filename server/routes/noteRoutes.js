import express from "express";
import multer from "multer";
import { uploadNote, getUserNotes, getNoteById, deleteNote } from "../controllers/noteController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply upload limiter only in non-test environment
const uploadMiddleware = process.env.NODE_ENV === 'test' 
  ? [verifyToken, upload.single("file"), uploadNote]
  : [uploadLimiter, verifyToken, upload.single("file"), uploadNote];

router.post("/upload", ...uploadMiddleware);
router.get("/", verifyToken, getUserNotes);
router.get("/note/:noteId", verifyToken, getNoteById);
router.delete("/note/:noteId", verifyToken, deleteNote);

export default router;
