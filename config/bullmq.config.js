const bullMQConfig =
  process.env.NODE_ENV === "production"
    ? {
        connection: {
          host: process.env.REDIS_CLOUD_ENDPOINT,
          port: process.env.REDIS_CLOUD_PORT,
          username: process.env.REDIS_CLOUD_USERNAME,
          password: process.env.REDIS_CLOUD_PASSWORD,
        },
      }
    : { connection: { host: "redis", port: 6379 } };

module.exports = bullMQConfig;
