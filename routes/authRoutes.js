const express = require("express");
const passport = require("passport");
const authController = require("../controller/authController");

const router = express.Router();

router.get("/login/federated/google", passport.authenticate("google"));

router.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login/",
  })
);

router.post("/logout", authController.logout);

router.get("/login", function (req, res, next) {
  res.render("login");
});

module.exports = router;
