import knex from "../../database/knex";
import mongoose from "mongoose";
import redis from "../../common/redis/redis";

export const checkPostgres = async () => {
    try {
        await knex.raw("SELECT 1+1 AS result");
        return { "status": "healthy", "details": {} };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return { "status": "unhealthy", "details": { "error": error.message } };
    }
};

export const checkRedis = async () => {
    try {
        await redis.ping();
        return { "status": "healthy", "details": {} };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return { "status": "unhealthy", "details": { "error": error.message } };
    }
};

export const checkMongoDB = () => {
    try {
        const isConnected = mongoose.connection.readyState === 1;
        return {
            "status": isConnected
                ? "healthy"
                : "unhealthy",
            "details": {}
        };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return { "status": "unhealthy", "details": { "error": error.message } };
    }
};
