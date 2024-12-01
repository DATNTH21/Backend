const express = require("express");
const passport = require("passport");
const authController = require("../controller/authController");
const setTokenCookies = require("../utils/setTokenCookies");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: The authentication API for registering, logging in, and managing users.
 */

/**
 * @swagger
 * /login/federated/google:
 *   get:
 *     summary: Initiates Google login
 *     description: Redirects to Google for federated authentication
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Redirects to Google authentication page
 *       400:
 *         description: Bad request
 */
router.get(
  "/login/federated/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback from Google authentication
 *     description: Handles the Google authentication callback and sets tokens in cookies
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to the home page after successful login
 *       401:
 *         description: Unauthorized access
 */
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:3000/login",
  }),
  (req, res) => {
    // Access user object and tokens from req.user
    const { user, accessToken, refreshToken, refreshTokenExp } = req.user;
    setTokenCookies(res, accessToken, refreshToken, refreshTokenExp);

    res.redirect("http://localhost:3000/all-project");
  }
);

/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     summary: Registers a new user
 *     description: Creates a new user account
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
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post("/api/v1/register", authController.registerUser);

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Logs in an existing user
 *     description: Authenticates a user and returns an authentication token
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
 *         description: Login successful, returns user and token
 *       400:
 *         description: Invalid credentials
 */
router.post("/api/v1/login", authController.loginUser);

/**
 * @swagger
 * /confirmation/{token}:
 *   get:
 *     summary: Confirms user signup
 *     description: Confirms the user's signup using a token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The confirmation token
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Confirmation successful
 *       400:
 *         description: Invalid token
 */
router.get("/confirmation/:token", authController.confirmSignup);

/**
 * @swagger
 * /authenticate:
 *   get:
 *     summary: Checks if the user is logged in
 *     description: Verifies if the user is authenticated
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User is authenticated
 *       401:
 *         description: User is not authenticated
 */
router.get("/authenticate", authController.isLoggedIn);

/**
 * @swagger
 * /api/v1/logout:
 *   post:
 *     summary: Logs out the user
 *     description: Logs out the current authenticated user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/api/v1/logout", authController.logout);

module.exports = router;
