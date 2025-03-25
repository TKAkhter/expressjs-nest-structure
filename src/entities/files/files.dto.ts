import { fileSchema } from "@/generated/zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const uploadFilesSchema = fileSchema
  .extend({
    file: z
      .any()
      .openapi({
        type: "string",
        format: "binary",
      })
      .describe("The file to upload")
      .optional(),
    fileViews: z.string(),
  })
  .omit({
    id: true,
    path: true,
    text: true,
    views: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export const updateFilesSchema = fileSchema
  .extend({
    file: z
      .any()
      .openapi({
        type: "string",
        format: "binary",
      })
      .describe("The file to upload")
      .optional(),
    fileViews: z.string(),
  })
  .omit({
    id: true,
    path: true,
    text: true,
    views: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export type UploadFilesDto = z.infer<typeof uploadFilesSchema>;
export type UpdateFilesDto = z.infer<typeof updateFilesSchema>;
