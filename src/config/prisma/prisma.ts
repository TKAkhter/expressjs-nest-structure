import { logger } from "@/common/winston/winston";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const connectPrisma = async () => {
  try {
    await prisma.$connect();
  } catch (error) {
    logger.error("Error connecting to Prisma:", { error });
    throw new Error("Error connecting to Prisma");
  }
};
