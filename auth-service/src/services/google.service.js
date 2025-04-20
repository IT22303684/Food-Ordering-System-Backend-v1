import { googleClient } from "../config/google.config.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

export class GoogleService {
  async getGoogleUser(code) {
    try {
      // Get tokens from code
      const { tokens } = await googleClient.getToken(code);
      googleClient.setCredentials(tokens);

      // Get user info
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      logger.error("Google OAuth error:", error);
      throw new Error("Failed to get Google user");
    }
  }

  async handleGoogleUser(googleUser) {
    try {
      // Check if user exists
      let user = await User.findOne({ email: googleUser.email });

      if (!user) {
        // Create new user
        user = await User.create({
          email: googleUser.email,
          password: Math.random().toString(36).slice(-8), // Generate random password
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          isVerified: true, // Google users are automatically verified
          role: "CUSTOMER",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      logger.error("Google user handling error:", error);
      throw new Error("Failed to handle Google user");
    }
  }
}
