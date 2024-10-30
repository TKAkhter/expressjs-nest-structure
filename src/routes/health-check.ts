import { NextFunction, Request, Response, Router } from "express";
import knex from "../database/knex";
import redis from "../common/redis/redis";

export const healthCheckRouter = Router();

const formatMemoryUsage = () => {
    const memoryUsage = process.memoryUsage();
    return {
        rss: memoryUsage.rss / 1024 / 1024,
        heapTotal: memoryUsage.heapTotal / 1024 / 1024,
        heapUsed: memoryUsage.heapUsed / 1024 / 1024,
        external: memoryUsage.external / 1024 / 1024,
    };
};

const createHealthCheckResponse = (status: string, healthCheck: any) => ({
    status,
    details: healthCheck,
});

healthCheckRouter.get("/", async (_: Request, res: Response, next: NextFunction) => {
    const healthCheck = {
        pg: { status: "unknown", details: {} },
        redis: { status: "unknown", details: {} },
        server: {
            status: "healthy",
            uptime: process.uptime(),
            memoryUsage: formatMemoryUsage(),
        },
    };

    try {
        // Check PostgreSQL health
        await knex.raw("SELECT 1+1 AS result");
        healthCheck.pg.status = "healthy";

        // Check Redis health
        await redis.ping();
        healthCheck.redis.status = "healthy";

        res.status(200).json(createHealthCheckResponse("healthy", healthCheck));
    } catch (error) {
        next(error);
    }
});