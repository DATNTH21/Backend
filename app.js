const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const passport = require("passport");
const cors = require("cors");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./utils/swagger"); // Import Swagger configuration

const usecasesRouter = require("./routes/usecasesRoutes");
const authRouter = require("./routes/authRoutes");
const projectRouter = require("./routes/projectRoutes");
const userRouter = require("./routes/userRoutes");
const testcaseRouter = require("./routes/testcaseRoutes");
require("./config/googleStrategy");

const app = express();

app.use(morgan("dev"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  cors({
    origin: "http://localhost:3000",
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
app.use("/api/v1/usecases", usecasesRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", projectRouter);
app.use("/api/v1/testcases", testcaseRouter);

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

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
