import { NextFunction, Response } from "express";
import { FilesDto, FilesModel, UpdateFilesDto, UploadFilesDto } from "@/entities/files/files.dto";
import { logger } from "@/common/winston/winston";
import { CustomRequest } from "@/types/request";
import { saveFileToDisk } from "@/common/multer/save-file-to-disk";
import { updateImageToDisk } from "@/common/multer/update-file-to-disk";
import { deleteFileFromDisk } from "@/common/multer/delete-file-from-disk";
import { BaseController } from "@/common/base/base.controller";
import { v4 as uuidv4 } from "uuid";
import { createResponse } from "@/utils/create-response";
import { StatusCodes } from "http-status-codes";
import { FilesService } from "./files.service";

export class FilesController extends BaseController<FilesDto, UploadFilesDto, UpdateFilesDto> {
  public collectionName: string;
  public filesService: FilesService;

  constructor() {
    super(FilesModel, "Files");
    this.collectionName = "Files";
    this.filesService = new FilesService(FilesModel, this.collectionName);
  }

  /**
   * Get entity by ID
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON entity object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getByUser = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { userId } = req.params;
    const { loggedUser } = req;
    try {
      logger.info(`[${this.collectionName} Controller] Fetching ${this.collectionName} by userId`, {
        loggedUser,
        userId,
      });
      const data = await this.filesService.getByUser(userId);

      return res.json(
        createResponse(req, data, `${this.collectionName} fetched successfully`, StatusCodes.OK),
      );
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(
          `[${this.collectionName} Controller] Error fetching ${this.collectionName} by userId`,
          {
            error: error.message,
            loggedUser,
            userId,
          },
        );
      }
      next(error);
    }
  };

  /**
   * Upload an entity
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON updated entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upload = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { loggedUser } = req;
    const { buffer, mimetype } = req.file!;
    const { tags, views, userRef } = req.body;

    try {
      const { fileName, filePath } = await saveFileToDisk(req.file);
      logger.info(`[${this.collectionName} Controller] Creating new ${this.collectionName}`, {
        loggedUser,
        tags,
        fileName,
        filePath,
      });
      const fileText = `data:${mimetype};base64,${buffer.toString("base64")}`;

      const fileUpload: FilesDto = {
        fileName,
        fileText,
        filePath,
        userRef,
        userId: loggedUser,
        tags,
        uuid: uuidv4(),
        views: views ?? "0",
      };
      const created = await this.baseService.create(fileUpload);

      return res.json(
        createResponse(
          req,
          created,
          `${this.collectionName} created successfully`,
          StatusCodes.CREATED,
        ),
      );
    } catch (error) {
      if (error instanceof Error) {
        logger.warn("Error uploading file", { error: error.message, loggedUser });
      }
      next(error);
    }
  };

  /**
   * Update an existing entity
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON updated entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { loggedUser } = req;
    const { uuid } = req.params;
    const { buffer, mimetype } = req.file!;
    const updateData = req.body;
    try {
      const existFile = await this.baseService.getByUuid(uuid);
      if (!existFile) {
        throw new Error("File not found");
      }
      await updateImageToDisk(existFile.fileName!, req.file);
      const fileText = `data:${mimetype};base64,${buffer.toString("base64")}`;
      const fileData: UpdateFilesDto = {
        fileText,
        ...updateData,
      };
      const updated = await this.baseService.update(uuid, fileData);

      return res.json(
        createResponse(
          req,
          updated,
          `${this.collectionName} updated successfully`,
          StatusCodes.CREATED,
        ),
      );
    } catch (error) {
      if (error instanceof Error) {
        logger.warn("Error updating file", { error: error.message, loggedUser, uuid });
      }
      next(error);
    }
  };

  /**
   * Delete an existing entity
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON updated entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { loggedUser } = req;
    const { uuid } = req.params;
    try {
      const existFile = await this.baseService.getByUuid(uuid);
      if (!existFile) {
        throw new Error("File not found");
      }
      await deleteFileFromDisk(existFile.fileName!);
      const deleted = await this.baseService.delete(uuid);

      return res.json(
        createResponse(
          req,
          deleted,
          `${this.collectionName} deleted successfully`,
          StatusCodes.CREATED,
        ),
      );
    } catch (error) {
      if (error instanceof Error) {
        logger.warn("Error deleting file", { error: error.message, loggedUser, uuid });
      }
      next(error);
    }
  };
}
