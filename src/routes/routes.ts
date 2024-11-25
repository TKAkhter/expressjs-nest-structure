import { Router } from "express";
import { healthCheckRouter } from "../entities/health-check/health-check";
import userRoutes from "../entities/user/user.route";

export const apiRoutes = Router();
// AuthMiddleware

apiRoutes.use("/", healthCheckRouter);
apiRoutes.use("/users", userRoutes);
