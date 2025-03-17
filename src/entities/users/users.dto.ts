import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const UsersSchema = z.object({
  id: z.string(),
  uuid: z.string(),
  name: z.string().min(4, "Name must be at least 4 characters long"),
  username: z.string().min(4, "Username must be at least 4 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  bio: z.string(),
  phoneNumber: z.string(),
  resetToken: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUsersSchema = UsersSchema.omit({
  id: true,
  uuid: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const UpdateUsersSchema = UsersSchema.omit({
  id: true,
  uuid: true,
  password: true,
  createdAt: true,
}).partial();

export type UsersDto = z.infer<typeof UsersSchema>;
export type CreateUsersDto = z.infer<typeof CreateUsersSchema>;
export type UpdateUsersDto = z.infer<typeof UpdateUsersSchema>;
