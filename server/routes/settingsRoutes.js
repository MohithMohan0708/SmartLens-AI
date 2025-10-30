import express from "express";
import { updateProfile, changePassword, deleteAccount } from "../controllers/settingsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/profile", verifyToken, updateProfile);
router.put("/password", verifyToken, changePassword);
router.delete("/account", verifyToken, deleteAccount);

export default router;
