import { Router } from "express";
import userRoutes from "../entities/user/user.route";
import { healthCheckRouter } from "../entities/health-check/health-check";

export const apiRoutes = Router();
// AuthMiddleware

apiRoutes.use("/", healthCheckRouter);
apiRoutes.use("/users", userRoutes);
