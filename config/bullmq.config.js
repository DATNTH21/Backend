const bullMQConfig =
  process.env.NODE_ENV === "production"
    ? {
        connection: {
          host: process.env.UPSTASH_REDIS_ENDPOINT,
          port: 6379,
          password: process.env.UPSTASH_REDIS_PASSWORD,
          tls: {},
        },
      }
    : { connection: { host: "redis", port: 6379 } };

module.exports = bullMQConfig;
