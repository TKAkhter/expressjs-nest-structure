import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodTypeAny } from "zod";

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
          } catch (error) {
              console.log(error);
              return res.status(StatusCodes.BAD_REQUEST).json(error);
          }
      };
