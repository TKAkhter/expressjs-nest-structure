import { NextFunction, Request, Response } from "express";

export async function errorInterceptor(
  err: any,
  req: Request,
  res: Response,
  _: NextFunction,
) {
  try {
    const functionName = err?.function || "";
    const action = err?.action || "";
    const requestParams = err?.req?.params || {};
    const requestBody = err?.req?.body || {};
    const requestQuery = err?.req?.query || {};

    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || "Internal Server Error";
    const stackTrace = err.stack ? err.stack.split("\n") : [];

    const lineInfo = stackTrace[1] ? stackTrace[1].match(/at (.+):(\d+):(\d+)/) : null;
    const lineNumber = lineInfo && lineInfo[2] ? lineInfo[2] : "unknown line";
    const columnNumber = lineInfo && lineInfo[3] ? lineInfo[3] : "unknown column";

    const filePathInfo = stackTrace[1] ? stackTrace[1].match(/(?:\/|^)([^/]+\.ts)/) : null;
    const fileName = filePathInfo && filePathInfo[1] ? filePathInfo[1] : "unknown file";

    console.log(
      JSON.stringify({
        status: statusCode,
        errorMessage,
        method: req.method,
        fileName,
        functionName,
        action,
        line: lineNumber,
        column: columnNumber,
        path: req.originalUrl,
        stack: err.stack,
        body: requestBody,
        params: requestParams,
        query: requestQuery,
      }),
    );

    res.status(statusCode).json({
      success: false,
      errorMessage,
      ...(process.env.NODE_ENV !== "production" && {
        method: req.method,
        fileName,
        functionName,
        action,
        line: lineNumber,
        column: columnNumber,
        path: req.originalUrl,
        stack: err.stack,
      }),
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ errorMessage: error.message });
  }
}
