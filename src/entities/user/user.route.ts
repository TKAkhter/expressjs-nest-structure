import { CreateUserSchema, UpdateUserSchema, UserSchema } from "./user.dto";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../middlewares";
import { createApiResponse } from "../../common/swagger/swagger-response-builder";
import { zodValidation } from "../../middlewares/zod-validation";
import { z } from "zod";
import express from "express";
import { FindByQuerySchema } from "../../schemas/find-by-query";

const userRouter = express.Router();
userRouter.use(authMiddleware);

export const userRegistry = new OpenAPIRegistry();
const userController = new UserController();

userRegistry.register("User", UserSchema);

userRegistry.registerPath({
  method: "get",
  path: "/users",
  summary: "Get all users",
  tags: ["User"],
  responses: createApiResponse(z.array(UserSchema), "Success"),
});
userRouter.get("/", userController.getAllUsers);

userRegistry.registerPath({
  method: "get",
  path: "/users/{id}",
  tags: ["User"],
  summary: "Get a single user",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(UserSchema, "Success"),
});
userRouter.get("/:id", userController.getUser);

userRegistry.registerPath({
  method: "get",
  path: "/users/username/{username}",
  tags: ["User"],
  summary: "Get user by username",
  request: {
    params: z.object({ username: z.string() }),
  },
  responses: createApiResponse(UserSchema, "Success"),
});
userRouter.get("/username/:username", userController.getUserByUsername);

userRegistry.registerPath({
  method: "post",
  path: "/users/find",
  tags: ["User"],
  request: {
    body: {
      content: { "application/json": { schema: FindByQuerySchema } },
    },
  },
  responses: createApiResponse(z.array(FindByQuerySchema), "Success"),
});
userRouter.post("/find", zodValidation(FindByQuerySchema), userController.findByQuery);

userRegistry.registerPath({
  method: "post",
  path: "/users",
  tags: ["User"],
  request: {
    body: {
      content: { "application/json": { schema: CreateUserSchema } },
    },
  },
  responses: createApiResponse(CreateUserSchema, "User Created Successfully"),
});
userRouter.post("/", zodValidation(CreateUserSchema), userController.createUser);

userRegistry.registerPath({
  method: "put",
  path: "/users/{id}",
  tags: ["User"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { "application/json": { schema: UpdateUserSchema } },
    },
  },
  responses: createApiResponse(UpdateUserSchema, "User Updated Successfully"),
});
userRouter.put("/:id", zodValidation(UpdateUserSchema), userController.updateUser);

userRegistry.registerPath({
  method: "delete",
  path: "/users",
  tags: ["User"],
  request: {
    body: {
      content: { "application/json": { schema: z.object({ ids: z.array(z.string()) }) } },
    },
  },
  responses: createApiResponse(z.null(), "Users Deleted Successfully"),
});

userRouter.delete(
  "/",
  zodValidation(z.object({ ids: z.array(z.string()) })),
  userController.deleteAllUsers,
);

userRegistry.registerPath({
  method: "delete",
  path: "/users/{id}",
  tags: ["User"],
  summary: "Delete user",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(z.null(), "User Deleted Successfully"),
});
userRouter.delete("/:id", userController.deleteUser);

export default userRouter;
