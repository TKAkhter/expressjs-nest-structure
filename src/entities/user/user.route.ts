import { CreateUserSchema, UpdateUserSchema, UserSchema } from "./user.dto";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../middlewares";
import { createApiResponse } from "../../common/swagger/swagger-response-builder";
import { zodValidation } from "../../middlewares/zod-validation";
import { z } from "zod";
import { FindByQuerySchema } from "../../schemas/find-by-query";
import { Router } from "express";

const accountsRouter = Router();
accountsRouter.use(authMiddleware);

const TAG = "User";
const ROUTE = `/${TAG.toLowerCase()}s`;

export const userRegistry = new OpenAPIRegistry();
const userController = new UserController();

userRegistry.register(TAG, UserSchema);

userRegistry.registerPath({
  method: "get",
  path: ROUTE,
  summary: `Get all ${TAG}`,
  tags: [TAG],
  responses: createApiResponse(z.array(UserSchema), "Success"),
});
accountsRouter.get("/", userController.getAll);

//====================================================================================================

userRegistry.registerPath({
  method: "get",
  path: `${ROUTE}/{uuid}`,
  tags: [TAG],
  summary: `Get ${TAG} by uuid`,
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(UserSchema, "Success"),
});
accountsRouter.get("/:uuid", userController.getByUuid);

//====================================================================================================

userRegistry.registerPath({
  method: "get",
  path: `${ROUTE}/email/{email}`,
  tags: [TAG],
  summary: `Get ${TAG} by email`,
  request: {
    params: z.object({ email: z.string() }),
  },
  responses: createApiResponse(UserSchema, "Success"),
});
accountsRouter.get("/email/:email", userController.getByEmail);

//====================================================================================================

userRegistry.registerPath({
  method: "post",
  path: `${ROUTE}/find`,
  tags: [TAG],
  summary: `Find ${TAG} by query`,
  request: {
    body: {
      content: { "application/json": { schema: FindByQuerySchema } },
    },
  },
  responses: createApiResponse(z.array(FindByQuerySchema), "Success"),
});
accountsRouter.post("/find", zodValidation(FindByQuerySchema), userController.findByQuery);

//====================================================================================================

userRegistry.registerPath({
  method: "post",
  path: ROUTE,
  tags: [TAG],
  summary: `Create ${TAG}`,
  request: {
    body: {
      content: { "application/json": { schema: CreateUserSchema } },
    },
  },
  responses: createApiResponse(CreateUserSchema, `${TAG} Created Successfully`),
});
accountsRouter.post("/", zodValidation(CreateUserSchema), userController.create);

//====================================================================================================

userRegistry.registerPath({
  method: "put",
  path: `${ROUTE}/{id}`,
  tags: [TAG],
  summary: `Update ${TAG}`,
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { "application/json": { schema: UpdateUserSchema } },
    },
  },
  responses: createApiResponse(UpdateUserSchema, `${TAG} Updated Successfully`),
});
accountsRouter.put("/:id", zodValidation(UpdateUserSchema), userController.update);

//====================================================================================================

userRegistry.registerPath({
  method: "delete",
  path: ROUTE,
  tags: [TAG],
  summary: `Delete ${TAG}s`,
  request: {
    body: {
      content: { "application/json": { schema: z.object({ ids: z.array(z.string()) }) } },
    },
  },
  responses: createApiResponse(z.null(), `${TAG}s Deleted Successfully`),
});
accountsRouter.delete(
  "/",
  zodValidation(z.object({ ids: z.array(z.string()) })),
  userController.deleteAll,
);

//====================================================================================================

userRegistry.registerPath({
  method: "delete",
  path: `${ROUTE}/{id}`,
  tags: [TAG],
  summary: `Delete ${TAG}`,
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(z.null(), `${TAG} Deleted Successfully`),
});
accountsRouter.delete("/:id", userController.delete);

export default accountsRouter;
