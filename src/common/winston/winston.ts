import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";
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
  maxFiles: process.env.LOG_FILE_DURATION || "30d",
});

const errorTransport = new transports.DailyRotateFile({
  filename: "error-%DATE%.log",
  dirname: logDir,
  datePattern: "YYYY-MM-DD",
  level: "error",
  zippedArchive: false,
  maxSize: "20m",
  maxFiles: process.env.LOG_FILE_DURATION || "30d",
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
  ({ level, message, timestamp }) => `\n[${timestamp}] [${level}]: ${message}`,
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
  // exitOnError: false,
});

export const morganStream = {
  write: (message: string) => {
    const statusCode = parseInt(message.split(" ")[2], 10);
    if (statusCode >= 400) {
      logger.error(message.trim());
    } else {
      logger.http(message.trim());
    }
  },
};

export const logger = {
  info: (message: any, req?: any) => {
    const formattedMessage = req?.user.sub ? { userId: req?.user.sub, message: message } : message;
    // console.log(formattedMessage);
    winstonLogger.info(formattedMessage);
  },

  http: (message: any, req?: any) => {
    const formattedMessage = req?.user.sub ? { userId: req?.user.sub, message: message } : message;
    // console.log(formattedMessage);
    winstonLogger.http(formattedMessage);
  },

  error: (message: any, req?: any) => {
    const formattedMessage = req?.user.sub ? { userId: req?.user.sub, message: message } : message;
    // console.error(formattedMessage);
    winstonLogger.error(formattedMessage);
  },
};
