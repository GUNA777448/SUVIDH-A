const { HTTP_STATUS } = require("../constants/httpStatus");
const { AppError } = require("../utils/appError");
const { generateOtp, hashOtp } = require("../utils/otp");

class AuthService {
  constructor(userRepository, otpRepository, emailService, otpRateLimitMax) {
    this.userRepository = userRepository;
    this.otpRepository = otpRepository;
    this.emailService = emailService;
    this.otpRateLimitMax = otpRateLimitMax;
  }

  validateUserPayload(payload) {
    const required = ["name", "mobile", "gmail", "aadharnumber", "consumer_id"];

    const missing = required.filter((field) => !payload[field]);
    if (missing.length > 0) {
      throw new AppError(
        `Missing required fields: ${missing.join(", ")}`,
        HTTP_STATUS.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }
  }

  async requestOtp(payload) {
    const identifier = (payload.identifier || "").trim().toLowerCase();
    const value = (payload.value || "").trim();

    if (identifier !== "mobile") {
      throw new AppError(
        "identifier must be 'mobile'",
        HTTP_STATUS.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    if (!value) {
      throw new AppError(
        "value is required",
        HTTP_STATUS.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    const user = await this.userRepository.findByMobile(value);
    if (!user) {
      throw new AppError(
        "User not found for the provided mobile number",
        HTTP_STATUS.NOT_FOUND,
        "USER_NOT_FOUND",
      );
    }

    const gmail = user.gmail;

    const count = await this.otpRepository.incrementOtpRequestCount(gmail);
    if (count > this.otpRateLimitMax) {
      throw new AppError(
        "Too many OTP requests. Please try again later.",
        HTTP_STATUS.TOO_MANY_REQUESTS,
        "OTP_RATE_LIMIT_EXCEEDED",
      );
    }

    const otp = generateOtp();
    const otpHash = hashOtp(gmail, otp);

    await this.otpRepository.saveOtp(gmail, otpHash);
    await this.emailService.sendOtpEmail({
      email: gmail,
      name: user.name,
      otp,
    });

    return {
      message: "OTP sent successfully",
      identifier: "mobile",
      value,
      email: gmail,
      ttlSeconds: 300,
    };
  }

  async verifyOtp(payload) {
    const identifier = (payload.identifier || "").trim().toLowerCase();
    const value = (payload.value || "").trim();
    const otp = (payload.otp || "").trim();

    if (identifier !== "mobile") {
      throw new AppError(
        "identifier must be 'mobile'",
        HTTP_STATUS.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    if (!value || !otp) {
      throw new AppError(
        "value and otp are required",
        HTTP_STATUS.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    const user = await this.userRepository.findByMobile(value);
    if (!user) {
      throw new AppError(
        "User not found for the provided mobile number",
        HTTP_STATUS.NOT_FOUND,
        "USER_NOT_FOUND",
      );
    }

    const gmail = user.gmail;

    const storedHash = await this.otpRepository.getOtpHash(gmail);
    if (!storedHash) {
      throw new AppError(
        "OTP expired or not found",
        HTTP_STATUS.UNAUTHORIZED,
        "OTP_NOT_FOUND",
      );
    }

    const incomingHash = hashOtp(gmail, otp);
    if (incomingHash !== storedHash) {
      throw new AppError(
        "Invalid OTP",
        HTTP_STATUS.UNAUTHORIZED,
        "OTP_INVALID",
      );
    }

    await this.otpRepository.deleteOtp(gmail);

    return {
      message: "OTP verified successfully",
      identifier: "mobile",
      value,
      user,
    };
  }

  async getProfileByMobile(mobile) {
    const normalizedMobile = (mobile || "").trim();

    if (!normalizedMobile) {
      throw new AppError(
        "mobile is required",
        HTTP_STATUS.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    const user = await this.userRepository.findByMobile(normalizedMobile);
    if (!user) {
      throw new AppError(
        "User not found for the provided mobile number",
        HTTP_STATUS.NOT_FOUND,
        "USER_NOT_FOUND",
      );
    }

    return {
      message: "Profile fetched successfully",
      user,
    };
  }
}

module.exports = { AuthService };
