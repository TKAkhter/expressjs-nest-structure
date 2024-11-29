import { FileRepository } from "./file.repository";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "../../common/winston/winston";
import { UpdateFileDto, UploadFileDto } from "./file.dto";
import { v4 as uuidv4 } from "uuid";
export class FileService {
  private fileRepository = new FileRepository();

  async uploadFile(fileData: UploadFileDto) {
    try {
      logger.info("Uploading file metadata to the database", { fileData });
      const fileUpload = {
        ...fileData,
        uuid: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        views: "0",
        userId: "talhaakhter01@gmail.com",
      };
      return await this.fileRepository.createFile(fileUpload);
    } catch (error) {
      logger.error("Error uploading file metadata", { error });
      throw createHttpError(StatusCodes.INTERNAL_SERVER_ERROR, "Error uploading file metadata.");
    }
  }

  async getFileById(id: string) {
    const file = await this.fileRepository.getFileById(id);

    if (!file) {
      throw createHttpError(StatusCodes.NOT_FOUND, "File not found.");
    }

    return file;
  }

  async getAllFiles() {
    // eslint-disable-next-line no-return-await
    return await this.fileRepository.getAllFiles();
  }

  async updateFile(id: string, updateData: UpdateFileDto) {
    const updatedFile = await this.fileRepository.updateFile(id, updateData);

    if (!updatedFile) {
      throw createHttpError(StatusCodes.NOT_FOUND, "File not found.");
    }

    return updatedFile;
  }

  async deleteFile(id: string) {
    const deletedFile = await this.fileRepository.deleteFile(id);

    if (!deletedFile) {
      throw createHttpError(StatusCodes.NOT_FOUND, "File not found.");
    }

    return deletedFile;
  }
}
