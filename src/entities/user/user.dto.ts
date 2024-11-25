import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { model } from "mongoose";
import { z } from "zod";
import { zodSchema } from "@zodyac/zod-mongoose";

extendZodWithOpenApi(z);

export const UserSchema = z.object({
  uuid: z.string().optional(),
  name: z.string().min(4, "Name is required"),
  username: z.string().min(4, "Username is required"),
  // Email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateUserSchema = UserSchema.omit({
  uuid: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserSchema = UserSchema.omit({
  uuid: true,
  createdAt: true,
  username: true,
});

export type UserDto = z.infer<typeof UserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

const schema = zodSchema(UserSchema);
export const UserModel = model("User", schema);
