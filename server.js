const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥");
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config();

const app = require("./app");

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥");
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
