import { NextFunction, Response } from "express";
import { env } from "../config/env";
import jwt from "jsonwebtoken";
import { RequestWithUser } from "../types/request";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authMiddleware = (req: RequestWithUser, _: Response, next: NextFunction): any => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw createHttpError(StatusCodes.UNAUTHORIZED, "Unauthorized", {
      resource: "Auth Middleware",
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jwt.verify(token, env.JWT_SECRET as string, (err, decoded: any) => {
    if (err) {
      throw createHttpError(StatusCodes.FORBIDDEN, "Forbidden", {
        resource: "Auth Middleware",
      });
    }
    req.user = decoded.email || decoded.username || decoded.type;
    next();
  });
};
