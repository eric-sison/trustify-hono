import { Redis } from "ioredis";

export const redis = new Redis(6379, Bun.env.REDIS_HOST!!, {
  username: Bun.env.REDIS_USER,
  password: Bun.env.REDIS_PASS,
  enableReadyCheck: true,
  maxRetriesPerRequest: 5,
  retryStrategy: (times) => Math.min(times * 50, 500),
});

redis.on("error", (err) => console.log(err));
