const { redisClient } = require("../config/redis");
const { env } = require("../config/env");

class OtpRepository {
  otpKey(email) {
    return `otp:${email.toLowerCase()}`;
  }

  rateKey(email) {
    return `otp-rate:${email.toLowerCase()}`;
  }

  async saveOtp(email, otpHash) {
    await redisClient.setEx(this.otpKey(email), env.otpTtlSeconds, otpHash);
  }

  async getOtpHash(email) {
    return redisClient.get(this.otpKey(email));
  }

  async deleteOtp(email) {
    await redisClient.del(this.otpKey(email));
  }

  async incrementOtpRequestCount(email) {
    const key = this.rateKey(email);
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, env.otpRateLimitWindowSeconds);
    }

    return count;
  }
}

module.exports = { OtpRepository };
