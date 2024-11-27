import { NextFunction, Response } from "express";
import { AuthDto, RegisterDto } from "./auth.dto";
import { AuthService } from "./auth.services";
import { logger } from "../../common/winston/winston";
import { RequestWithUser } from "../../types/request";

const authService = new AuthService();

export class AuthController {
  /**
   * Handles user login by verifying credentials and returning a token.
   * @param _req - RequestWithUser object
   * @param res - Response object
   * @param next - Next middleware function
   */
  async login(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    const userDto: AuthDto = req.body;
    const { user } = req;
    logger.info("Login API invoked", { username: userDto.username, user });

    try {
      const result = await authService.login(userDto);
      logger.info("User login successful", { username: userDto.username, user });
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Login API error", {
          username: userDto.username,
          error: error.message,
          user,
        });
      } else {
        logger.error("Login API error: Unknown error occurred", { user });
      }
      next(error);
    }
  }

  /**
   * Handles user registration by creating a new user and returning the registered user details.
   * @param _req - RequestWithUser object
   * @param res - Response object
   * @param next - Next middleware function
   */
  async register(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    const registerDto: RegisterDto = req.body;
    const { user } = req;
    logger.info("Register API invoked", { username: registerDto.username, user });

    try {
      const result = await authService.register(registerDto);
      logger.info("User registration successful", { username: registerDto.username, user });
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Register API error", {
          username: registerDto.username,
          error: error.message,
          user,
        });
      } else {
        logger.error("Register API error: Unknown error occurred", { user });
      }
      next(error);
    }
  }

  /**
   * Handles user logout by invalidating the user's token.
   * @param _req - RequestWithUser object
   * @param res - Response object
   * @param next - Next middleware function
   */
  async logout(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers.authorization?.split(" ")[1];
    const { user } = req;
    logger.info("Logout API invoked", { token, user });

    try {
      const result = await authService.logout(token!);
      logger.info("User logout successful", { token, user });
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Logout API error", {
          token,
          error: error.message,
          user,
        });
      } else {
        logger.error("Logout API error: Unknown error occurred", { user });
      }
      next(error);
    }
  }

  /**
   * Extends the user's token and returns a new token.
   * @param _req - RequestWithUser object
   * @param res - Response object
   * @param next - Next middleware function
   */
  async extendToken(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers.authorization?.split(" ")[1];
    const { user } = req;
    logger.info("ExtendToken API invoked", { token, user });

    try {
      const newToken = await authService.extendToken(token!);
      logger.info("Token extended successfully", { newToken, user });
      res.json({ token: newToken });
    } catch (error) {
      if (error instanceof Error) {
        logger.error("ExtendToken API error", {
          token,
          error: error.message,
          user,
        });
      } else {
        logger.error("ExtendToken API error: Unknown error occurred", { user });
      }
      next(error);
    }
  }
}
