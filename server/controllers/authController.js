import { validationResult } from "express-validator";
import { queries } from "../db/queries.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator"

const saltRounds = 9;
const isProduction = process.env.NODE_ENV === 'production';

const signup = async (req, res) => {
    const { errors } = validationResult(req);
    if (errors.length !== 0) {
        const filteredErrors = errors.map(
            (err) => (err = { fieldName: err.path, message: err.msg })
        );
        return res.status(400).json({ errors: filteredErrors });
    }

    const { name, password, email } = req.body;
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format!",
        });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    if (name && hashedPassword && email) {
        try {
            const message = await queries.createUser(name, email, hashedPassword);
            if (message === "success") {
                return res.status(200).json({
                    success: true,
                    message: "User created successfully!"
                });
            } else {
                return res.status(200).json({
                    success: false,
                    message: "User registration failed!",
                });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
    return res.status(400).json({
        success: false,
        message: "Missing required fields"
    });
};


const login = async (req, res) => {
    const { errors } = validationResult(req);
    if (errors.length !== 0) {
        const filteredErrors = errors.map(
            (err) => (err = { fieldName: err.path, message: err.msg })
        );
        return res.json({ errors: filteredErrors });
    }
    const { email, password } = req.body;
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format!",
        });
    }
    const userData = await queries.getUserCredentials(email);

    if (!userData) {
        return res.status(404).json({
            success: false,
            message: "User not found!",
        });
    }

    if (userData) {
        const isValid = await bcrypt.compare(password, userData.password_hash);
        if (isValid === true) {
            const token = jwt.sign({
                id: userData.id,
                name: userData.name,
                email: userData.email,
            }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
            // Set cookie for backward compatibility
            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                secure: isProduction,
                sameSite: isProduction ? 'None' : 'Lax'
            });
            
            // Also return token in response for cross-domain support
            return res.json({
                success: true,
                message: "Login success!",
                token: token,
                name: userData.name
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Incorrect password!",
            });
        }
    } else {
        return res.status(404).json({
            success: false,
            message: "User not found!",
        });
    }
};

const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax'
    });
    return res.status(200).json({
        success: true,
        message: "Logout successful!"
    });
};

export { signup, login, logout };