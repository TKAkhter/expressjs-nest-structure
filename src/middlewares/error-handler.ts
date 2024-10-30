import { NextFunction, Request, Response } from "express";
import { BadRequestException, NotFoundException, InternalServerErrorException } from "../common/exceptions/http-exception";

export const errorHandler = (
    err: BadRequestException | NotFoundException | InternalServerErrorException | Error,
    _: Request,
    res: Response,
    __: NextFunction
) => {
    const defaultResponse = {
        name: "InternalServerError",
        status: 500,
        error: 'Internal Server Error'
    };
    if (err instanceof BadRequestException || err instanceof NotFoundException || err instanceof InternalServerErrorException) {
        return res.status(err.status).json({
            name: err.name,
            status: err.status,
            error: err.message
        });
    }
    return res.status(defaultResponse.status).json(defaultResponse);
};