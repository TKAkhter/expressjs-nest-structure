import "winston-daily-rotate-file";
import { createLogger, format, transports } from "winston";
import { StatusCodes } from "http-status-codes";
import { env } from "../../config/env";
import fs from "fs";

const logDir = "logs";

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const infoTransport = new transports.DailyRotateFile({
  filename: "info-%DATE%.log",
  dirname: logDir,
  datePattern: "YYYY-MM-DD",
  level: "info",
  zippedArchive: false,
  maxSize: "20m",
  maxFiles: env.LOG_FILE_DURATION || "30d",
});

const errorTransport = new transports.DailyRotateFile({
  filename: "error-%DATE%.log",
  dirname: logDir,
  datePattern: "YYYY-MM-DD",
  level: "error",
  zippedArchive: false,
  maxSize: "20m",
  maxFiles: env.LOG_FILE_DURATION || "30d",
});

const { combine, timestamp, align, splat, printf, colorize } = format;

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

const customFormat = printf(
  ({ level, message, timestamp: stamp }) => `[${stamp}] [${level}]: ${message}`,
);

const winstonLogger = createLogger({
  levels: logLevels.levels,
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), customFormat, splat(), align()),
  transports: [
    new transports.Console({
      format: combine(
        colorize({ colors: logLevels.colors }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        customFormat,
      ),
    }),
    infoTransport,
    errorTransport,
  ],
  // ExitOnError: false,
});

export const logger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (message: any) => {
    // Const formattedMessage = req?.user.sub ? { userId: req?.user.sub, message: message } : message;
    // Console.log(formattedMessage);
    winstonLogger.info(message);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  http: (message: any) => {
    // Const formattedMessage = req?.user.sub ? { userId: req?.user.sub, message: message } : message;
    // Console.log(formattedMessage);
    winstonLogger.http(message);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (message: any) => {
    // Const formattedMessage = req?.user.sub ? { userId: req?.user.sub, message: message } : message;
    // Console.error(formattedMessage);
    winstonLogger.error(message);
  },
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
