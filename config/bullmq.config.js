const bullMQConfig =
  process.env.NODE_ENV === "production"
    ? {
        connection: {
          username: process.env.REDIS_CLOUD_USERNAME,
          password: process.env.REDIS_CLOUD_PASSWORD,
          host: process.env.REDIS_CLOUD_ENDPOINT,
          port: Number(process.env.REDIS_CLOUD_PORT),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }
    : { connection: { host: "redis", port: 6379 } };
module.exports = bullMQConfig;
