import { Queue } from "bullmq";

const getRedisConnection = () => {
  const url = process.env.REDIS_URL;
  if (url) {
    console.log("[BullMQ] Found REDIS_URL, initializing connection...");
    return url;
  }

  const errorMsg = "FATAL ERROR: REDIS_URL missing for BullMQ in environment!";
  console.error(errorMsg);
  
  if (process.env.RENDER || process.env.NODE_ENV === "production") {
    throw new Error(errorMsg);
  }

  return { host: "REDIS_NOT_CONFIGURED", port: 6379 };
};

export const redisConnection = getRedisConnection();

export const auditQueue = new Queue("audit", {
  connection: redisConnection as any,
});

auditQueue.on("error", (err) => {
  console.error("BullMQ Queue Error:", err.message);
});
