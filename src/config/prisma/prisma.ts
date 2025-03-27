import { logger } from "@/common/winston/winston";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const prismaInstance = () => prisma;

export const connectPrisma = async () => {
  try {
    const prismaClient = prisma;
    await prismaClient.$connect();
  } catch (error) {
    logger.error("Error connecting to Prisma:", { error });
    throw new Error("Error connecting to Prisma");
  }
};
