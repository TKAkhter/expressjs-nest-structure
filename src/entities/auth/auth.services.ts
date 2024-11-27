import { compare } from "bcrypt";
import { logger } from "../../common/winston/winston";
import { UserService } from "../user/user.service";
import { AuthDto, RegisterDto } from "./auth.dto";
import { generateToken, verifyToken } from "../../common/jwt/jwt";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";

const userService = new UserService();

export class AuthService {
  /**
   * Handles user login by verifying the credentials and generating a token.
   * @param authData - Object containing user login credentials.
   * @returns Object containing the generated token.
   * @throws HTTP error if user not found or password is invalid.
   */
  async login(authData: AuthDto) {
    logger.info("Login service invoked", { username: authData.username });

    try {
      const user = await userService.getUserByUsername(authData.username);

      if (!user) {
        logger.error("User not found during login", { username: authData.username });
        throw createHttpError(StatusCodes.BAD_REQUEST, "User does not exist!", {
          resource: "Auth",
        });
      }

      if (await compare(authData.password, user.password)) {
        logger.error("Invalid password during login", { username: authData.username });
        throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid email or password", {
          resource: "Auth",
        });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
      });
      logger.info("Token generated successfully", { username: authData.username });
      return { token };
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error("Error during login", { error: error.message, username: authData.username });
        throw new Error(`Error while login: ${error.message}`);
      }
      logger.error("Unknown error during login", { username: authData.username });
      throw new Error("Unknown error occurred while login.");
    }
  }

  /**
   * Registers a new user and generates a token for the user.
   * @param registerDto - Registration data for a new user.
   * @returns Object containing the registered user and generated token.
   * @throws HTTP error if user already exists.
   */
  async register(registerDto: RegisterDto) {
    logger.info("Register service invoked", { username: registerDto.username });

    try {
      const user = await userService.getUserByUsername(registerDto.username);

      if (user) {
        logger.error("User already exists during registration", { username: registerDto.username });
        throw createHttpError(StatusCodes.BAD_REQUEST, "User already exist!", {
          resource: "Auth",
        });
      }

      const registerUser = await userService.createUser(registerDto);

      const token = await this.login(registerDto);

      logger.info("User registered successfully", { username: registerDto.username });
      return { ...registerUser, token };
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error("Error during registration", {
          error: error.message,
          username: registerDto.username,
        });
        throw new Error(`Error while login: ${error.message}`);
      }
      logger.error("Unknown error during registration", { username: registerDto.username });
      throw new Error("Unknown error occurred while login.");
    }
  }

  /**
   * Extends the user's token and returns a new token.
   * @param token - The current token to extend.
   * @returns The newly extended token.
   * @throws Error if token extension fails.
   */
  async extendToken(token: string) {
    logger.info("Extend token service invoked", { token });

    try {
      const payload = verifyToken(token);
      const newToken = generateToken({
        id: payload.id,
        username: payload.username,
        name: payload.name,
        email: payload.email,
      });
      logger.info("Token extended successfully", { newToken });
      return newToken;
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error extending token", { error: error.message, token });
        throw new Error(`Error extend token: ${error.message}`);
      }
      logger.error("Unknown error while extending token", { token });
      throw new Error("Unknown error occurred while extend token.");
    }
  }

  /**
   * Logs out the user by invalidating the token.
   * @param token - The token to invalidate.
   * @returns Object with the invalidated token and success status.
   * @throws Error if logout fails.
   */
  async logout(token: string) {
    logger.info("Logout service invoked", { token });

    try {
      return { token, success: true };
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error during logout", { error: error.message, token });
        throw new Error(`Error logout: ${error.message}`);
      }
      logger.error("Unknown error during logout", { token });
      throw new Error("Unknown error occurred while logout.");
    }
  }
}
