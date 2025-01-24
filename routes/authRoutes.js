const AuthController = require("../controller/auth.controller");
const handleAsync = require("../utils/catchAsync");
const AccessMiddleware = require("../middlewares/access.middleware");

const router = require("express").Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for user authentication and account management
 */

/**
 * @swagger
 * /api/v1/signup:
 *   post:
 *     summary: Registers a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Bad request
 */
router.post("/signup", handleAsync(AuthController.handleSignup));

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Logs in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", handleAsync(AuthController.handleLogin));

/**
 * @swagger
 * /api/v1/invoke-new-tokens:
 *   post:
 *     summary: Refreshes authentication tokens
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/invoke-new-tokens",
  handleAsync(AuthController.handleInvokeNewTokens)
);

/**
 * @swagger
 * /api/v1/verify/send-otp:
 *   post:
 *     summary: Sends an OTP to verify email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Failed to send OTP
 */
router.post("/verify/send-otp", handleAsync(AuthController.handleVerifyEmail));

/**
 * @swagger
 * /api/v1/verify/confirm-otp:
 *   post:
 *     summary: Confirms OTP for email verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP confirmed successfully
 *       400:
 *         description: Invalid OTP
 */
router.post("/verify/confirm-otp", handleAsync(AuthController.handleVerifyOTP));

/**
 * @swagger
 * /api/v1/google/auth:
 *   post:
 *     summary: Logs in a user using Google authentication
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Google login successful
 *       400:
 *         description: Google login failed
 */
router.post(
  "/google/auth",
  handleAsync(AuthController.handleLoginWithGoogle)
);

/**
 * @swagger
 * /api/v1/reset-password/send-otp:
 *   post:
 *     summary: Sends an OTP to reset password
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Failed to send OTP
 */
router.post(
  "/reset-password/send-otp",
  handleAsync(AuthController.handleSendOTPToResetPassword)
);

/**
 * @swagger
 * /api/v1/reset-password/confirm-otp:
 *   post:
 *     summary: Confirms OTP for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP confirmed successfully
 *       400:
 *         description: Invalid OTP
 */
router.post(
  "/reset-password/confirm-otp",
  handleAsync(AuthController.handleConfirmOTPToResetPassword)
);

/**
 * @swagger
 * /api/v1/reset-password:
 *   post:
 *     summary: Resets the user's password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Password reset failed
 */
router.post(
  "/reset-password",
  handleAsync(AuthController.handleResetPassword)
);

/**
 * @swagger
 * /api/v1/logout:
 *   post:
 *     summary: Logs out the user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/logout",
  handleAsync(AccessMiddleware.checkAccess),
  handleAsync(AuthController.handleLogout)
);

module.exports = router;
