
import { compare } from "bcrypt";
import { UserService } from "../user/user.service";
import { AuthDto, RegisterDto } from "./auth.dto";
import { generateToken, verifyToken } from "../../common/jwt/jwt";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";

const userService = new UserService();

export class AuthService {
    async login(authData: AuthDto) {
        try {
            const user = await userService.getUserByUsername(authData.username);

            if (!user) {
                throw createHttpError(StatusCodes.BAD_REQUEST, "User does not exist!", {
                    resource: "Auth",
                });
            }

            if (await compare(authData.password, user.password)) {
                throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid email or password", {
                    resource: "Auth",
                });
            }

            const token = generateToken({ id: user.id, username: user.username, name: user.name, email: user.email });
            return { token };
        } catch (error) {
            if (createHttpError.isHttpError(error)) {
                throw error;
            }

            if (error instanceof Error) {
                throw new Error(`Error while login: ${error.message}`);
            }
            throw new Error("Unknown error occurred while login.");
        }
    }

    async register(registerDto: RegisterDto) {
        try {
            const user = await userService.getUserByUsername(registerDto.username);

            if (user) {
                throw createHttpError(StatusCodes.BAD_REQUEST, "User already exist!", {
                    resource: "Auth",
                });
            }

            const registerUser = await userService.createUser(registerDto);

            const token = await this.login(registerDto);

            return { ...registerUser, token };
        } catch (error) {
            if (createHttpError.isHttpError(error)) {
                throw error;
            }

            if (error instanceof Error) {
                throw new Error(`Error while login: ${error.message}`);
            }
            throw new Error("Unknown error occurred while login.");
        }
    }

    async extendToken(token: string) {
        try {
            const payload = verifyToken(token);
            return generateToken({ id: payload.id, username: payload.username, name: payload.name, email: payload.email });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error extend token: ${error.message}`);
            }
            throw new Error("Unknown error occurred while extend token.");
        }
    }

    async logout(token: string) {
        try {
            // Typically handle via token blacklist (e.g., Redis).
            return { token, success: true };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error logout: ${error.message}`);
            }
            throw new Error("Unknown error occurred while logout.");
        }
    }
}
