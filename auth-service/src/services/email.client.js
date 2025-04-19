import axios from "axios";
import logger from "../utils/logger.js";

const EMAIL_SERVICE_URL =
  process.env.EMAIL_SERVICE_URL || "http://localhost:3003/api/email";

class EmailClient {
  async sendVerificationEmail(email, pin) {
    try {
      await axios.post(`${EMAIL_SERVICE_URL}/verify`, {
        email,
        pin,
      });
      logger.info("Verification email sent successfully", { email });
      return true;
    } catch (error) {
      logger.error("Failed to send verification email", {
        email,
        error: error.message,
      });
      throw error;
    }
  }

  async sendPasswordResetEmail(email, token) {
    try {
      await axios.post(`${EMAIL_SERVICE_URL}/reset-password`, {
        email,
        token,
      });
      logger.info("Password reset email sent successfully", { email });
      return true;
    } catch (error) {
      logger.error("Failed to send password reset email", {
        email,
        error: error.message,
      });
      throw error;
    }
  }
}

export const emailClient = new EmailClient();
