import { Router } from "express";
import { uploadMiddleware } from "../../common/multer/multer";
import { FileController } from "./file.controller";

const filesRouter = Router();
// FilesRouter.use(authMiddleware);

const fileController = new FileController();

filesRouter.get("/", fileController.getAllFiles);
filesRouter.get("/:id", fileController.getFileById);
filesRouter.post("/upload", uploadMiddleware, fileController.createFile);
filesRouter.put("/:id", uploadMiddleware, fileController.updateFile);
filesRouter.delete("/:id", fileController.deleteFile);

export default filesRouter;
