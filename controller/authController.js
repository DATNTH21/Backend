const passport = require("passport");
const GoogleStrategy = require("passport-google-oidc");
const User = require("../models/userModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/oauth2/redirect/google",
      scope: ["profile", "email"],
    },
    async function verify(issuer, profile, cb) {
      console.log(profile);
      try {
        const user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          return cb(null, user);
        }
        const newUser = new User();
        newUser.set("name", profile.displayName);
        newUser.set("email", profile.emails[0].value);
        // newUser.set('photo', profile.photos[0].value);
        await newUser.save({ validateBeforeSave: false });
        return cb(null, newUser);
      } catch (err) {
        cb(err);
      }
    }
  )
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { email: user.email, name: user.name });
  });
  // cb(null, { email: user.email, name: user.name });
});

passport.deserializeUser(function (user, cb) {
  console.log("hello from deserialize user");
  process.nextTick(function () {
    return cb(null, user);
  });
  // return cb(null, user);
});

exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
