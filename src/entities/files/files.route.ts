import { Router } from "express";
import { uploadMiddleware } from "@/common/multer/multer";
import { FilesController } from "@/entities/files/files.controller";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { FilesSchema, UpdateFilesSchema, UploadFilesSchema } from "@/entities/files/files.dto";
import { createApiResponse } from "@/common/swagger/swagger-response-builder";
import { z } from "zod";
import { authMiddleware, zodValidation } from "@/middlewares";
import { FindByQuerySchema } from "@/schemas/find-by-query";

const filesRouter = Router();
filesRouter.use(authMiddleware);

const TAG = "Files";
const ROUTE = `/${TAG.toLowerCase()}`;

export const filesRegistry = new OpenAPIRegistry();
const filesController = new FilesController();

filesRegistry.register(TAG, FilesSchema);

filesRegistry.registerPath({
  method: "get",
  path: ROUTE,
  summary: `Get all ${TAG}`,
  tags: [TAG],
  responses: createApiResponse(z.array(FilesSchema), "Success"),
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
  responses: createApiResponse(FilesSchema, "Success"),
});
filesRouter.get("/:id", filesController.getById);

//====================================================================================================

filesRegistry.registerPath({
  method: "get",
  path: `${ROUTE}/uuid/{uuid}`,
  tags: [TAG],
  summary: `Get ${TAG} by uuid`,
  request: {
    params: z.object({ uuid: z.string() }),
  },
  responses: createApiResponse(FilesSchema, "Success"),
});
filesRouter.get("/uuid/:uuid", filesController.getByUuid);

//====================================================================================================

filesRegistry.registerPath({
  method: "get",
  path: `${ROUTE}/user/{userId}`,
  tags: [TAG],
  summary: `Get ${TAG} by userId`,
  request: {
    params: z.object({ userId: z.string() }),
  },
  responses: createApiResponse(FilesSchema, "Success"),
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
      content: { "application/json": { schema: FindByQuerySchema } },
    },
  },
  responses: createApiResponse(z.array(FindByQuerySchema), "Success"),
});
filesRouter.post("/find", zodValidation(FindByQuerySchema), filesController.findByQuery);

//====================================================================================================

filesRegistry.registerPath({
  method: "post",
  path: `${ROUTE}/upload`,
  tags: [TAG],
  summary: `Upload ${TAG}`,
  request: {
    body: {
      content: { "multipart/form-data": { schema: UploadFilesSchema } },
    },
  },
  responses: createApiResponse(UploadFilesSchema, "File uploaded Successfully"),
});
filesRouter.post(
  "/upload",
  uploadMiddleware,
  zodValidation(UploadFilesSchema),
  filesController.upload,
);

//====================================================================================================

filesRegistry.registerPath({
  method: "put",
  path: `${ROUTE}/{uuid}`,
  tags: [TAG],
  request: {
    params: z.object({ uuid: z.string() }),
    body: {
      content: { "multipart/form-data": { schema: UpdateFilesSchema } },
    },
  },
  responses: createApiResponse(UpdateFilesSchema, "File updated Successfully"),
});
filesRouter.put(
  "/:uuid",
  uploadMiddleware,
  zodValidation(UpdateFilesSchema),
  filesController.update,
);

//====================================================================================================

filesRegistry.registerPath({
  method: "delete",
  path: `${ROUTE}/{uuid}`,
  tags: [TAG],
  summary: `Delete ${TAG}`,
  request: {
    params: z.object({ uuid: z.string() }),
  },
  responses: createApiResponse(z.null(), `${TAG} Deleted Successfully`),
});
filesRouter.delete("/:uuid", filesController.delete);

export default filesRouter;
