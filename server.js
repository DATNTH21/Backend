const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥");
  console.log(err);
  // console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config();

const app = require("./app");

const DB = process.env.MONGO_DB.replace(
  "<PASSWORD>",
  process.env.MONGO_PASSWORD
);
mongoose.connect(DB).then(() => console.log("DB connection successful!"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥");
  console.log(err);
  // console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
