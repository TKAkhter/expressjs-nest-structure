import { Request, Response, Router } from "express";
import userRoutes from "../entities/user/user.route";
import knex from "../database/knex";
import redis from "../common/redis/redis";
import { healthCheckRouter } from "./health-check";

export const apiRoutes = Router();
// authMiddleware

apiRoutes.use("/", healthCheckRouter);
apiRoutes.use("/user", userRoutes);