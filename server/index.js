import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/authRouter.js";
import cookieParser from "cookie-parser";
import noteRoutes from "./routes/noteRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";


dotenv.config({
    quiet: "true",
    path: ['.env']
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    credentials: true
}));
app.use(cookieParser());

// Apply rate limiting to all API routes (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/', apiLimiter);
}

app.get("/", (req, res) => {
    res.send("Welcome to SmartLens AI API");
});

app.use(authRouter);
app.use("/api/notes", noteRoutes);
app.use("/api/settings", settingsRoutes);

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
