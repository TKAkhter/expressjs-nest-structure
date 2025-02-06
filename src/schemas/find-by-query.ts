import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// See query examples in query-examples.txt

const OrderBySchema = z.object({
  sort: z.string(),
  order: z.enum(["asc", "desc"]),
});

const PaginateSchema = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).default(10),
});

export const FindByQuerySchema = z.object({
  filter: z.object({}),
  paginate: PaginateSchema.optional(),
  orderBy: z.array(OrderBySchema).optional(),
});

export type FindByQueryDto = z.infer<typeof FindByQuerySchema>;
