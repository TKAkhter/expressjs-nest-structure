import { NextFunction, Response } from "express";
import { AuthDto, RegisterDto } from "./auth.dto";
import { AuthService } from "./auth.services";
import { logger } from "../../common/winston/winston";
import { CustomRequest } from "../../types/request";

const authService = new AuthService();

export class AuthController {
  /**
   * Handles user login by verifying credentials and returning a token.
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  async login(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const userDto: AuthDto = req.body;
    const { user } = req;
    logger.info("Login API invoked", { email: userDto.email, user });

    try {
      const result = await authService.login(userDto);
      logger.info("User login successful", { email: userDto.email, user });
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Login API error", {
          email: userDto.email,
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
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  async register(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const registerDto: RegisterDto = req.body;
    const { user } = req;
    logger.info("Register API invoked", { email: registerDto.email, user });

    try {
      const result = await authService.register(registerDto);
      logger.info("User registration successful", { email: registerDto.email, user });
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Register API error", {
          email: registerDto.email,
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
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  async logout(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
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
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  async extendToken(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
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
