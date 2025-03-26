import { userSchema } from "@/generated/zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const createUserSchema = userSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export const updateUserSchema = userSchema
  .omit({
    id: true,
    password: true,
    createdAt: true,
  })
  .partial();

export type UserDto = z.infer<typeof userSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
