import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const AuthSchema = z.object({
  username: z.string().min(4, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LogoutSchema = z.object({
  success: z.boolean(),
});

export const ExtendTokenSchema = z.object({
  token: z.string(),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(4, { message: "Name is required" }),
    username: z.string().min(4, { message: "Username is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/\d/, { message: "Password must contain at least one number" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type AuthDto = z.infer<typeof AuthSchema>;
