const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

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
).replace("<YOUR_USERNAME>", process.env.YOUR_USERNAME);
mongoose.connect(DB).then(() => console.log("DB connection successful!"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

global.io = io;

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥");
  console.log(err);
  // console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
