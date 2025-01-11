import { NextFunction, Response } from "express";
import { FileService } from "./file.service";
import { UpdateFileDto, UploadFileDto } from "./file.dto";
import { logger } from "@/common/winston/winston";
import { CustomRequest } from "@/types/request";
import { saveFileToDisk } from "@/common/multer/save-file-to-disk";
import { updateImageToDisk } from "@/common/multer/update-file-to-disk";
import { deleteFileFromDisk } from "@/common/multer/delete-file-from-disk";

const fileService = new FileService();
export class FileController {
  async getAllFiles(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const { user } = req;
    try {
      const files = await fileService.getAllFiles();
      res.json(files);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error getting files", { error: error.message, user });
      }
      next(error);
    }
  }

  async getFileById(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { user } = req;
    try {
      const file = await fileService.getFileById(id);
      res.json(file);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error getting file", { error: error.message, user, id });
      }
      next(error);
    }
  }

  async createFile(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const { user } = req;
    const { buffer, mimetype } = req.file!;
    const { tags } = req.body;

    try {
      const { fileName, filePath } = await saveFileToDisk(req.file);
      const fileText = `data:${mimetype};base64,${buffer.toString("base64")}`;
      const fileData: UploadFileDto = { fileName, filePath, fileText, userId: user!, tags };
      const newFile = await fileService.uploadFile(fileData);
      res.status(201).json(newFile);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error uploading file", { error: error.message, user });
      }
      next(error);
    }
  }

  async updateFile(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const { user } = req;
    const { id } = req.params;
    const { buffer, mimetype } = req.file!;
    const updateData = req.body;
    try {
      const existFile = await fileService.getFileById(id);
      if (!existFile) {
        throw new Error("File not found");
      }
      const { fileName, filePath } = await updateImageToDisk(existFile.fileName!, req.file);
      const fileText = `data:${mimetype};base64,${buffer.toString("base64")}`;
      const fileData: UpdateFileDto = {
        fileName,
        filePath,
        fileText,
        userId: user!,
        ...updateData,
      };
      const updatedFile = await fileService.updateFile(id, fileData);
      res.json(updatedFile);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error updating file", { error: error.message, user, id });
      }
      next(error);
    }
  }

  async deleteFile(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const { user } = req;
    const { id } = req.params;
    try {
      const existFile = await fileService.getFileById(id);
      if (!existFile) {
        throw new Error("File not found");
      }
      await deleteFileFromDisk(existFile.fileName!);
      await fileService.deleteFile(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error deleting file", { error: error.message, user, id });
      }
      next(error);
    }
  }
}
