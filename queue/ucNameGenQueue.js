const Bull = require("bull");

const ucNameGenQueue = new Bull("uc-name-gen-queue", {
  redis: {
    host: "redis",
    port: 6379,
  },
});

module.exports = ucNameGenQueue;
