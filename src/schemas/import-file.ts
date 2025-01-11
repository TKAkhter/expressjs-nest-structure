import { z } from "zod";

export const ImportFileSchema = z.object({
  file: z
    .any()
    .openapi({
      type: "string",
      format: "binary",
    })
    .describe("The file to upload"),
  accountId: z.string(),
});
