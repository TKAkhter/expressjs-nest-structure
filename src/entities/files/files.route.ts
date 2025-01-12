import { Router } from "express";
import { uploadMiddleware } from "@/common/multer/multer";
import { FilesController } from "@/entities/files/files.controller";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { FilesSchema, UpdateFilesSchema, UploadFilesSchema } from "@/entities/files/files.dto";
import { createApiResponse } from "@/common/swagger/swagger-response-builder";
import { z } from "zod";
import { authMiddleware, zodValidation } from "@/middlewares";

const filesRouter = Router();
filesRouter.use(authMiddleware);

export const filesRegistry = new OpenAPIRegistry();
const filesController = new FilesController();

filesRegistry.register("Files", FilesSchema);

filesRegistry.registerPath({
  method: "get",
  path: "/files",
  summary: "Get all files",
  tags: ["File"],
  responses: createApiResponse(z.array(FilesSchema), "Success"),
});
filesRouter.get("/", filesController.getAllFiles);

filesRegistry.registerPath({
  method: "get",
  path: "/files/{id}",
  tags: ["File"],
  summary: "Get a single file",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(FilesSchema, "Success"),
});
filesRouter.get("/:id", filesController.getFileById);

filesRegistry.registerPath({
  method: "post",
  path: "/files/upload",
  tags: ["File"],
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
  filesController.createFile,
);

filesRegistry.registerPath({
  method: "put",
  path: "/files/{id}",
  tags: ["File"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { "multipart/form-data": { schema: UpdateFilesSchema } },
    },
  },
  responses: createApiResponse(UpdateFilesSchema, "File updated Successfully"),
});
filesRouter.put(
  "/:id",
  uploadMiddleware,
  zodValidation(UpdateFilesSchema),
  filesController.updateFile,
);

filesRegistry.registerPath({
  method: "delete",
  path: "/files/{id}",
  tags: ["File"],
  summary: "Delete file",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(z.null(), "File deleted Successfully"),
});
filesRouter.delete("/:id", filesController.deleteFile);

export default filesRouter;
