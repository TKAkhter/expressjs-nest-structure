import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { env } from "../config/env";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: any, _: Request, res: Response, __: NextFunction) => { // eslint-disable-line @typescript-eslint/no-explicit-any

    const { message, status, stack } = err;

    let messages;
    try {

        messages = JSON.parse(message);

    } catch {

        messages = message;

    }

    if (createHttpError.isHttpError(err)) {

        return res.status(status || 500).json({
            status,
            "error": name,
            "message": messages,
            "stack": env.NODE_ENV !== "production"
                ? stack
                : undefined
        });

    }

    return res.status(500).json({
        "status": 500,
        "error": "Internal Server Error",
        "message": message || "Something went wrong"
    });

};
