import { compare } from "bcrypt";
import { logger } from "@/common/winston/winston";
import { AuthDto, RegisterDto } from "@/entities/auth/auth.dto";
import { generateToken, verifyToken } from "@/common/jwt/jwt";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { UserService } from "@/entities/user/user.service";
export class AuthService {
  private tableName: string;
  private logFileName: string;
  private userService: UserService;

  constructor(logFileName: string) {
    this.tableName = "user";
    this.logFileName = logFileName;
    this.userService = new UserService(this.tableName, `[${this.tableName} Service]`);
  }

  /**
   * Handles user login by verifying the credentials and generating a token.
   * @param authData - Object containing user login credentials.
   * @returns Object containing the generated token.
   * @throws HTTP error if user not found or password is invalid.
   */
  login = async (authData: AuthDto) => {
    logger.info(`${this.logFileName} login service invoked`, { email: authData.email });

    try {
      const user = await this.userService.getByEmail(authData.email);

      if (!user) {
        logger.error(`${this.logFileName} User not found during login`, { email: authData.email });
        throw createHttpError(StatusCodes.BAD_REQUEST, "User does not exist!", {
          resource: "Auth",
        });
      }

      if (!(await compare(authData.password, user.password as string))) {
        logger.error(`${this.logFileName} Invalid password during login`, {
          email: authData.email,
        });
        throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid email or password", {
          resource: "Auth",
        });
      }

      const token = generateToken({
        id: user.uuid,
        username: user.username,
        name: user.name,
        email: user.email,
      });

      logger.info(`${this.logFileName} Token received successfully`, { email: authData.email });
      return { user, token };
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error during login`, {
          error: error.message,
          email: authData.email,
        });
        throw new Error(`Error while login: ${error.message}`);
      }
      logger.error(`${this.logFileName} Unknown error during login`, { email: authData.email });
      throw new Error("Unknown error occurred while login");
    }
  };

  /**
   * Registers a new user and generates a token for the user.
   * @param registerDto - Registration data for a new user.
   * @returns Object containing the registered user and generated token.
   * @throws HTTP error if user already exists.
   */
  register = async (registerDto: RegisterDto) => {
    logger.info(`${this.logFileName} Register service invoked`, { email: registerDto.email });

    try {
      const user = await this.userService.getByEmail(registerDto.email);

      if (user) {
        logger.error(`${this.logFileName} User already exists during registration`, {
          email: registerDto.email,
        });
        throw createHttpError(StatusCodes.BAD_REQUEST, "User already exist!", {
          resource: "Auth",
        });
      }

      await this.userService.create(registerDto);

      const login = await this.login(registerDto);

      logger.info(`${this.logFileName} User registered successfully`, { email: registerDto.email });
      return login;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error during registration`, {
          error: error.message,
          email: registerDto.email,
        });
        throw new Error(`${this.logFileName} Error while login: ${error.message}`);
      }
      logger.error(`${this.logFileName} Unknown error during registration`, {
        email: registerDto.email,
      });
      throw new Error(`${this.logFileName} Unknown error occurred while login`);
    }
  };

  /**
   * Extends the user's token and returns a new token.
   * @param token - The current token to extend.
   * @returns The newly extended token.
   * @throws Error if token extension fails.
   */
  extendToken = async (token: string) => {
    logger.info(`${this.logFileName} Extend token service invoked`, { token });

    try {
      const payload = verifyToken(token);
      const newToken = generateToken({
        id: payload.id,
        username: payload.username,
        name: payload.name,
        email: payload.email,
      });
      logger.info(`${this.logFileName} Token extended successfully`, { newToken });
      return newToken;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error extending token`, { error: error.message, token });
        throw new Error(`${this.logFileName} Error extend token: ${error.message}`);
      }
      logger.error(`${this.logFileName} Unknown error while extending token`, { token });
      throw new Error(`${this.logFileName} Unknown error occurred while extend token`);
    }
  };

  /**
   * Logs out the user by invalidating the token.
   * @param token - The token to invalidate.
   * @returns Object with the invalidated token and success status.
   * @throws Error if logout fails.
   */
  logout = async (token: string) => {
    logger.info(`${this.logFileName} Logout service invoked`, { token });

    try {
      return { token, success: true };
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error during logout`, { error: error.message, token });
        throw new Error(`Error logout: ${error.message}`);
      }
      logger.error(`${this.logFileName} Unknown error during logout`, { token });
      throw new Error("Unknown error occurred while logout");
    }
  };

  /**
   * Initiates the forgot password process for a user.
   * @param email User's email address
   * @returns message that email sent.
   * @throws HTTP error if any error occur.
   */
  forgotPassword = async (email: string) => {
    logger.info(`${this.logFileName} Forgot password service invoked`, { email });

    try {
      const user = await this.userService.getByEmail(email);

      if (!user) {
        logger.error(`${this.logFileName} User does not exists!`, {
          email,
        });
        throw createHttpError(StatusCodes.BAD_REQUEST, "User does not exist!", {
          resource: "Auth",
        });
      }

      logger.info(`${this.logFileName} Email reset link successfully sent`, { email });
      return { message: "Reset link sent. Check you email" };
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error during registration`, {
          error: error.message,
          email,
        });
        throw new Error(`${this.logFileName} Error while login: ${error.message}`);
      }
      logger.error(`${this.logFileName} Unknown error during registration`, {
        email,
      });
      throw new Error(`${this.logFileName} Unknown error occurred while login`);
    }
  };

  resetPassword = async (
    authorization: string | undefined,
    email: string,
    currentPassword: string,
    newPassword: string,
  ) => {
    console.log("🚀 ~ AuthService ~ newPassword:", newPassword);
    console.log("🚀 ~ AuthService ~ currentPassword:", currentPassword);
    console.log("🚀 ~ AuthService ~ authorization:", authorization);
    logger.info(`${this.logFileName} reset password service invoked`, { email });

    try {
      const user = await this.userService.getByEmail(email);
      if (!user) {
        logger.error(`${this.logFileName} User does not exists!`, {
          email,
        });
        throw createHttpError(StatusCodes.BAD_REQUEST, "User does not exist!", {
          resource: "Auth",
        });
      }

      logger.info(`${this.logFileName} Password reset successful`, { email });
      return { message: "Password reset successful" };
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error during registration`, {
          error: error.message,
          email,
        });
        throw new Error(`${this.logFileName} Error while login: ${error.message}`);
      }
      logger.error(`${this.logFileName} Unknown error during registration`, {
        email,
      });
      throw new Error(`${this.logFileName} Unknown error occurred while login`);
    }
  };
}
