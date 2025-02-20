const Bull = require("bull");

const scenarioGenQueue = new Bull("scenario-gen-queue", {
  redis: {
    host: "redis",
    port: 6379,
  },
});

module.exports = scenarioGenQueue;
