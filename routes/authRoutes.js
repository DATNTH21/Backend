const express = require("express");
const passport = require("passport");
const authController = require("../controller/authController");
const setTokenCookies = require("../utils/setTokenCookies");

const router = express.Router();

router.get(
  "/login/federated/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);

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

router.post("/api/v1/register", authController.registerUser);
router.post("/api/v1/login", authController.loginUser);
router.get("/confirmation/:token", authController.confirmSignup);
router.get("/authenticate", authController.isLoggedIn);

module.exports = router;
