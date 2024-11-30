const jwt = require("jsonwebtoken");
const Session = require("../models/sessionModel");
const AppError = require("./appError");
const { generateRefreshToken } = require("./generateTokens");
const verifyRefreshToken = async (refreshToken) => {
  try {
    const privateKey = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;

    // Find the refresh token document
    const userRefreshToken = await Session.findOne({ token: refreshToken });

    // If refresh token not found, reject with an error
    if (!userRefreshToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    // Verify the refresh token
    const payload = jwt.verify(refreshToken, privateKey);

    // Check if session is about to expire (in 30mins)
    let newRefreshToken;
    if (payload.exp - 30 * 60 <= Date.now() / 1000) {
      const { refreshToken } = await generateRefreshToken(payload._id);
      newRefreshToken = refreshToken;
    }

    // If verification successful, resolve with token details
    return { payload, newRefreshToken };
  } catch (error) {
    throw error;
  }
};

module.exports = verifyRefreshToken;
