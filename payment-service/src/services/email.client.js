import axios from 'axios';
import axiosRetry from 'axios-retry';
import logger from '../utils/logger.js';

// Base URL for the email service via API Gateway
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3010/api/email';

// Configure axios with retries for network errors
const axiosInstance = axios.create();
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000, // 1s, 2s, 3s
  retryCondition: (error) => error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || axios.isRetryableError(error),
});

class EmailClient {
  // Validate email address format
  #validateEmail(email) {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email address');
    }
  }

  
  async sendPaymentConfirmationEmail(email, paymentDetails) {
    try {
      this.#validateEmail(email);
      await axiosInstance.post(`${EMAIL_SERVICE_URL}/payment-confirmation`, {
        email,
        paymentDetails,
      });
      logger.info('Payment confirmation email sent successfully', { email });
      return true;
    } catch (error) {
      logger.error('Failed to send payment confirmation email', {
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

export const emailClient = new EmailClient();