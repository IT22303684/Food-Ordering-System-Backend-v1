// auth-service/src/services/auth.service.js
import { User } from "../models/user.model.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import axios from "axios";
import { emailClient } from "./email.client.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL;

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthService {
  generateToken(user) {
    try {
      logger.info("Generating JWT token for user:", { userId: user._id });
      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      logger.info("JWT token generated successfully");
      return token;
    } catch (error) {
      logger.error("Error generating JWT token:", {
        userId: user._id,
        error: error.message,
      });
      throw error;
    }
  }

  async register(userData) {
    try {
      console.log("Starting registration for:", userData.email);

      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(
          "Registration failed - Email already exists:",
          userData.email
        );
        throw new AppError("Email already registered", 400);
      }

      const verificationPin = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const verificationPinExpires = new Date(Date.now() + 10 * 60 * 1000);
      console.log("Generated verification PIN:", verificationPin);

      const user = await User.create({
        ...userData,
        verificationPin,
        verificationPinExpires,
        isVerified: false,
      });
      console.log("User created successfully:", user._id);

      try {
        await emailClient.sendVerificationEmail(user.email, verificationPin);
        console.log("Verification email sent to:", user.email);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError.message);
      }

      return { user };
    } catch (error) {
      console.error("Registration error:", error.message);
      throw error;
    }
  }

  async verifyEmail(pin) {
    try {
      logger.info("Starting email verification process", { pin });

      const user = await User.findOne({
        verificationPin: pin,
        verificationPinExpires: { $gt: Date.now() },
      });

      if (!user) {
        logger.warn("Email verification failed: Invalid or expired PIN", {
          pin,
        });
        throw new AppError("Invalid or expired verification PIN", 400);
      }

      user.isVerified = true;
      user.verificationPin = undefined;
      user.verificationPinExpires = undefined;
      await user.save();

      logger.info("Email verified successfully", { userId: user._id });

      return user;
    } catch (error) {
      logger.error("Email verification failed:", {
        pin,
        error: error.message,
      });
      throw error;
    }
  }

  async login(email, password) {
    try {
      logger.info("Starting login process", { email });

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        logger.warn("Login failed: User not found", { email });
        throw new AppError("Invalid email or password", 401);
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        logger.warn("Login failed: Invalid password", { email });
        throw new AppError("Invalid email or password", 401);
      }

      if (!user.isVerified) {
        logger.warn("Login failed: Email not verified", { email });
        throw new AppError(
          "Please verify your email first. Check your inbox for the verification PIN.",
          403
        );
      }

      logger.info("Login successful", { userId: user._id });
      return user;
    } catch (error) {
      logger.error("Login failed:", {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    try {
      // Send password reset email through notification service
      await axios.post(`${EMAIL_SERVICE_URL}/reset-password`, {
        email: user.email,
        resetToken,
      });
      logger.info("Password reset email sent successfully");
    } catch (emailError) {
      logger.error("Failed to send password reset email:", {
        userId: user._id,
        error: emailError.message,
      });
      // Don't throw the error, just log it
    }

    return resetToken;
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logger.info("Password reset successfully", { userId: user._id });

    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const allowedUpdates = ["firstName", "lastName", "phone"];
    Object.keys(updateData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        user[key] = updateData[key];
      }
    });

    await user.save();
    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }

  //------------------ admin services ----------------

  async sendWelcomeEmail(email, password) {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Prepare reset URL
    const resetUrl = `http://localhost:3010/reset-password/${resetToken}`;

    try {
      // Send welcome email with password and reset link
      await emailService.sendWelcomeEmail(user.email, user.firstName, password, resetUrl);
      logger.info("Welcome email sent successfully", { userId: user._id, email });
    } catch (emailError) {
      logger.error("Failed to send welcome email:", {
        userId: user._id,
        error: emailError.message,
      });
      // Don't throw the error, just log it to ensure registration isn't blocked
    }

    return resetToken;
  }

  // get all users
  async getAllUsers() {
    try {
      logger.info("Fetching all users");
      const users = await User.find()
        .select("-password -verificationPin -resetPasswordToken -verificationPinExpires -resetPasswordExpires")
        .lean();
      logger.info("Successfully fetched all users", { count: users.length });
      return users;
    } catch (error) {
      logger.error("Error fetching all users:", error);
      throw new AppError("Failed to fetch users", 500);
    }
  }
  // get user by id 
  async getUserById(userId) {
    try {
      logger.info("Fetching user by ID:", { userId });
      const user = await User.findById(userId)
        .select("-password -verificationPin -resetPasswordToken -verificationPinExpires -resetPasswordExpires")
        .lean();
      if (!user) {
        logger.warn("User not found:", { userId });
        throw new AppError("User not found", 404);
      }
      logger.info("Successfully fetched user:", { userId });
      return user;
    } catch (error) {
      logger.error("Error fetching user by ID:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to fetch user", 500);
    }
  }
  // update user
  async updateUser(userId, updateData) {
    try {
      logger.info("Updating user:", { userId });
      const user = await User.findById(userId);
      if (!user) {
        logger.warn("User not found:", { userId });
        throw new AppError("User not found", 404);
      }

      // Check for email uniqueness if email is being updated
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({ email: updateData.email });
        if (existingUser) {
          logger.warn("Email already exists:", { email: updateData.email });
          throw new AppError("Email already registered", 400);
        }
      }

      // Update allowed fields
      const allowedUpdates = [
        "email",
        "firstName",
        "lastName",
        "phone",
        "role",
        "address.street",
        "address.city",
        "address.state",
        "address.zipCode",
        "address.country",
      ];
      Object.keys(updateData).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          if (key.startsWith("address.")) {
            const addressField = key.split(".")[1];
            user.address[addressField] = updateData[key];
          } else {
            user[key] = updateData[key];
          }
        }
      });

      // Handle password update if provided
      if (updateData.password) {
        user.password = updateData.password; // Will be hashed by pre-save hook
      }

      await user.save();
      logger.info("User updated successfully:", { userId });

      // Return user without sensitive fields
      return await User.findById(userId)
        .select("-password -verificationPin -resetPasswordToken -verificationPinExpires -resetPasswordExpires")
        .lean();
    } catch (error) {
      logger.error("Error updating user:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to update user", 500);
    }
  }
  // delete user
  async deleteUser(userId) {
    try {
      logger.info("Deleting user:", { userId });
      const user = await User.findById(userId);
      if (!user) {
        logger.warn("User not found:", { userId });
        throw new AppError("User not found", 404);
      }

      await user.deleteOne();
      logger.info("User deleted successfully:", { userId });
    } catch (error) {
      logger.error("Error deleting user:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to delete user", 500);
    }
  }
  // update user status
  async updateUserStatus(userId, statusData) {
    try {
      logger.info("Updating user status:", { userId });
      const user = await User.findById(userId);
      if (!user) {
        logger.warn("User not found:", { userId });
        throw new AppError("User not found", 404);
      }

      // Update status fields
      if (typeof statusData.isActive !== "undefined") {
        user.isActive = statusData.isActive;
      }
      if (typeof statusData.isVerified !== "undefined") {
        user.isVerified = statusData.isVerified;
      }

      await user.save();
      logger.info("User status updated successfully:", { userId });

      // Return user without sensitive fields
      return await User.findById(userId)
        .select("-password -verificationPin -resetPasswordToken -verificationPinExpires -resetPasswordExpires")
        .lean();
    } catch (error) {
      logger.error("Error updating user status:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to update user status", 500);
    }
  }
  // update user role
  async updateUserRole(userId, role) {
    try {
      logger.info("Updating user role:", { userId, role });
      const user = await User.findById(userId);
      if (!user) {
        logger.warn("User not found:", { userId });
        throw new AppError("User not found", 404);
      }

      user.role = role;
      await user.save();
      logger.info("User role updated successfully:", { userId, role });

      return await User.findById(userId)
        .select("-password -verificationPin -resetPasswordToken -verificationPinExpires -resetPasswordExpires")
        .lean();
    } catch (error) {
      logger.error("Error updating user role:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to update user role", 500);
    }
  }
}
