import { Router } from "express";
import authRouter from "@/entities/auth/auth.route";
import userRouter from "@/entities/user/user.route";
import filesRouter from "@/entities/file/file.route";

export const apiRoutes = Router();

apiRoutes.use("/auth", authRouter);
apiRoutes.use("/users", userRouter);
apiRoutes.use("/files", filesRouter);
