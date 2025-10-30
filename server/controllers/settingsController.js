import { queries } from "../db/queries.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = 9;
const isProduction = process.env.NODE_ENV === 'production';

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required",
            });
        }

        const updatedUser = await queries.updateUserProfile(userId, name, email);

        if (!updatedUser) {
            return res.status(500).json({
                success: false,
                message: "Failed to update profile",
            });
        }

        const token = jwt.sign({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
        }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax'
        });

        return res.json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters",
            });
        }

        const userData = await queries.getUserById(userId);
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const userCredentials = await queries.getUserCredentials(userData.email);
        const isValidPassword = await bcrypt.compare(currentPassword, userCredentials.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
        const updated = await queries.updateUserPassword(userId, newPasswordHash);

        if (!updated) {
            return res.status(500).json({
                success: false,
                message: "Failed to change password",
            });
        }

        return res.json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to change password",
        });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required to delete account",
            });
        }

        const userData = await queries.getUserById(userId);
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const userCredentials = await queries.getUserCredentials(userData.email);
        if (!userCredentials) {
            return res.status(404).json({
                success: false,
                message: "User credentials not found",
            });
        }

        const isValidPassword = await bcrypt.compare(password, userCredentials.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password",
            });
        }

        // Delete user account (notes will be deleted via CASCADE or manually)
        const deleted = await queries.deleteUser(userId);

        if (!deleted) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete account. Please try again.",
            });
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax'
        });

        return res.json({
            success: true,
            message: "Account deleted successfully",
        });
    } catch (error) {
        console.error("Delete account error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete account. Error: " + error.message,
        });
    }
};
