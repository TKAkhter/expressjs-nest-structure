import app from "./app";
import redis from "./common/redis/redis";
import { logger } from "./common/winston/winston";
import { env } from "./config/env";
import knex from "./database/knex";

const PORT = env.PORT || 3000;
const ENV = env.NODE_ENV;

async function checkConnections() {
    try {
        await knex.raw("SELECT 1+1 AS result");
        await redis.ping();
        logger.info("Database and Redis connections verified successfully.");
    } catch (error) {
        logger.error("Database or Redis connection failed", error);
        process.exit(1);
    }
}

checkConnections().then(() => {
    const server = app.listen(PORT, () => logger.info(`Server running on PORT: ${PORT}`));

    process.on("SIGTERM", () => {
        logger.info("SIGTERM signal received. Closing server...");
        server.close(() => {
            logger.info("HTTP server closed.");
            process.exit(0);
        });
    });
});
