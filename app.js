const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const passport = require("passport");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./utils/swagger"); // Import Swagger configuration

const usecaseRouter = require("./routes/usecaseRoutes");
const scenarioRouter = require("./routes/scenarioRoutes");
const authRouter = require("./routes/authRoutes");
const projectRouter = require("./routes/projectRoutes");
const userRouter = require("./routes/userRoutes");
const testcaseRouter = require("./routes/testcaseRoutes");
const userConfigRouter = require("./routes/userConfig.routes");
require("./config/googleStrategy");

const app = express();

app.use(morgan("dev"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.LOCAL_CLIENT_URL],
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(passport.initialize());
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/scenarios", scenarioRouter);
app.use("/api/v1/use-cases", usecaseRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/testcases", testcaseRouter);
app.use("/api/v1/user-config", userConfigRouter);

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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Catch all undefined routes first
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

//Catch all errors
app.use((error, req, res, next) => {
  const statusCode = error?.status ?? 500;
  const now = new Date();
  const formattedDate = now.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Log the error with the formatted date
  console.error(`[${formattedDate}]`, error);

  return res.status(statusCode).json({
    status: statusCode,
    code: error?.code,
    message: error.message ?? "Internal Server Error",
    errorStack: process.env.NODE_ENV === "dev" ? error?.stack : undefined, //Dev mode only
  });
});

module.exports = app;
