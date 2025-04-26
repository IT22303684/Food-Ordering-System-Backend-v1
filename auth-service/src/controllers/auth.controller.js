// auth-service/src/controllers/auth.controller.js
import { AuthService } from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import logger from "../utils/logger.js";
import axios from "axios";

export class AuthController {
  constructor() {
    this.authService = new AuthService();

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.logout = this.logout.bind(this);
    this.verifyAuth = this.verifyAuth.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.updateUserStatus = this.updateUserStatus.bind(this);
    this.updateUserRole = this.updateUserRole.bind(this);
  }

  async register(req, res) {
    try {
      const {
        email,
        password,
        role,
        firstName,
        lastName,
        address,
        vehicleType,
        vehicleNumber,
      } = req.body;
      console.log("Registration request received for:", email);

      const { user } = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        address,
        role: role || "CUSTOMER",
      });

      // If registering as a driver, create driver profile
      if (role === "DELIVERY") {
        try {
          // Call driver service to create driver profile
          await axios.post(
            `${process.env.DRIVER_SERVICE_URL}/api/drivers/register`,
            {
              userId: user._id,
              vehicleType,
              vehicleNumber,
              location: [0, 0], // Default location
            }
          );
        } catch (error) {
          // If driver profile creation fails, delete the user
          await User.findByIdAndDelete(user._id);
          throw new Error("Failed to create driver profile");
        }
      }

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
      console.error("Error stack trace:", error.stack); // Log the full stack trace
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

  async verifyAuth(req, res) {
    try {
      // The authMiddleware already verified the token and attached the user
      const user = await User.findById(req.user.id).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Return user information
      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      logger.error("Auth verification error:", error);
      res.status(500).json({
        success: false,
        message: "Authentication verification failed",
      });
    }
  }

  //-----------------------------admin controllers-------------------

  //sent welcome email 
  async sendWelcomeEmail(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const resetToken = await authService.sendWelcomeEmail(email, password);

      res.json({
        status: "success",
        message: "Welcome email sent successfully",
        data: { resetToken },
      });
    } catch (error) {
      logger.error("Send welcome email error:", { error: error.message, stack: error.stack });
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  //get all users
  async getAllUsers(req, res) {
    try {
      const users = await this.authService.getAllUsers();
      res.status(200).json({
        status: "success",
        data: { users },
      });
    } catch (error) {
      logger.error("Get all users error:", error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
  //get user by id
  async getUserById(req, res) {
    try {
      const user = await this.authService.getUserById(req.params.id);
      res.status(200).json({
        status: "success",
        data: { user },
      });
    } catch (error) {
      logger.error("Get user by ID error:", error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
  //update user
  async updateUser(req, res) {
    try {
      const updatedUser = await this.authService.updateUser(
        req.params.id,
        req.body
      );
      res.status(200).json({
        status: "success",
        data: { user: updatedUser },
      });
    } catch (error) {
      logger.error("Update user error:", error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
  // delete user
  async deleteUser(req, res) {
    try {
      await this.authService.deleteUser(req.params.id);
      res.status(200).json({
        status: "success",
        message: "User deleted successfully",
      });
    } catch (error) {
      logger.error("Delete user error:", error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
  //update user status
  async updateUserStatus(req, res) {
    try {
      const updatedUser = await this.authService.updateUserStatus(
        req.params.id,
        req.body
      );
      res.status(200).json({
        status: "success",
        data: { user: updatedUser },
      });
    } catch (error) {
      logger.error("Update user status error:", error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
  //update user role
  async updateUserRole(req, res) {
    try {
      const updatedUser = await this.authService.updateUserRole(
        req.params.id,
        req.body.role
      );
      res.status(200).json({
        status: "success",
        data: { user: updatedUser },
      });
    } catch (error) {
      logger.error("Update user role error:", error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}
