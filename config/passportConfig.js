const passport = require('passport');
const { Strategy: GitHubStrategy } = require('passport-github2');
// GitHub App Credentials
const GITHUB_CLIENT_ID = 'Ov23ctqDPCMLRIKT7KEo';
const GITHUB_CLIENT_SECRET = 'b07c048497c272b3e17a1cec7f17212f63b9f316';
// GitHub strategy setup
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback",
    scope: ['user:email', 'repo']
}, (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    return done(null, profile);
}));
// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));