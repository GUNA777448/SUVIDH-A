const { HTTP_STATUS } = require("../constants/httpStatus");

class AuthController {
  constructor(authService) {
    this.authService = authService;
    this.requestOtp = this.requestOtp.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  async requestOtp(req, res, next) {
    try {
      const result = await this.authService.requestOtp(req.body);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const result = await this.authService.verifyOtp(req.body);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const result = await this.authService.getProfileByMobile(
        req.params.mobile,
      );
      
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
module.exports = { AuthController };