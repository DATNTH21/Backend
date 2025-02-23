const { Queue } = require("bullmq");
const bullMQConfig = require("../config/bullmq.config");

const testGenQueue = new Queue("test-gen-queue", bullMQConfig);

module.exports = testGenQueue;
