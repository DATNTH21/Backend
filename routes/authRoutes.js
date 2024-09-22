const express = require("express");
const passport = require("passport");
require("../config/passportConfig"); // Import GitHub passport strategy

const router = express.Router();

// GitHub login route
router.get("/github", passport.authenticate("github"));

// GitHub callback route
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  async (req, res) => {
    res.redirect("/repo/list");
  }
);

module.exports = router;
