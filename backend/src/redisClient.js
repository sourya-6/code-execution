// const redis = require("redis");

// const client = redis.createClient({
//     host: process.env.REDIS_HOST || "localhost",
//     port: process.env.REDIS_PORT || 6379,
// });

// client.on("error", (err) => console.error("Redis Error:", err));

// module.exports = client;

const { createClient } = require("redis");

const redisClient = createClient({
    url: "redis://redis:6379" // This should match your Docker Redis service name
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
    await redisClient.connect();
})();

module.exports = redisClient;
