import { Router } from "express";
import { login, signup, logout} from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const authRouter = Router();

// Apply auth limiter only in non-test environment
const authMiddleware = process.env.NODE_ENV === 'test' ? [] : [authLimiter];

authRouter.post("/api/auth/login", ...authMiddleware, login);
authRouter.post("/api/auth/signup", ...authMiddleware, signup);
authRouter.post("/api/auth/logout", logout);

export default authRouter;