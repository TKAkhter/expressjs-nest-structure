import { logger } from "@/common/winston/winston";
import { env } from "@/config/env";
import redis from "@/config/redis/redis";
import { Request, Response, NextFunction } from "express";

export const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  try {
    if (env.ENABLE_CACHE === "1" && req.method === "GET") {
      const cacheKey = `apiResponseCache:${req.originalUrl}`;
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        logger.info(`Cache hit for ${cacheKey}`);
        return res.status(200).json(JSON.parse(cachedData));
      }

      logger.info(`Cache miss for ${cacheKey}`);
      res.locals.cacheKey = cacheKey;
    }
    next();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    logger.error("Redis error:", err);
    next();
  }
};
