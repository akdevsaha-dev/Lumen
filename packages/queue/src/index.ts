import { Queue } from "bullmq";

const getRedisConnection = () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    if (process.env.RENDER || process.env.NODE_ENV === "production") {
      console.warn("CRITICAL: REDIS_URL missing for BullMQ in production!");
      return { host: "REDIS_URL_MISSING", port: 6379 };
    }
    return { host: "localhost", port: 6379 };
  }
  return url;
};

export const redisConnection = getRedisConnection();

export const auditQueue = new Queue("audit", {
  connection: redisConnection as any,
});
