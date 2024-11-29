import { FileDto, FileModel, UpdateFileDto } from "./file.dto";
import { logger } from "../../common/winston/winston";

export class FileRepository {
  async getAllFiles(): Promise<FileDto[]> {
    logger.info("Fetching all files from repository");
    // eslint-disable-next-line no-return-await
    return await FileModel.find();
  }

  async getFileById(uuid: string): Promise<FileDto | null> {
    logger.info(`Fetching file with ID: ${uuid}`);
    // eslint-disable-next-line no-return-await
    return await FileModel.findOne({ uuid });
  }

  async createFile(file: FileDto): Promise<FileDto> {
    logger.info("Creating a new file in the repository");
    const newFile = new FileModel(file);
    // eslint-disable-next-line no-return-await
    return await newFile.save();
  }

  async updateFile(uuid: string, updateData: UpdateFileDto): Promise<FileDto | null> {
    logger.info(`Updating file with ID: ${uuid}`);
    // eslint-disable-next-line no-return-await
    return await FileModel.findOneAndUpdate({ uuid }, updateData, { new: true });
  }

  async deleteFile(uuid: string): Promise<boolean | null> {
    logger.info(`Deleting file with ID: ${uuid}`);
    // eslint-disable-next-line no-return-await
    return await FileModel.findOneAndDelete({ uuid });
  }
}
