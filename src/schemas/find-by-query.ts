import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Example of a schema for a find by query endpoint
// {
//     "page": 1,
//     "rowsPerPage": 7,
//     "sort": "username:asc",
//     "filter": { "username" : { "$regex": "test23", "$options": "i" }}
// }

export const FindByQuerySchema = z.object({
  page: z.number().min(1).default(1),
  rowsPerPage: z.number().min(1).default(10),
  sort: z
    .string()
    .regex(/^[a-zA-Z]+:(asc|desc)$/, {
      message: "Sort must be in the format 'field:asc' or 'field:desc'",
    })
    .default("createdAt:asc"),
  filter: z.record(z.any()).default({}),
});

export type FindByQueryDto = z.infer<typeof FindByQuerySchema>;
