import express, { type Request, type Response, type Router } from "express";
import { generateOpenAPIDocument } from "./swagger-document-generator";
import swaggerUi from "swagger-ui-express";

export const openAPIRouter: Router = express.Router();
const openAPIDocument = generateOpenAPIDocument();

openAPIRouter.get("/docs/swagger.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(openAPIDocument);
});

openAPIRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(openAPIDocument));
