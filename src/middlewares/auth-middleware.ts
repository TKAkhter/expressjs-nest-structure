import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import jwt from "jsonwebtoken";

interface RequestWithUser extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authMiddleware = (req: RequestWithUser, res: Response, next: NextFunction): any => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = decoded;
    next();
  });
};
