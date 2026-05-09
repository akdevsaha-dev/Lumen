import { createClient, type RedisClientType } from "redis";

const getRedisUrl = () => {
  const url = process.env.REDIS_URL;
  const isProd = process.env.RENDER || process.env.NODE_ENV === "production";

  if (url && url !== "undefined" && url !== "null") {
    try {
      const parsed = new URL(url);
      console.log(`[Redis] Found REDIS_URL, host: ${parsed.hostname}, port: ${parsed.port || 6379}`);
      return url;
    } catch (e) {
      console.warn(`[Redis] Found REDIS_URL but it is not a valid URL: ${url}`);
      return url;
    }
  }

  const errorMsg = `FATAL ERROR: REDIS_URL is missing or invalid! (RENDER=${process.env.RENDER}, NODE_ENV=${process.env.NODE_ENV})`;
  console.error(errorMsg);
  
  if (isProd) {
    throw new Error(errorMsg);
  }

  console.warn(
    "WARNING: No REDIS_URL found, using dummy fallback (NOT localhost)",
  );
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
