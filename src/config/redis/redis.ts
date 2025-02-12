import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/common/winston/winston";

class RedisClient {
  private static instance: Redis;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(env.REDIS_URL);
      RedisClient.instance.on("connect", () => logger.info("Redis connected"));
      RedisClient.instance.on("end", () => logger.info("Redis disconnected"));
    }
    return RedisClient.instance;
  }

  static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      RedisClient.instance = undefined as any;
    }
  }
}

export { RedisClient };
