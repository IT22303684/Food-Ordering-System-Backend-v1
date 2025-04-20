import { GoogleService } from "../services/google.service.js";
import logger from "../utils/logger.js";

export class GoogleController {
  constructor() {
    this.googleService = new GoogleService();
  }

  async googleAuth(req, res) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: "Authorization code is required",
        });
      }

      // Get Google user info
      const googleUser = await this.googleService.getGoogleUser(code);

      // Handle user creation/login
      const result = await this.googleService.handleGoogleUser(googleUser);

      return res.status(200).json({
        success: true,
        message: "Google authentication successful",
        data: result,
      });
    } catch (error) {
      logger.error("Google auth error:", error);
      return res.status(500).json({
        success: false,
        message: "Google authentication failed",
        error: error.message,
      });
    }
  }
}
