import { env } from "@/config/env";
import redis from "@/config/redis/redis";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateCache = async (cacheKey: any, data: any) => {
  if (cacheKey) {
    await redis.set(cacheKey, JSON.stringify(data), "EX", Number(env.REDIS_CACHE_TIME));
  }
};
