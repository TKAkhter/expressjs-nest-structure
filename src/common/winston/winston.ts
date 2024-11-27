import "winston-daily-rotate-file";
import { createLogger, format, transports, Logger } from "winston";
import { StatusCodes } from "http-status-codes";
import { env } from "../../config/env";
import fs from "fs";

const logDir = "logs";

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const createDailyRotateTransport = (level: string) =>
  new transports.DailyRotateFile({
    filename: `${level}-%DATE%.log`,
    dirname: logDir,
    datePattern: "YYYY-MM-DD",
    level,
    zippedArchive: false,
    maxSize: "20m",
    maxFiles: env.LOG_FILE_DURATION || "30d",
  });

const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    http: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "blue",
    debug: "blue",
  },
};

const customFormat = format.combine(
  format.printf(({ level, message, timestamp: stamp, ...meta }) => {
    const metaData = meta ? JSON.stringify(meta) : "";
    return `\n[${stamp}] [${level}]: ${message} ${
      JSON.stringify(metaData) === "{}" ? metaData : ""
    }`;
  }),
);

const winstonLogger: Logger = createLogger({
  levels: logLevels.levels,
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat,
    format.splat(),
    format.align(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ colors: logLevels.colors }),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        customFormat,
      ),
    }),
    createDailyRotateTransport("info"),
    createDailyRotateTransport("error"),
  ],
  // ExitOnError: false,
});

export const logger = {
  info: (message: string, metadata?: Record<string, unknown>) =>
    winstonLogger.info(message, metadata),
  http: (message: string, metadata?: Record<string, unknown>) =>
    winstonLogger.http(message, metadata),
  error: (message: string, metadata?: Record<string, unknown>) =>
    winstonLogger.error(message, metadata),
};

export const morganStream = {
  write: (message: string) => {
    const statusCode = parseInt(message.split(" ")[2], 10);
    if (statusCode >= StatusCodes.BAD_REQUEST) {
      logger.error(message.trim());
    } else {
      logger.http(message.trim());
    }
  },
};
