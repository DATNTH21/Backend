const { Queue } = require("bullmq");
const bullMQConfig = require("../config/bullmq.config");

const ucNameGenQueue = new Queue("uc-name-gen-queue", bullMQConfig);
ucNameGenQueue.on("ready", () => {
  console.log("BullMQ is connected to Redis!");
});

ucNameGenQueue.on("error", (err) => {
  console.error("Error connecting to Redis:", err);
});
module.exports = ucNameGenQueue;
