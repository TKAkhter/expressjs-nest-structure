// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user?: any; // You can specify a more specific type if needed
    }
  }
}
