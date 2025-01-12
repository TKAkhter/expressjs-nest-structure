import { FilesDto, FilesModel, UpdateFilesDto } from "@/entities/files/files.dto";
import { logger } from "@/common/winston/winston";

export class FilesRepository {
  async getAllFiles(): Promise<FilesDto[]> {
    logger.info("Fetching all files from repository");
    // eslint-disable-next-line no-return-await
    return await FilesModel.find();
  }

  async getFilesById(uuid: string): Promise<FilesDto | null> {
    logger.info(`Fetching file with ID: ${uuid}`);
    // eslint-disable-next-line no-return-await
    return await FilesModel.findOne({ uuid });
  }

  async createFile(file: FilesDto): Promise<FilesDto> {
    logger.info("Creating a new file in the repository");
    const newFile = new FilesModel(file);
    // eslint-disable-next-line no-return-await
    return await newFile.save();
  }

  async updateFile(uuid: string, updateData: UpdateFilesDto): Promise<FilesDto | null> {
    logger.info(`Updating file with ID: ${uuid}`);
    // eslint-disable-next-line no-return-await
    return await FilesModel.findOneAndUpdate({ uuid }, updateData, { new: true });
  }

  async deleteFile(uuid: string): Promise<boolean | null> {
    logger.info(`Deleting file with ID: ${uuid}`);
    // eslint-disable-next-line no-return-await
    return await FilesModel.findOneAndDelete({ uuid });
  }
}
