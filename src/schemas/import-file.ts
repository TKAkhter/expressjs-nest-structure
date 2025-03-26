import { z } from "zod";

export const importFileSchema = z.object({
  file: z
    .any()
    .openapi({
      type: "string",
      format: "binary",
    })
    .describe("The file to upload"),
});
