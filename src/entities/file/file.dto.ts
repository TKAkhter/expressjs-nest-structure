import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { model } from "mongoose";
import { z } from "zod";
import { zodSchema } from "@zodyac/zod-mongoose";

extendZodWithOpenApi(z);

export const FileSchema = z.object({
  uuid: z.string(),
  filePath: z.string().optional(),
  tags: z.string(),
  fileName: z.string().optional(),
  fileText: z.string().optional(),
  views: z.string().optional(),
  userId: z.string().optional(),
  createdAt: z
    .date()
    .default(() => new Date())
    .optional(),
  updatedAt: z
    .date()
    .default(() => new Date())
    .optional(),
});

export const UploadFileSchema = FileSchema.omit({
  uuid: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  file: z
    .any()
    .openapi({
      type: "string",
      format: "binary",
    })
    .describe("The file to upload")
    .optional(),
});

export const UpdateFileSchema = FileSchema.omit({
  uuid: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  file: z
    .any()
    .openapi({
      type: "string",
      format: "binary",
    })
    .describe("The file to upload")
    .optional(),
});

export type FileDto = z.infer<typeof FileSchema>;
export type UploadFileDto = z.infer<typeof UploadFileSchema>;
export type UpdateFileDto = z.infer<typeof UpdateFileSchema>;

const schema = zodSchema(FileSchema);
export const FileModel = model("File", schema);
