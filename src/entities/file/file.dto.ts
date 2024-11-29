import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { model } from "mongoose";
import { z } from "zod";
import { zodSchema } from "@zodyac/zod-mongoose";

extendZodWithOpenApi(z);

export const FileSchema = z.object({
  uuid: z.string(),
  filePath: z.string(),
  tags: z.string(),
  fileName: z.string(),
  fileText: z.string(),
  views: z.number().optional(),
  userId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const UploadFileSchema = FileSchema.omit({
  uuid: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateFileSchema = FileSchema.omit({
  uuid: true,
  createdAt: true,
});

export type FileDto = z.infer<typeof FileSchema>;
export type UploadFileDto = z.infer<typeof UploadFileSchema>;
export type UpdateFileDto = z.infer<typeof UpdateFileSchema>;

const schema = zodSchema(FileSchema);
export const FileModel = model("File", schema);
