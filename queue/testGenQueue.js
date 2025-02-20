const Bull = require("bull");

const testGenQueue = new Bull("test-gen-queue", {
  redis: {
    host: "redis",
    port: 6379,
  },
});

module.exports = testGenQueue;
