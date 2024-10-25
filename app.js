const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const morgan = require("morgan");
const passport = require("passport");

const usecasesRouter = require("./routes/usecasesRoutes");
const authRouter = require("./routes/authRoutes");
const cors = require("cors");

const app = express();

app.use(morgan("dev"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.options("*", cors());

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB.replace(
        "<PASSWORD>",
        process.env.MONGO_PASSWORD
      ),
      ttl: 24 * 60 * 60, // 24 hours
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/v1/usecases", usecasesRouter);
app.use("/", authRouter);
app.get("/usecase", (req, res) => {
  res.render("usecase");
});

app.get("/", (req, res) => {
  res.send(
    `<h1>Home</h1>
    <div>
    <p><a href="/usecase">Generate use case tests</a></p>
    <p><a href="/login">Log in with Google</a></p>
    </div>`
  );
});

module.exports = app;
