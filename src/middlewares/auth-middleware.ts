import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authMiddleware = (req: Request, res: Response, next: NextFunction): any => {

    // Check if the request URL contains 'login'
    if (req.url.includes("login")) {

        return next(); // Skip the middleware and continue to the next handler

    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {

        return res.status(401).json({ "message": "Unauthorized" });

    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {

        if (err) {

            return res.status(403).json({ "message": "Forbidden" });

        }
        req.user = decoded;
        next();

    });

};
