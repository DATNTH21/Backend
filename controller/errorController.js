const AppError = require("../utils/appError");
const verifyRefreshToken = require("../utils/verifyRefreshToken");
const { generateAccessToken } = require("../utils/generateTokens");

const handleTokenExpiredError = async (req, res, next) => {
  console.log("TokenExpiredError 💥");

  try {
    const { tokenDetails } = await verifyRefreshToken(req.cookies.refreshToken);
    const accessToken = generateAccessToken(tokenDetails._id); // renew access token
    // console.log(accessToken);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 15 * 1000),
      // secure: true,
    });

    res.status(200).json({
      status: "success",
      message: "Authenticated",
    });
  } catch (err) {
    return res.status(401).json({
      status: "fail",
      error: err,
      message: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // Operational
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Programming or other unknown error
  console.log("ERROR 💥", err);

  return res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err, message: err.message };

  if (err.name === "TokenExpiredError")
    return handleTokenExpiredError(req, res, next);

  sendErrorProd(error, req, res);
};
