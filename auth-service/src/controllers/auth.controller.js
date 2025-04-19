// auth-service/src/controllers/auth.controller.js
import { AuthService } from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import logger from "../utils/logger.js";

const authService = new AuthService();

const register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, address } = req.body;
    console.log("Registration request received for:", email);

    const authService = new AuthService();
    const { user } = await authService.register({
      email,
      password,
      firstName,
      lastName,
      address,
      role: role || "CUSTOMER",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
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
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

const getProfile = async (req, res) => {
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
};

export { register, login, getProfile };

export class AuthController {
  async verifyEmail(req, res, next) {
    try {
      const { pin } = req.body;
      await authService.verifyEmail(pin);

      res.json({
        status: "success",
        message: "Email verified successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const resetToken = await authService.forgotPassword(req.body.email);

      res.json({
        status: "success",
        message: "Password reset instructions sent to email",
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      await authService.resetPassword(req.params.token, req.body.password);

      res.json({
        status: "success",
        message: "Password reset successful",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updatedUser = await authService.updateProfile(
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
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      await authService.changePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword
      );

      res.json({
        status: "success",
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  logout(req, res) {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.json({
      status: "success",
      message: "Logged out successfully",
    });
  }
}
