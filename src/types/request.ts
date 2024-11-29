import { Request } from "express";

export interface CustomRequest extends Request {
  user?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file?: any;
}
