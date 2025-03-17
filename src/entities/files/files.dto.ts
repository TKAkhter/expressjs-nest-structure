import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const FilesSchema = z.object({
  id: z.string(),
  userRef: z.string(),
  tags: z.string(),
  fileName: z.string(),
  views: z.string(),
  file: z
    .any()
    .openapi({
      type: "string",
      format: "binary",
    })
    .describe("The file to upload")
    .optional(),
});

export const UploadFilesSchema = FilesSchema.omit({
  id: true,
});

export const UpdateFilesSchema = UploadFilesSchema.omit({
  userRef: true,
}).extend({
  updatedAt: z.date().default(() => new Date()),
});

export type UploadFilesDto = z.infer<typeof UploadFilesSchema>;
export type UpdateFilesDto = z.infer<typeof UpdateFilesSchema>;
