// auth-service/src/controllers/auth.controller.js
import { AuthService } from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import logger from "../utils/logger.js";

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async register(req, res) {
    try {
      const { email, password, role, firstName, lastName, address } = req.body;
      console.log("Registration request received for:", email);

      const { user } = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        address,
        role: role || "CUSTOMER",
      });

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      console.log("Registration successful for:", email);
      res.status(201).json({
        message:
          "User registered successfully. Please check your email for verification code.",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error("Registration error:", error.message);
      if (error.name === "ValidationError") {
        console.error(
          "Validation errors:",
          Object.values(error.errors).map((err) => err.message)
        );
        return res.status(400).json({
          message: "Invalid data",
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }
      if (error.isOperational) {
        console.error("Operational error:", error.message);
        return res.status(error.statusCode).json({
          message: error.message,
        });
      }
      console.error("Server error:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for:", email);

      // Find user by email
      const user = await User.findOne({ email });
      console.log("User found:", user ? "Yes" : "No");

      if (!user) {
        console.log("Login failed: User not found");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user is verified
      if (!user.isVerified) {
        console.log("Login failed: User not verified");
        return res
          .status(401)
          .json({ message: "Please verify your email first" });
      }

      // Compare password
      const isMatch = await user.comparePassword(password);
      console.log("Password match:", isMatch);

      if (!isMatch) {
        console.log("Login failed: Invalid password");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Set cookie with token
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      });

      console.log("Login successful");
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).json({ message: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      logger.error("Get profile error:", error);
      res.status(500).json({ message: "Error fetching profile" });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { pin } = req.body;
      await this.authService.verifyEmail(pin);

      res.json({
        status: "success",
        message: "Email verified successfully",
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const resetToken = await this.authService.forgotPassword(req.body.email);

      res.json({
        status: "success",
        message: "Password reset instructions sent to email",
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      await this.authService.resetPassword(req.params.token, req.body.password);

      res.json({
        status: "success",
        message: "Password reset successful",
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const updatedUser = await this.authService.updateProfile(
        req.user.id,
        req.body
      );
      res.json({
        status: "success",
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      await this.authService.changePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword
      );

      res.json({
        status: "success",
        message: "Password changed successfully",
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  logout(req, res) {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  }
}
