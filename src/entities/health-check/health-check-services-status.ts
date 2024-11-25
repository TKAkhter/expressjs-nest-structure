import knex from "../../database/knex";
import redis from "../../common/redis/redis";
import mongoose from "mongoose";

export const checkPostgres = async () => {
    try {
        await knex.raw("SELECT 1+1 AS result");
        return { status: "healthy", details: {} };
    } catch (error: any) {
        return { status: "unhealthy", details: { error: error.message } };
    }
};

export const checkRedis = async () => {
    try {
        await redis.ping();
        return { status: "healthy", details: {} };
    } catch (error: any) {
        return { status: "unhealthy", details: { error: error.message } };
    }
};

export const checkMongoDB = () => {
    try {
        const isConnected = mongoose.connection.readyState === 1;
        return {
            status: isConnected ? "healthy" : "unhealthy",
            details: {},
        };
    } catch (error: any) {
        return { status: "unhealthy", details: { error: error.message } };
    }
};