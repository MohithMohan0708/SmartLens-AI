import { Router } from "express";
import { login, signup, logout} from "../controllers/authController.js";

const authRouter = Router();

authRouter.post("/api/auth/login",login);
authRouter.post("/api/auth/signup", signup);
authRouter.post("/api/auth/logout", logout);

export default authRouter;