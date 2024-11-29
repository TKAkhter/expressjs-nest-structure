import fs from "fs";
import path from "path";
import { logger } from "../winston/winston";

export const deleteFileFromDisk = (fileName: string) => {
  try {
    const uploadDir = "./uploads";
    const filePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error("File not found.");
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        throw new Error("Failed to delete the file.");
      }

      logger.info(`File deleted successfully: ${filePath}`);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete the file.");
  }
};
