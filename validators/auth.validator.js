const validator = require("validator");
const ValidatorConfig = require("../config/validator.config");

class AuthValidator extends ValidatorConfig {
  static validateSignup(req) {
    // Email validation
    if (validator.isEmpty(req.body?.email || "")) {
      return AuthValidator.returnFailedError("Email is required", 1010101);
    }
    if (!validator.isEmail(req.body?.email)) {
      return AuthValidator.returnFailedError("Invalid email format", 1010102);
    }

    // Password validation
    if (validator.isEmpty(req.body?.password || "")) {
      return AuthValidator.returnFailedError("Password is required", 1010103);
    }

    if (!validator.isLength(req.body?.password, { min: 3 })) {
      return AuthValidator.returnFailedError(
        "Password must be at least 3 characters long",
        1010104
      );
    }

    // Validation passed
    return AuthValidator.returnPassedData({
      email: req.body?.email,
      password: req.body?.password,
    });
  }

  static validateLogin(req) {
    // Email validation
    if (validator.isEmpty(req.body?.email || "")) {
      return AuthValidator.returnFailedError("Email is required", 1010201);
    }
    if (!validator.isEmail(req.body?.email)) {
      return AuthValidator.returnFailedError("Invalid email format", 1010202);
    }

    // Password validation
    if (validator.isEmpty(req.body?.password || "")) {
      return AuthValidator.returnFailedError("Password is required", 1010203);
    }

    if (!validator.isLength(req.body?.password, { min: 3 })) {
      return AuthValidator.returnFailedError(
        "Password must be at least 3 characters long",
        1010204
      );
    }

    // Validation passed
    return AuthValidator.returnPassedData({
      email: req.body?.email,
      password: req.body?.password,
    });
  }

  static validateInvokeNewToken(req) {
    // User ID validation
    if (validator.isEmpty(req.headers["x-client-id"] || "")) {
      return AuthValidator.returnFailedError("Client ID is required", 1010301);
    }

    // Access token validation
    if (validator.isEmpty(req.headers["authorization"] || "")) {
      return AuthValidator.returnFailedError(
        "Authentication credential is required",
        1010302
      );
    }
    const tokenParts = req.headers["authorization"].split(" ");
    if (!tokenParts || tokenParts?.length !== 2 || tokenParts[0] !== "Bearer") {
      return AuthValidator.returnFailedError("Unauthorized", 1010303);
    }
    const accessToken = tokenParts[1];

    // Refresh token validation
    if (validator.isEmpty(req.body?.refreshToken || "")) {
      return AuthValidator.returnFailedError(
        "Authentication credential is required",
        1010304
      );
    }
    const refreshToken = req.body?.refreshToken;

    // Validation passed
    return AuthValidator.returnPassedData({
      userId: req.headers["x-client-id"],
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
  }

  static validateResetPassword(req) {
    // User ID validation
    if (validator.isEmpty(req.headers["x-client-id"] || "")) {
      return AuthValidator.returnFailedError("Client ID is required", 1011401);
    }

    // Access token validation
    if (validator.isEmpty(req.headers["authorization"] || "")) {
      return AuthValidator.returnFailedError(
        "Authentication credential is required",
        1011402
      );
    }
    const tokenParts = req.headers["authorization"].split(" ");
    if (!tokenParts || tokenParts?.length !== 2 || tokenParts[0] !== "Bearer") {
      return AuthValidator.returnFailedError("Unauthorized", 1011403);
    }
    const resetPasswordToken = tokenParts[1];
    // Password validation
    if (validator.isEmpty(req.body?.newPassword || "")) {
      return AuthValidator.returnFailedError("Password is required", 1011404);
    }

    if (!validator.isLength(req.body?.newPassword, { min: 3 })) {
      return AuthValidator.returnFailedError(
        "Password must be at least 3 characters long",
        1011405
      );
    }

    //Confirm new password validation
    if (validator.isEmpty(req.body?.confirmNewPassword || "")) {
      return AuthValidator.returnFailedError(
        "Confirm password is required",
        1011406
      );
    }
    if (req.body?.newPassword !== req.body?.confirmNewPassword) {
      return AuthValidator.returnFailedError(
        "Password does not match",
        1011407
      );
    }

    // Validation passed
    return AuthValidator.returnPassedData({
      userId: req.headers["x-client-id"],
      resetPasswordToken: resetPasswordToken,
      newPassword: req.body?.newPassword,
    });
  }

  static async validateVerifyEmail(req) {
    if (validator.isEmpty(req.body?.email || "")) {
      return AuthValidator.returnFailedError("Email is required", 1010401);
    }
    if (!validator.isEmail(req.body?.email)) {
      return AuthValidator.returnFailedError("Invalid email format", 1010402);
    }

    // Validation passed
    return AuthValidator.returnPassedData({
      userEmail: req.body?.email,
    });
  }

  static async validateVerifyOTP(req) {
    // User identification
    if (validator.isEmpty(req.body?.email || "")) {
      return AuthValidator.returnFailedError("Email is required", 1010501);
    }
    if (!validator.isEmail(req.body?.email)) {
      return AuthValidator.returnFailedError("Invalid email format", 1010502);
    }
    // OTP validation
    if (validator.isEmpty(req.body?.otp || "")) {
      return AuthValidator.returnFailedError("OTP is required", 1010503);
    } else if (!validator.isLength(req.body?.otp, { min: 6, max: 6 })) {
      return AuthValidator.returnFailedError(
        "OTP must be 6 characters long",
        1010504
      );
    }

    // Validation passed
    return AuthValidator.returnPassedData({
      userEmail: req.body?.email,
      otp: req.body?.otp,
    });
  }

  static validateGoogleLogin(req) {
    if (validator.isEmpty(req?.body.id_token || "")) {
      return AuthValidator.returnFailedError(
        "Google ID Token not found",
        1010601
      );
    }
    return AuthValidator.returnPassedData({
      idToken: req.body.id_token,
    });
  }

  static validateLogout(req) {
    // Have checked the access token in the access middleware
    // Validation passed
    return AuthValidator.returnPassedData({
      user: req.user,
    });
  }
}

module.exports = AuthValidator;
