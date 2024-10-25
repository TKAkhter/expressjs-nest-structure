import express from "express";
import { createUser } from "./user.controller";
import { createUserSchema } from "./dto/user.dto";
import { validateZod } from "../../middlewares/zod-validation";

const router = express.Router();

router.post("/", validateZod(createUserSchema), createUser);

export default router;
