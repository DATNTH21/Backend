const path = require("path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");

const githubAuthRouter = require("./routes/authRoutes");
const repoRouter = require("./routes/repoRoutes");
const usecasesRouter = require("./routes/usecasesRoutes");
const cors = require("cors");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.options("*", cors());

app.use(express.static(path.join(__dirname, "public")));

// Session and passport setup
app.use(
  session({ secret: "secret-key", resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Routes
app.use("/auth", githubAuthRouter);
app.use("/repo", repoRouter);
app.use("/api/v1/usecases", usecasesRouter);
app.get("/usecase", (req, res) => {
  res.render("usecase");
});

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`<h1>Hello, ${req.user.username}</h1>
                  <p><a href="/auth/github">View your GitHub Repos</a></p>
                  <p><a href="/logout">Logout</a></p>`);
  } else {
    res.send(
      `<h1>Home</h1>
      <div>
      <p><a href="/auth/github">Login with GitHub</a></p>
      <p><a href="/usecase">Generate use case tests</a></p>
      </div>`
    );
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

module.exports = app;
