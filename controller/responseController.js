/**
 * Helper function to send a consistent response from the server.
 *
 * @param {Object} res - Express response object.
 * @param {number} statusCode - HTTP status code (e.g., 200, 404, 500).
 * @param {string} message - A descriptive message for the response.
 * @param {Object|Array|null} [data=null] - The data to send in the response (optional).
 * @param {string|null} [error=null] - An error message if applicable (optional).
 */
const sendResponse = (
  res,
  statusCode,
  message,
  data = undefined,
  error = undefined
) => {
  const response = {
    status: statusCode < 400 ? "success" : "error",
    message,
  };

  if (data !== undefined) response.data = data;
  if (error !== undefined) response.error = error;

  res.status(statusCode).json(response);
};

module.exports = sendResponse;
