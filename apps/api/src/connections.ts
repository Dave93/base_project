
import { Redis } from "ioredis";

// Create Redis connection
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    keyPrefix: "auth-apps-api:",
});

// Handle Redis connection errors
redis.on("error", (err) => {
    console.error("Redis connection error:", err);
});

export { redis }; 