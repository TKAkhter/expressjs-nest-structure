import { Router } from "express";
import authRouter from "@/entities/auth/auth.route";
import usersRouter from "@/entities/users/users.route";
import filesRouter from "@/entities/files/files.route";
import { cacheMiddleware } from "@/middlewares/cache-middleware";
import healthRouter from "@/entities/health/health.route";

export const apiRoutes = Router();

apiRoutes.use("/health", healthRouter);
apiRoutes.use("/auth", cacheMiddleware, authRouter);
apiRoutes.use("/users", cacheMiddleware, usersRouter);
apiRoutes.use("/files", cacheMiddleware, filesRouter);
