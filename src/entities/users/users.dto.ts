import { userSchema } from "@/generated/zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const createUsersSchema = userSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export const updateUsersSchema = userSchema
  .omit({
    id: true,
    password: true,
    createdAt: true,
  })
  .partial();

export type UsersDto = z.infer<typeof userSchema>;
export type CreateUsersDto = z.infer<typeof createUsersSchema>;
export type UpdateUsersDto = z.infer<typeof updateUsersSchema>;
