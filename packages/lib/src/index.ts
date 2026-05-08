import { createClient, type RedisClientType } from "redis";

const getRedisUrl = () => {
  const url = process.env.REDIS_URL;
  if (url) {
    console.log(`[Redis] Found REDIS_URL starting with: ${url.substring(0, 10)}...`);
    return url;
  }
  
  const errorMsg = "FATAL ERROR: REDIS_URL is not defined in the environment variables!";
  console.error(errorMsg);
  // In production/Render, we want to crash so the user knows it's misconfigured
  if (process.env.RENDER || process.env.NODE_ENV === "production") {
    throw new Error(errorMsg);
  }

  console.warn("WARNING: No REDIS_URL found, using dummy fallback (NOT localhost)");
  return "redis://REDIS_NOT_CONFIGURED_CHECK_ENV:6379";
};

export const redis: RedisClientType = createClient({
  url: getRedisUrl(),
});

redis.on("error", (err) => {
  console.error("Redis Connection Error Details:", {
    message: err.message,
    code: (err as any).code,
    host: (err as any).address,
    port: (err as any).port,
  });
});

export const connectRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }
};
