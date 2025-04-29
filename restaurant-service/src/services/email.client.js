
import axios from 'axios';
import axiosRetry from 'axios-retry';
import logger from '../utils/logger.js';

// Base URL for the email service via API Gateway
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3010/api/email';

// Configure axios with retries for network errors
const axiosInstance = axios.create();
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || axios.isRetryableError(error),
});

class EmailClient {
  // Validate email address format
  #validateEmail(email) {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email address');
    }
  }

  // Send rejection email for a restaurant
  async sendRejectionEmail(email) {
    try {
      this.#validateEmail(email);
      await axiosInstance.post(`${EMAIL_SERVICE_URL}/reject-restaurant`, { email });
      logger.info('Reject restaurant email sent successfully', { email });
      return true;
    } catch (error) {
      logger.error('Failed to send reject restaurant email', {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  // Send approval email for a restaurant
  async sendApprovedEmail(email) {
    try {
      this.#validateEmail(email);
      await axiosInstance.post(`${EMAIL_SERVICE_URL}/approve-restaurant`, { email });
      logger.info('Approve restaurant email sent successfully', { email });
      return true;
    } catch (error) {
      logger.error('Failed to send approve restaurant email', {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  // Send blocked email for a restaurant
  async sendBlockedEmail(email) {
    try {
      this.#validateEmail(email);
      await axiosInstance.post(`http://localhost:3010/api/email/block-restaurant`, { email });
      logger.info('Blocked restaurant email sent successfully', { email });
      return true;
    } catch (error) {
      logger.error('Failed to send blocked restaurant email', {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

export const emailClient = new EmailClient();
