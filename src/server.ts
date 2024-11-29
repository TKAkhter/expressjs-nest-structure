import app from "./app";
import {
  checkMongoDB,
  checkPostgres,
  checkRedis,
} from "./entities/health-check/health-check-services-status";
import { env } from "./config/env";
import { logger } from "./common/winston/winston";
import connectMongoDB from "./config/mongodb/mongodb";

const PORT = env.PORT || 3000;
const ENV = env.NODE_ENV;
const API = env.BASE_URL;
const { ALLOW_ORIGIN } = env;

/**
 * Function to check the connection status for Postgres, Redis, and MongoDB.
 * Logs the success or failure of each connection check.
 */
async function checkConnections() {
  try {
    logger.info("Checking database connections...");
    await checkPostgres();
    logger.info("Postgres connections verified successfully.");

    await checkRedis();
    logger.info("Redis connections verified successfully.");

    await connectMongoDB();
    await checkMongoDB();
    logger.info("MongoDB connections verified successfully.");
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Postgres, MongoDB, or Redis connection failed", { error: error.message });
    } else {
      logger.error("Unknown error occurred during connection checks");
    }

    // eslint-disable-next-line no-process-exit
    process.exit(1); // Exit the process if any connection check fails
  }
}

/**
 * Function to start the server and handle termination signals (SIGINT, SIGTERM).
 * Logs the server status on startup and graceful shutdown.
 */
checkConnections().then(() => {
  const server = app.listen(PORT, () =>
    logger.info(
      `Server running on PORT: ${PORT}, ==> ENV: ${ENV}, ==> API: ${API}, ==> ALLOW_ORIGIN: ${ALLOW_ORIGIN}`,
    ),
  );

  const onCloseSignal = () => {
    logger.info("SIGTERM signal received. Closing server...");
    server.close(() => {
      logger.info("HTTP server closed.");
      // eslint-disable-next-line no-process-exit
      process.exit(); // Ensure the process exits after server closure
    });
  };

  process.on("SIGINT", onCloseSignal); // Gracefully handle SIGINT (Ctrl+C or control+C)
  process.on("SIGTERM", onCloseSignal); // Gracefully handle SIGTERM (from Docker, etc.)
});
