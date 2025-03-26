import { Request } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export const createResponse = ({
  req,
  data,
  message = ReasonPhrases.OK,
  status = StatusCodes.OK,
  success = true,
}: {
  req?: Request;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  message?: string;
  status?: number;
  success?: boolean;
}) => {
  if (req) {
    return {
      success,
      statusCode: status,
      message,
      method: req.method,
      url: req.originalUrl,
      data,
    };
  }
  return {
    success,
    statusCode: status,
    message,
    data,
  };
};
