import { Router, Request, Response, NextFunction } from "express";
import { checkMongoDB, checkPostgres, checkRedis } from "./health-check-services-status";
import { createHealthCheckResponse, formatMemoryUsage } from "./health-check-helper";
import { createApiResponse } from "../../common/swagger/swagger-response-builder";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const healthCheckRouter = Router();

export const healthCheckRegistry = new OpenAPIRegistry();

healthCheckRegistry.register("HealthCheck", z.object({}));

healthCheckRegistry.registerPath({
  method: "get",
  path: "/",
  summary: "Get health check",
  tags: ["HealthCheck"],
  security: [],
  responses: createApiResponse(z.array(z.object({})), "Success"),
});

healthCheckRouter.get("/", async (_: Request, res: Response, next: NextFunction) => {
  try {
    const healthCheck = {
      pg: await checkPostgres(),
      redis: await checkRedis(),
      mongo: checkMongoDB(),
      server: {
        status: "healthy",
        uptime: process.uptime(),
        memoryUsage: formatMemoryUsage(),
      },
    };

    const overallStatus = Object.values(healthCheck)
      .map((service) => service.status)
      .includes("unhealthy")
      ? "unhealthy"
      : "healthy";

    res
      .status(overallStatus === "healthy" ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR)
      .json(createHealthCheckResponse(overallStatus, healthCheck));
  } catch (error) {
    next(error);
  }
});
