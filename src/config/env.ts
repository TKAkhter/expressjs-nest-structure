import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    "NODE_ENV": z.enum(["local", "development", "production"]).default("local"),
    "BASE_URL": z.string().url(),
    "PORT": z.string().transform((val) => parseInt(val, 10)),
    "SERVER_TIMEOUT": z.string().default("150s"),
    "LOG_FILE_DURATION": z.string().default("3d"),
    "ALLOW_ORIGIN": z.string().url(),

    // Redis Configuration
    "REDIS_URL": z.string(),

    // Basic Auth Secrets
    "JWT_SECRET": z.string(),
    "HASH": z.string().transform((val) => parseInt(val, 10)),

    // Database URLs
    "DATABASE_URL": z.string().url(),
    "KNEX_REJECT_UNAUTHORIZED": z.string().transform((val) => val === "true"),
    "MONGODB_URI": z.string().url()
});

export const env = envSchema.parse(process.env);
