import app from "@/app";
import { env } from "@/config/env";
import { logger } from "@/common/winston/winston";

const { PORT, NODE_ENV, BASE_URL, ALLOW_ORIGIN } = env;

const server = app.listen(PORT, () =>
  logger.info(
    `Server running on PORT: ${PORT}, ==> ENV: ${NODE_ENV}, ==> API: ${BASE_URL}, ==> ALLOW_ORIGIN: ${ALLOW_ORIGIN}`,
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
