const jwt = require("jsonwebtoken");
const Session = require("../models/sessionModel");
const generateAllTokens = async (user) => {
  try {
    const payload = { _id: user._id };

    // Generate access token with expiration time
    const accessTokenExp =
      Math.floor(Date.now() / 1000) +
      process.env.JWT_ACCESS_TOKEN_EXPIRES_IN * 60; // Set expiration to 15 minutes from now
    const accessToken = jwt.sign(
      { ...payload, exp: accessTokenExp },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY
      // { expiresIn: "15m" }
    );

    // Generate refresh token with expiration time
    const refreshTokenExp =
      Math.floor(Date.now() / 1000) +
      60 * 60 * 24 * process.env.JWT_REFRESH_TOKEN_EXPIRES_IN; // Set expiration to 5 days from now
    const refreshToken = jwt.sign(
      { ...payload, exp: refreshTokenExp },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY
      // { expiresIn: "5d" }
    );

    await Session.findOneAndDelete({
      userId: user._id,
    });

    // Save New Refresh Token
    await new Session({
      userId: user._id,
      token: refreshToken,
    }).save();

    return Promise.resolve({
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp,
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const generateAccessToken = (userId) => {
  const payload = { _id: userId };

  // Generate access token with expiration time
  const accessTokenExp =
    Math.floor(Date.now() / 1000) +
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN * 60; // Set expiration to 15 minutes from now
  const accessToken = jwt.sign(
    { ...payload, exp: accessTokenExp },
    process.env.JWT_ACCESS_TOKEN_SECRET_KEY
    // { expiresIn: "15m" }
  );

  return accessToken;
};

exports.generateAllTokens = generateAllTokens;
exports.generateAccessToken = generateAccessToken;
