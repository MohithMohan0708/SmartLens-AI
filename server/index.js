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

// Trust proxy for Docker/Nginx deployment
app.set('trust proxy', 1);

// Increase payload size limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration for production deployment
const allowedOrigins = [
    'http://localhost',
    'http://localhost:3000',
    'https://smartlens-ai.onrender.com',
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all in production for now
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle Multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Only 1 file allowed per upload.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload error'
        });
    }
    
    // Handle file filter errors (from multer fileFilter)
    if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    // Handle other errors
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
