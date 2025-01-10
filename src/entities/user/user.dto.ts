import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { model } from "mongoose";
import { z } from "zod";
import { zodSchema } from "@zodyac/zod-mongoose";

extendZodWithOpenApi(z);

export const UserSchema = z.object({
  uuid: z.string(),
  name: z.string().min(4, "Name must be at least 4 characters long"),
  username: z.string().min(4, "Username must be at least 4 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  bio: z.string().optional(),
  phoneNumber: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = UserSchema.omit({
  uuid: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserSchema = UserSchema.omit({
  uuid: true,
  password: true,
  createdAt: true,
  updatedAt: true,
});

export type UserDto = z.infer<typeof UserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

const schema = zodSchema(UserSchema);
export const UserModel = model("User", schema);

export type User = {
  uuid: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  bio?: string;
  phoneNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
