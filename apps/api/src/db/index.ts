import { db } from "@auth-apps/db";
import { Redis } from "ioredis";

// Create Redis connection
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Handle Redis connection errors
redis.on("error", (err) => {
    console.error("Redis connection error:", err);
});

type Database = typeof db;

export { db, redis, type Database }; 