import { Router } from "express";
import { uploadMiddleware } from "@/common/multer/multer";
import { FilesController } from "@/entities/files/files.controller";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { updateFilesSchema, uploadFilesSchema } from "@/entities/files/files.dto";
import { createApiResponse } from "@/common/swagger/swagger-response-builder";
import { z } from "zod";
import { authMiddleware, zodValidation } from "@/middlewares";
import { findByQuerySchema } from "@/schemas/find-by-query";
import { fileSchema } from "@/generated/zod";

const filesRouter = Router();
filesRouter.use(authMiddleware);

const TAG = "Files";
const ROUTE = `/${TAG.toLowerCase()}`;

export const filesRegistry = new OpenAPIRegistry();
const filesController = new FilesController();

filesRegistry.register(TAG, fileSchema);

filesRegistry.registerPath({
  method: "get",
  path: ROUTE,
  summary: `Get all ${TAG}`,
  tags: [TAG],
  responses: createApiResponse(z.array(fileSchema), "Success"),
});
filesRouter.get("/", filesController.getAll);

//====================================================================================================

filesRegistry.registerPath({
  method: "get",
  path: `${ROUTE}/{id}`,
  tags: [TAG],
  summary: `Get ${TAG} by id`,
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(fileSchema, "Success"),
});
filesRouter.get("/:id", filesController.getById);

//====================================================================================================

filesRegistry.registerPath({
  method: "get",
  path: `${ROUTE}/user/{userId}`,
  tags: [TAG],
  summary: `Get ${TAG} by userId`,
  request: {
    params: z.object({ userId: z.string() }),
  },
  responses: createApiResponse(fileSchema, "Success"),
});
filesRouter.get("/user/:userId", filesController.getByUser);

//====================================================================================================

filesRegistry.registerPath({
  method: "post",
  path: `${ROUTE}/find`,
  tags: [TAG],
  summary: `Find ${TAG} by query`,
  request: {
    body: {
      content: { "application/json": { schema: findByQuerySchema } },
    },
  },
  responses: createApiResponse(z.array(findByQuerySchema), "Success"),
});
filesRouter.post("/find", zodValidation(findByQuerySchema), filesController.findByQuery);

//====================================================================================================

filesRegistry.registerPath({
  method: "post",
  path: `${ROUTE}/upload`,
  tags: [TAG],
  summary: `Upload ${TAG}`,
  request: {
    body: {
      content: { "multipart/form-data": { schema: uploadFilesSchema } },
    },
  },
  responses: createApiResponse(uploadFilesSchema, "File uploaded Successfully"),
});
filesRouter.post(
  "/upload",
  uploadMiddleware,
  zodValidation(uploadFilesSchema),
  filesController.upload,
);

//====================================================================================================

filesRegistry.registerPath({
  method: "put",
  path: `${ROUTE}/{id}`,
  tags: [TAG],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { "multipart/form-data": { schema: updateFilesSchema } },
    },
  },
  responses: createApiResponse(updateFilesSchema, "File updated Successfully"),
});
filesRouter.put("/:id", uploadMiddleware, zodValidation(updateFilesSchema), filesController.update);

//====================================================================================================

filesRegistry.registerPath({
  method: "delete",
  path: `${ROUTE}/{id}`,
  tags: [TAG],
  summary: `Delete ${TAG}`,
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(z.null(), `${TAG} Deleted Successfully`),
});
filesRouter.delete("/:id", filesController.delete);

export default filesRouter;
