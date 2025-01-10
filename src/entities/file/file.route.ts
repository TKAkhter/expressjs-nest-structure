import { Router } from "express";
import { uploadMiddleware } from "@/common/multer/multer";
import { FileController } from "./file.controller";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { FileSchema, UpdateFileSchema, UploadFileSchema } from "./file.dto";
import { createApiResponse } from "@/common/swagger/swagger-response-builder";
import { z } from "zod";
import { authMiddleware, zodValidation } from "@/middlewares";

const filesRouter = Router();
filesRouter.use(authMiddleware);

export const fileRegistry = new OpenAPIRegistry();
const fileController = new FileController();

fileRegistry.register("File", FileSchema);

fileRegistry.registerPath({
  method: "get",
  path: "/files",
  summary: "Get all files",
  tags: ["File"],
  responses: createApiResponse(z.array(FileSchema), "Success"),
});
filesRouter.get("/", fileController.getAllFiles);

fileRegistry.registerPath({
  method: "get",
  path: "/files/{id}",
  tags: ["File"],
  summary: "Get a single file",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(FileSchema, "Success"),
});
filesRouter.get("/:id", fileController.getFileById);

fileRegistry.registerPath({
  method: "post",
  path: "/files/upload",
  tags: ["File"],
  request: {
    body: {
      content: { "multipart/form-data": { schema: UploadFileSchema } },
    },
  },
  responses: createApiResponse(UploadFileSchema, "File uploaded Successfully"),
});
filesRouter.post(
  "/upload",
  uploadMiddleware,
  zodValidation(UploadFileSchema),
  fileController.createFile,
);

fileRegistry.registerPath({
  method: "put",
  path: "/files/{id}",
  tags: ["File"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { "multipart/form-data": { schema: UpdateFileSchema } },
    },
  },
  responses: createApiResponse(UpdateFileSchema, "File updated Successfully"),
});
filesRouter.put(
  "/:id",
  uploadMiddleware,
  zodValidation(UpdateFileSchema),
  fileController.updateFile,
);

fileRegistry.registerPath({
  method: "delete",
  path: "/files/{id}",
  tags: ["File"],
  summary: "Delete file",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(z.null(), "File deleted Successfully"),
});
filesRouter.delete("/:id", fileController.deleteFile);

export default filesRouter;
