import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { zodSchema } from "@zodyac/zod-mongoose";
import { model } from "mongoose";

extendZodWithOpenApi(z);

export const UserSchema = z.object({
  uuid: z.string().optional(),
  name: z.string().min(4, "Name is required"),
  username: z.string().min(4, "Username is required"),
  // email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});


export const CreateUserDto = UserSchema.omit({
  uuid: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserDto = UserSchema.omit({
  uuid: true,
  createdAt: true,
  updatedAt: true,
  username: true,
});

export type UserDto = z.infer<typeof UserSchema>;

const schema = zodSchema(UserSchema);

export const User = model("User", schema);
