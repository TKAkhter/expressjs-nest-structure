import { Router } from "express";
import userRoutes from "../entities/user/user.routes";

export const apiRoutes = Router();

apiRoutes.use("/user", userRoutes);
