import mongoose from "mongoose";
import redis from "@/config/redis/redis";

export const checkRedis = async () => {
  try {
    await redis.ping();
    return { status: "healthy", details: {} };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { status: "unhealthy", details: { error: error.message } };
  }
};

export const checkMongoDB = async () => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    return {
      status: isConnected ? "healthy" : "unhealthy",
      details: {},
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { status: "unhealthy", details: { error: error.message } };
  }
};

export const formatMemoryUsage = () => {
  const memoryUsage = process.memoryUsage();
  return {
    rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
  };
};

export const createHealthCheckResponse = (status: string, details: Record<string, unknown>) => ({
  status,
  details,
});
