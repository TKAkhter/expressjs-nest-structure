import { Router } from "express";
import authRouter from "@/entities/auth/auth.route";
import userRouter from "@/entities/user/user.route";
import filesRouter from "@/entities/file/file.route";
import { cacheMiddleware } from "@/middlewares/cache-middleware";
import healthRouter from "@/entities/health/health.route";

export const apiRoutes = Router();

apiRoutes.use("/health", healthRouter);
apiRoutes.use("/auth", cacheMiddleware, authRouter);
apiRoutes.use("/users", cacheMiddleware, userRouter);
apiRoutes.use("/files", cacheMiddleware, filesRouter);
