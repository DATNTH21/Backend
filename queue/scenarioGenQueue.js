const { Queue } = require("bullmq");
const bullMQConfig = require("../config/bullmq.config");

const scenarioGenQueue = new Queue("scenario-gen-queue", bullMQConfig);

module.exports = scenarioGenQueue;
