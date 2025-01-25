const ErrorResponseCore = require('../response/error/core.error.response');

const sendErrorProd = (err, req, res) => {
  // Handle Operational Errors
  if (err instanceof ErrorResponseCore) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
      code: err.code,
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

  sendErrorProd(error, req, res);
};