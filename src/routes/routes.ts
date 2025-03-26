import { Router } from "express";
import authRouter from "@/entities/auth/auth.route";
import userRouter from "@/entities/user/user.route";
import fileRouter from "@/entities/file/file.route";
import healthRouter from "@/entities/health/health.route";

export const apiRoutes = Router();

apiRoutes.use("/health", healthRouter);
apiRoutes.use("/auth", authRouter);
apiRoutes.use("/user", userRouter);
apiRoutes.use("/file", fileRouter);
