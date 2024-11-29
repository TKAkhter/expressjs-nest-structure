import { NextFunction, Response } from "express";
import { UserService } from "./user.service";
import { CreateUserDto } from "./user.dto";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "../../common/winston/winston";
import { CustomRequest } from "../../types/request";

const userService = new UserService();

export class UserController {
  /**
   * Get all users
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON list of users
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getAllUsers(_req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      logger.info("Fetching all users");
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error fetching all users", { error: error.message });
      }
      next(error);
    }
  }

  /**
   * Get user by ID
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON user object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUser(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    const { user } = req;
    try {
      logger.info("Fetching user by ID", { user, id });
      const userData = await userService.getUserByUuid(id);
      return res.json(userData);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error fetching user by ID", { error: error.message, user, id });
      }
      next(error);
    }
  }

  /**
   * Get user by username
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON user object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUserByUsername(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    const { username } = req.params;
    const { user } = req;
    try {
      logger.info("Fetching user by username", { user, username });
      const userData = await userService.getUserByUsername(username);
      return res.json(userData);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error fetching user by username", { error: error.message, user, username });
      }
      next(error);
    }
  }

  /**
   * Find users by query (pagination, sorting, filtering)
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON result of the query
   */
  async findByQuery(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, rowsPerPage, sort, filter } = req.body;
      const queryOptions = { page, rowsPerPage, sort, filter };
      logger.info("Finding users by query", { queryOptions });

      const result = await userService.findByQuery(queryOptions);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error finding users by query", { error: error.message });
      }
      next(error);
    }
  }

  /**
   * Create a new user
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON created user
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createUser(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    const userDto: CreateUserDto = req.body;
    const { user } = req;
    try {
      logger.info("Creating new user", { user, userDto });
      const createdUser = await userService.createUser(userDto);
      return res.json(createdUser);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error creating user", { error: error.message, user, userDto });
      }
      next(error);
    }
  }

  /**
   * Update an existing user
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON updated user
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateUser(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    const updateData = req.body;
    const { user } = req;
    try {
      logger.info("Updating user", { user, id, updateData });
      const updatedUser = await userService.updateUser(id, updateData);
      return res.json(updatedUser);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error updating user", { error: error.message, user, id, updateData });
      }
      next(error);
    }
  }

  /**
   * Delete a user by ID
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON success message
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteUser(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    const { user } = req;
    try {
      logger.info("Deleting user by ID", { user, id });
      await userService.deleteUser(id);
      return res.json({ message: "User Deleted Successfully" });
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error deleting user", { error: error.message, user, id });
      }
      next(error);
    }
  }

  /**
   * Delete multiple users
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON success message
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteAllUsers(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    const { ids } = req.body;
    const { user } = req;
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid or empty array of IDs.", {
          resource: "User",
        });
      }

      logger.info("Deleting multiple users", { user, ids });
      const result = await userService.deleteAllUsers(ids);

      return res.json({
        message: `${result.deletedCount} users deleted successfully.`,
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error deleting users", { error: error.message, user, ids });
      }
      next(error);
    }
  }
}
