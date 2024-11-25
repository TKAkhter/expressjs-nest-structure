import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { logger } from "../common/winston/winston";
import { HttpError } from "http-errors";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: any, req: any, res: Response, _: NextFunction): Response => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { message, ...details } = err;
    const isHttpError = err instanceof HttpError;

    const statusCode = isHttpError ? err.status || 500 : 500;
    const name = isHttpError ? err.name : "AppError";
    const user = req.user?.email || "Unknown User";
    const method = req.method;
    const url = req.originalUrl;

    const stack = err.stack;

    const errorPayload = {
        status: statusCode,
        message,
        method,
        url,
        user,
        name,
        details,
        stack,
    };

    logger.error(JSON.stringify(errorPayload));

    const responsePayload = {
        status: statusCode,
        message,
        ...(env.NODE_ENV !== "production" && { method, url, user, name, details, stack }),
    };

    return res.status(statusCode).json(responsePayload);
};