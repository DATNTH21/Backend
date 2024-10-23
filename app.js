const path = require("path");
const express = require("express");

const usecasesRouter = require("./routes/usecasesRoutes");
const cors = require("cors");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.options("*", cors());

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Routes
app.use("/api/v1/usecases", usecasesRouter);
app.get("/usecase", (req, res) => {
  res.render("usecase");
});

app.get("/", (req, res) => {
  res.send(
    `<h1>Home</h1>
    <div>
    <p><a href="/usecase">Generate use case tests</a></p>
    </div>`
  );
});

module.exports = app;
