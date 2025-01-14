import "winston-daily-rotate-file";
import { createLogger, format, transports, Logger } from "winston";
import { StatusCodes } from "http-status-codes";
import { env } from "@/config/env";
import fs from "fs";
import colors from "colors/safe";

const isWinstonEnabled = env.ENABLE_WINSTON === "1";

if (!fs.existsSync(env.LOGS_DIRECTORY) && isWinstonEnabled) {
  fs.mkdirSync(env.LOGS_DIRECTORY);
}

const createDailyRotateTransport = (level: string) =>
  new transports.DailyRotateFile({
    filename: `${level}-%DATE%.log`,
    dirname: env.LOGS_DIRECTORY,
    datePattern: "YYYY-MM-DD-HH",
    level,
    frequency: "6h",
    zippedArchive: true,
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
      JSON.stringify(metaData) === "{}" ? "" : metaData
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
  transports: isWinstonEnabled
    ? [
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
      ]
    : [],
});

export const logger = isWinstonEnabled
  ? {
      info: (message: string, metadata?: Record<string, unknown>) =>
        winstonLogger.info(message, metadata),
      warn: (message: string, metadata?: Record<string, unknown>) =>
        winstonLogger.warn(message, metadata),
      http: (message: string, metadata?: Record<string, unknown>) =>
        winstonLogger.http(message, metadata),
      error: (message: string, metadata?: Record<string, unknown>) =>
        winstonLogger.error(message, metadata),
    }
  : {
      info: (message: string, metadata?: Record<string, unknown>) =>
        console.log(colors.white(`${message}${metadata ? `, ${JSON.stringify(metadata)}` : ""}\n`)),
      warn: (message: string, metadata?: Record<string, unknown>) =>
        console.log(
          colors.yellow(`${message}${metadata ? `, ${JSON.stringify(metadata)}` : ""}\n`),
        ),
      http: (message: string, metadata?: Record<string, unknown>) =>
        console.log(colors.cyan(`${message}${metadata ? `, ${JSON.stringify(metadata)}` : ""}\n`)),
      error: (message: string, metadata?: Record<string, unknown>) =>
        console.log(colors.red(`${message}${metadata ? `, ${JSON.stringify(metadata)}` : ""}\n`)),
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
