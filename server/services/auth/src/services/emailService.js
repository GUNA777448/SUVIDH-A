const axios = require("axios");
const { env } = require("../config/env");
const { AppError } = require("../utils/appError");
const { HTTP_STATUS } = require("../constants/httpStatus");

class EmailService {
  async sendOtpEmail({ email, name, otp }) {
    if (!env.otpProviderUrl) {
      throw new AppError(
        "OTP_PROVIDER_URL is not configured",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "CONFIGURATION_ERROR",
      );
    }

    try {
      const response = await axios.post(
        env.otpProviderUrl,
        {
          email,
          name,
          otp,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new AppError(
        "Failed to dispatch OTP email",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "OTP_DELIVERY_FAILED",
      );
    }
  }
}

module.exports = { EmailService };
