import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { model } from "mongoose";
import { z } from "zod";
import { zodSchema } from "@zodyac/zod-mongoose";

extendZodWithOpenApi(z);

export const FilesSchema = z.object({
  uuid: z.string(),
  userRef: z.string(),
  filePath: z.string(),
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

export const UploadFilesSchema = FilesSchema.omit({
  uuid: true,
  filePath: true,
  fileText: true,
  userId: true,
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

export const UpdateFilesSchema = FilesSchema.omit({
  uuid: true,
  userRef: true,
  filePath: true,
  fileText: true,
  userId: true,
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

export type FilesDto = z.infer<typeof FilesSchema>;
export type UploadFilesDto = z.infer<typeof UploadFilesSchema>;
export type UpdateFilesDto = z.infer<typeof UpdateFilesSchema>;

const schema = zodSchema(FilesSchema);
export const FilesModel = model("Files", schema);
