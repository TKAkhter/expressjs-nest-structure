import { errorHandler, cors } from "./middlewares";
import express, { NextFunction, Request, Response } from "express";
import { apiRoutes } from "./routes/routes";
import { env } from "./config/env";
import { healthCheckRouter } from "./entities/health-check/health-check";
import { morganStream } from "./common/winston/winston";
import { openAPIRouter } from "./common/swagger/swagger.router";
import { slowDown } from "express-slow-down";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import nocache from "nocache";
import path from "node:path";
import rateLimit from "express-rate-limit";
import responseTime from "response-time";
import timeout from "connect-timeout";

const app = express();

// Set the trust proxy to handle X-Forwarded-For correctly
app.set("trust proxy", 1);

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "trusted-scripts.com"],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31_536_000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    referrerPolicy: { policy: "same-origin" },
    frameguard: { action: "deny" },
    crossOriginEmbedderPolicy: true,
  }),
);

// Additional Security Headers
app.use((_, res: Response, next: NextFunction) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Cross-Domain Policy
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("X-Download-Options", "noopen");
  // Feature Policy
  res.setHeader("Feature-Policy", "geolocation 'none'; microphone 'none'; camera 'none';");
  // Expect-CT Header
  res.setHeader("Expect-CT", "enforce, max-age=30");

  next();
});

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
});

// Slow down requests from a single IP to prevent abuse
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 1000, // Allow 1000 requests, then start delaying
  delayMs: (hits) => hits * 500, // Add a 500ms delay per request above 1000
});

// Apply middlewares
app.use(cors); // Make sure this middleware is defined properly
app.use(cookieParser());
app.use(morgan("dev", { stream: morganStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(compression());
app.use(nocache()); // Prevent caching
app.use(hpp());
app.use(limiter);
app.use(speedLimiter);

// Response Time Middleware
app.use(responseTime());

// Timeout Middleware
app.use(timeout((env.SERVER_TIMEOUT as string) || "150s")); // Set a 150-second timeout for all routes

// Permissions Policy
app.use((_, res, next) => {
  res.append("Permissions-Policy", "browsing-topics=()");
  next();
});

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/api", apiRoutes);

// Swagger UI
app.use(openAPIRouter);

// Custom Error Handler Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

// Catch 404 and forward to error handler
app.use((_: Request, res: Response) => {
  res.status(404).send("Route not found");
});

export default app;
