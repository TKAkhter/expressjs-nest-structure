import app from "./app";
import mongoose from "mongoose";
import { checkPostgres, checkRedis } from "./entities/health-check/health-check-services-status";
import { env } from "./config/env";
import { logger } from "./common/winston/winston";

const PORT = env.PORT || 3000;
const ENV = env.NODE_ENV;
const API = env.BASE_URL;
const { ALLOW_ORIGIN } = env;

async function checkConnections() {
    try {
        await checkPostgres();
        logger.info("Postgres connections verified successfully.");
        await checkRedis();
        logger.info("Redis connections verified successfully.");
        await mongoose.connect(env.MONGODB_URI || "");
        logger.info("MongoDB connections verified successfully.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        logger.error("Postgres, MongoDb or Redis connection failed");
        logger.error(JSON.stringify(error));
        throw new Error("HTTP server closed.");
    }
}

checkConnections().then(() => {
    const server = app.listen(PORT, () =>
        logger.info(
            `Server running on PORT: ${PORT}, ==> ENV: ${ENV}, ==> API: ${API}, ==> ALLOW_ORIGIN: ${ALLOW_ORIGIN}`
        )
    );

    const onCloseSignal = () => {
        logger.info("SIGTERM signal received. Closing server...");
        server.close(() => {
            logger.info("HTTP server closed.");
            throw new Error("HTTP server closed.");
        });
    };

    process.on("SIGINT", onCloseSignal);
    process.on("SIGTERM", onCloseSignal);
});
