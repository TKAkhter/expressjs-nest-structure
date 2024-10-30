import express from "express";
import { createUser } from "./user.controller";
import { createUserSchema } from "./user.dto";
import { zodValidation } from "../../middlewares/zod-validation";

const router = express.Router();

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Retrieve a list of users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: John Doe
 */
router.post("/", zodValidation(createUserSchema), createUser);

export default router;
