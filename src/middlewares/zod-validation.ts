import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, ZodTypeAny } from "zod";
import { logger } from "@/common/winston/winston";
import { createResponse } from "@/utils/create-response";

export const zodValidation =
  (zSchema: ZodTypeAny) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const data = zSchema.parse(req.body);
      if (data) {
        req.body = data;
        next();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = `Validation Error: ${(error as ZodError).errors.map((e) => e.message).join(", ")}`;
      logger.warn(errorMessage, error);
      return res.status(StatusCodes.BAD_REQUEST).json(
        createResponse({
          req,
          data: error,
          message: errorMessage,
          status: StatusCodes.BAD_REQUEST,
        }),
      );
    }
  };
