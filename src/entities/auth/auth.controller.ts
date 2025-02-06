import { NextFunction, Response } from "express";
import { AuthDto, RegisterDto, ResetPasswordDto } from "@/entities/auth/auth.dto";
import { AuthService } from "@/entities/auth/auth.services";
import { logger } from "@/common/winston/winston";
import { CustomRequest } from "@/types/request";

export class AuthController {
  private collectionName: string;
  private authService: AuthService;

  constructor() {
    this.collectionName = "Auth";
    this.authService = new AuthService("Auth");
  }

  /**
   * Handles user login by verifying credentials and returning a token.
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  login = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const loginDto: AuthDto = req.body;
    const { loggedUser } = req;
    logger.info(`[${this.collectionName} Controller] login API invoked`, {
      email: loginDto.email,
      loggedUser,
    });

    try {
      const result = await this.authService.login(loginDto);
      logger.info(`[${this.collectionName} Controller] User login successful`, {
        email: loginDto.email,
        loggedUser,
      });
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`[${this.collectionName} Controller] login API error`, {
          email: loginDto.email,
          error: error.message,
          loggedUser,
        });
      } else {
        logger.warn(`[${this.collectionName} Controller] login API error: Unknown error occurred`, {
          loggedUser,
        });
      }
      next(error);
    }
  };

  /**
   * Handles user registration by creating a new user and returning the registered user details.
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  register = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const registerDto: RegisterDto = req.body;
    const { loggedUser } = req;
    logger.info(`[${this.collectionName} Controller] Register API invoked`, {
      email: registerDto.email,
      loggedUser,
    });

    try {
      const result = await this.authService.register(registerDto);
      logger.info(`[${this.collectionName} Controller] User registration successful`, {
        email: registerDto.email,
        loggedUser,
      });
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`[${this.collectionName} Controller] Register API error`, {
          email: registerDto.email,
          error: error.message,
          loggedUser,
        });
      } else {
        logger.warn(
          `[${this.collectionName} Controller] Register API error: Unknown error occurred`,
          {
            loggedUser,
          },
        );
      }
      next(error);
    }
  };

  /**
   * Handles user logout by invalidating the user's token.
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  logout = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];
    const { loggedUser } = req;
    logger.info(`[${this.collectionName} Controller] Logout API invoked`, { token, loggedUser });

    try {
      const result = await this.authService.logout(token!);
      logger.info(`[${this.collectionName} Controller] User logout successful`, {
        token,
        loggedUser,
      });
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`[${this.collectionName} Controller] Logout API error`, {
          token,
          error: error.message,
          loggedUser,
        });
      } else {
        logger.warn(
          `[${this.collectionName} Controller] Logout API error: Unknown error occurred`,
          { loggedUser },
        );
      }
      next(error);
    }
  };

  /**
   * Extends the user's token and returns a new token.
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  extendToken = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];
    const { loggedUser } = req;
    logger.info(`[${this.collectionName} Controller] ExtendToken API invoked`, {
      token,
      loggedUser,
    });

    try {
      const newToken = await this.authService.extendToken(token!);
      logger.info(`[${this.collectionName} Controller] Token extended successfully`, {
        newToken,
        loggedUser,
      });
      res.json({ token: newToken });
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`[${this.collectionName} Controller] ExtendToken API error`, {
          token,
          error: error.message,
          loggedUser,
        });
      } else {
        logger.warn(
          `[${this.collectionName} Controller] ExtendToken API error: Unknown error occurred`,
          {
            loggedUser,
          },
        );
      }
      next(error);
    }
  };

  /**
   * Initiates the forgot password process for a user.
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  forgotPassword = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;
    const { loggedUser } = req;
    logger.info(`[${this.collectionName} Controller] Forgot password API invoked`, {
      email,
      loggedUser,
    });

    try {
      const message = await this.authService.forgotPassword(email);
      logger.info(`[${this.collectionName} Controller] Forgot password successful`, {
        email,
        loggedUser,
      });
      res.json(message);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`[${this.collectionName} Controller] Forgot password API error`, {
          email,
          error: error.message,
          loggedUser,
        });
      } else {
        logger.warn(
          `[${this.collectionName} Controller] Forgot password API error: Unknown error occurred`,
          {
            loggedUser,
          },
        );
      }
      next(error);
    }
  };

  /**
   * Initiates the reset password process for a user.
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   */
  resetPassword = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const { resetToken, password, confirmPassword } = req.body;
    const { loggedUser } = req;
    logger.info(`[${this.collectionName} Controller] Reset password API invoked`, {
      resetToken,
      loggedUser,
    });

    const resetPasswordDto: ResetPasswordDto = {
      password: password as string,
      confirmPassword: confirmPassword as string,
      resetToken: resetToken as string,
    };
    try {
      const message = await this.authService.resetPassword(resetPasswordDto);
      logger.info(`[${this.collectionName} Controller] Reset password successful`, {
        resetToken,
        loggedUser,
      });
      res.json(message);
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`[${this.collectionName} Controller] Reset password API error`, {
          resetToken,
          error: error.message,
          loggedUser,
        });
      } else {
        logger.warn(
          `[${this.collectionName} Controller] Reset password API error: Unknown error occurred`,
          {
            loggedUser,
          },
        );
      }
      next(error);
    }
  };
}
