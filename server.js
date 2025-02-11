const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { initializeSocket } = require("./socket");
const initializeCounters = require("./scripts/initCounters");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥");
  console.log(err);
  // console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config();

const app = require("./app");
const httpServer = require("http").createServer(app);
const DB = process.env.MONGO_DB.replace(
  "<PASSWORD>",
  process.env.MONGO_PASSWORD
).replace("<YOUR_USERNAME>", process.env.YOUR_USERNAME);
mongoose.connect(DB).then(() => {
  console.log("DB connection successful!");
  initializeCounters();
});

const io = initializeSocket(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const { userId } = socket.handshake.auth;
  console.log("userId: ", userId);
  next();
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥");
  console.log(err);
  // console.log(err.name, err.message);

  httpServer.close(() => {
    process.exit(1);
  });
});
