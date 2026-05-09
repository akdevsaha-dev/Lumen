import { Queue } from "bullmq";

const getRedisConnection = () => {
  const url = process.env.REDIS_URL;
  const isProd = process.env.RENDER || process.env.NODE_ENV === "production";

  if (url && url !== "undefined" && url !== "null") {
    try {
      const parsed = new URL(url);
      console.log(`[BullMQ] Initializing connection to ${parsed.hostname}:${parsed.port || 6379} (TLS: ${parsed.protocol === "rediss:"})`);
      
      return {
        host: parsed.hostname,
        port: Number(parsed.port) || 6379,
        password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
        username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
        tls: parsed.protocol === "rediss:" ? {
          rejectUnauthorized: false
        } : undefined,
        maxRetriesPerRequest: null,
      };
    } catch (e) {
      console.error("[BullMQ] Failed to parse REDIS_URL, falling back to string:", e);
      return url;
    }
  }

  const errorMsg = `FATAL ERROR: REDIS_URL missing for BullMQ! (RENDER=${process.env.RENDER}, NODE_ENV=${process.env.NODE_ENV})`;
  console.error(errorMsg);
  
  if (isProd) {
    throw new Error(errorMsg);
  }

  return { host: "REDIS_NOT_CONFIGURED", port: 6379, maxRetriesPerRequest: null };
};

export const redisConnection = getRedisConnection();

export const auditQueue = new Queue("audit", {
  connection: redisConnection as any,
});

auditQueue.on("error", (err) => {
  console.error("BullMQ Queue Error:", err.message);
});
