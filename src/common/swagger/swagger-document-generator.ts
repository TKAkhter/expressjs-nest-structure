import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { userRegistry } from "../../entities/user/user.route";
import { healthCheckRegistry } from "../../entities/health-check/health-check";
import { env } from "../../config/env";

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([healthCheckRegistry, userRegistry]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Swagger API",
      description: "This is a simple CRUD API application made with Express and documented with Swagger",
      // contact: {
      //   name: "LogRocket",
      //   url: "https://logrocket.com",
      //   email: "info@email.com",
      // },
    },
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/swagger.json",
    },
    servers: [
      {
        url: `${env.BASE_URL}/api`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // Optional, but helpful to specify token format
        },
      },
    },
    security: [
      {
        BearerAuth: [], // Applies the BearerAuth security globally
      },
    ],
  });
}
