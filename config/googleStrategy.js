const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/userModel");
const {
  generateRefreshToken,
  generateAccessToken,
} = require("../utils/generateTokens");
require('dotenv').config();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new User();
          user.set("name", profile.displayName);
          user.set("email", profile.emails[0].value);
          user.set("isVerified", true);
          // user.set('photo', profile.photos[0].value);
          await user.save({ validateBeforeSave: false });
        }
        // // Generate JWT tokens
        const { refreshToken, refreshTokenExp } = await generateRefreshToken(
          user._id
        );
        const { accessToken, accessTokenExp } = generateAccessToken(user._id);

        return done(null, {
          user,
          accessToken,
          refreshToken,
          accessTokenExp,
          refreshTokenExp,
        });
      } catch (err) {
        done(err, null);
      }
    }
  )
);
