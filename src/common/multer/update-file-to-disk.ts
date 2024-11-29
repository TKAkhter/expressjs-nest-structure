import fs from "fs";
import path from "path";
import { logger } from "../winston/winston";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateImageToDisk = async (fileName: string, file: any) => {
  try {
    const uploadDir = "./uploads";

    const newFilePath = path.join(uploadDir, fileName);
    const tempFilePath = path.join(uploadDir, `${fileName}_temp${path.extname(file.originalname)}`);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    fs.writeFile(tempFilePath, file.buffer, (err) => {
      if (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logger.error("Error saving file to disk:", err as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(err as any);
      }

      fs.rename(tempFilePath, newFilePath, (renameErr) => {
        if (renameErr) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          logger.error("Error replacing file:", renameErr as any);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          throw new Error(renameErr as any);
        }

        logger.info(`Image updated successfully: ${newFilePath}`);
      });
    });
    return { fileName, filePath: newFilePath };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error("Error updating image:", error);
    throw new Error(error);
  }
};
