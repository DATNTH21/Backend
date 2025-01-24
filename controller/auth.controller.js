const AuthService = require("../services/auth.service");
const { OKSuccessResponse } = require("../response/success");
const { BadRequestResponse } = require("../response/error");
const AuthValidator = require("../validators/auth.validator");
const MongooseUtil = require("../utils/mongoose.util");

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  handleSignup = async (req, res, next) => {
    const validationResult = AuthValidator.validateSignup(req);
    if (validationResult?.error === true) {
      throw new BadRequestResponse(
        validationResult?.message ?? "",
        validationResult?.code ?? -1
      );
    }

    const { email, password } = validationResult?.data;
    try {
      const result = await this.authService.handleSignup(email, password);
      return new OKSuccessResponse({
        message: "Signup success",
        data: result,
        code: 1010100,
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1010106);
      }
      throw error;
    }
  };

  handleLogin = async (req, res, next) => {
    const validationResult = AuthValidator.validateLogin(req);
    if (validationResult?.error === true) {
      throw new BadRequestResponse(
        validationResult?.message ?? "",
        validationResult?.code ?? -1
      );
    }

    const { email, password } = validationResult?.data;

    try {
      const result = await this.authService.handleLogin(email, password);
      return new OKSuccessResponse({
        message: "Login success",
        data: result,
        code: 1010200,
        metadata: {},
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1010209);
      }
      throw error;
    }
  };

  handleInvokeNewTokens = async (req, res, next) => {
    const validationResult = await AuthValidator.validateInvokeNewToken(req);
    if (validationResult?.error === true) {
      throw new BadRequestResponse(
        validationResult?.message ?? "",
        validationResult?.code ?? -1
      );
    }

    const { userId, accessToken, refreshToken } = validationResult?.data;
    try {
      const result = await this.authService.handleInvokeNewTokens(
        userId,
        accessToken,
        refreshToken
      );
      return new OKSuccessResponse({
        message: "Invoke new tokens success",
        data: result,
        code: 1010300,
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1010315);
      }
      throw error;
    }
  };

  handleVerifyEmail = async (req, res, next) => {
    const validationResult = await AuthValidator.validateVerifyEmail(req);
    if (validationResult?.error === true) {
      throw new BadRequestResponse(
        validationResult?.message ?? "",
        validationResult?.code ?? -1
      );
    }
    const { userEmail } = validationResult?.data;

    try {
      await this.authService.sendOTPToVerifyEmail(userEmail);
      return new OKSuccessResponse({
        message: "Send email to user email success",
        data: [],
        code: 1010400,
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1010408);
      }
      throw error;
    }
  };

  handleVerifyOTP = async (req, res, next) => {
    const validationResult = await AuthValidator.validateVerifyOTP(req);
    if (validationResult?.error === true) {
      throw new BadRequestResponse(
        validationResult?.message ?? "",
        validationResult?.code ?? -1
      );
    }

    const { userEmail, otp } = validationResult?.data;
    try {
      const response = await this.authService.verifyOTP(userEmail, otp);
      return new OKSuccessResponse({
        message: "Verify OTP success",
        data: response,
        code: 1010500,
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1010511);
      }
      throw error;
    }
  };

  handleLoginWithGoogle = async (req, res, next) => {
    const validationResult = AuthValidator.validateGoogleLogin(req);
    if (validationResult.error) {
      throw new BadRequestResponse(
        validationResult.message,
        validationResult.code
      );
    }

    const { idToken } = validationResult.data;
    try {
      const result = await this.authService.loginWithGoogle(idToken);
      return new OKSuccessResponse({
        message: "Login with google success",
        data: result,
        code: 1010600,
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1010606);
      }
      throw error;
    }
  };

  handleLoginWithFacebook = async (req, res, next) => {
    const profile = req.user;
    const validationResult = AuthValidator.validateFacebookLogin(profile);
    if (validationResult.error) {
      throw new BadRequestResponse(
        validationResult.message,
        validationResult.code
      );
    }

    const dataRaw = validationResult.data;

    try {
      const result = await this.authService.loginWithFacebook(dataRaw);
      return new OKSuccessResponse({
        message: "Login with facebook success",
        data: result,
        code: 1010900,
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1010905);
      }
      throw error;
    }
  };

  handleLogout = async (req, res, next) => {
    const validationResult = AuthValidator.validateLogout(req);
    if (validationResult.error) {
      throw new BadRequestResponse(
        validationResult.message,
        validationResult.code
      );
    }

    const { user } = validationResult.data;
    console.log("Auth controlle - log out: ", user);

    try {
      await this.authService.handleLogout(user);
      return new OKSuccessResponse({
        message: "Logout success",
        data: {},
        metadata: {
          code: 1011000,
          userId: user.id,
        },
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1011001);
      }
      throw error;
    }
  };
  handleSendOTPToResetPassword = async (req, res, next) => {
    const validationResult = await AuthValidator.validateVerifyEmail(req);
    if (validationResult.error) {
      throw new BadRequestResponse(
        validationResult.message,
        validationResult.code
      );
    }
    const { userEmail } = validationResult?.data;
    try {
      await this.authService.sendOTPToResetPassword(userEmail);
      return new OKSuccessResponse({
        message: "Send OTP to reset password success",
        data: [],
        code: 1011200,
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1011209);
      }
      throw error;
    }
  };
  handleConfirmOTPToResetPassword = async (req, res, next) => {
    const validationResult = await AuthValidator.validateVerifyOTP(req);
    if (validationResult.error) {
      throw new BadRequestResponse(
        validationResult.message,
        validationResult.code
      );
    }
    const { userEmail, otp } = validationResult?.data;
    try {
      const result = await this.authService.confirmOTPToResetPassword(
        userEmail,
        otp
      );
      return new OKSuccessResponse({
        message: "Confirm OTP to reset password success",
        data: result,
        code: 1011300,
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1011311);
      }
      throw error;
    }
  };
  handleResetPassword = async (req, res, next) => {
    const validationResult = AuthValidator.validateResetPassword(req);
    if (validationResult.error) {
      throw new BadRequestResponse(
        validationResult.message,
        validationResult.code
      );
    }
    const { userId, resetPasswordToken, newPassword } = validationResult?.data;
    try {
      const result = await this.authService.resetPassword(
        userId,
        resetPasswordToken,
        newPassword
      );
      return new OKSuccessResponse({
        message: "Reset password success",
        data: result,
        code: 1011400,
      }).send(res);
    } catch (error) {
      if (MongooseUtil.isMongooseError(error)) {
        throw new BadRequestResponse("Something went wrong", 1011415);
      }
      throw error;
    }
  };
}

module.exports = new AuthController();