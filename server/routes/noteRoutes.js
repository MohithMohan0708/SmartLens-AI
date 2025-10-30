import express from "express";
import multer from "multer";
import { uploadNote } from "../controllers/noteController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", verifyToken, upload.single("file"), uploadNote);

export default router;
