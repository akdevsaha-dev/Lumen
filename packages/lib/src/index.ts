import { createClient, type RedisClientType } from "redis";

const getRedisUrl = () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    if (process.env.RENDER || process.env.NODE_ENV === "production") {
      console.warn("CRITICAL: REDIS_URL is missing in production environment!");
      return "redis://REDIS_URL_MISSING:6379";
    }
    return "redis://localhost:6379";
  }
  return url;
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
