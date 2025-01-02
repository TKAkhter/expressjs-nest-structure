import { NextFunction, Response } from "express";
import { UserService } from "./user.service";
import { CreateUserDto } from "./user.dto";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "../../common/winston/winston";
import { CustomRequest } from "../../types/request";

const userService = new UserService();
const TAG = "User";
const LOG_FILE_NAME = `[${TAG} controller]`;

export class UserController {
  /**
   * Get all entities objects
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON list of entities
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getAll(_req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    try {
      logger.info(`${LOG_FILE_NAME} Fetching all ${TAG}`);
      const data = await userService.getAll();
      return res.json(data);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${LOG_FILE_NAME} Error fetching all ${TAG}`, { error: error.message });
      }
      next(error);
    }
  }

  /**
   * Get entity by ID
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON entity object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getByUuid(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    const { uuid } = req.params;
    const { user } = req;
    try {
      logger.info(`${LOG_FILE_NAME} Fetching ${TAG} by uuid`, { user, uuid });
      const data = await userService.getByUuid(uuid);
      return res.json(data);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${LOG_FILE_NAME} Error fetching ${TAG} by uuid`, {
          error: error.message,
          user,
          uuid,
        });
      }
      next(error);
    }
  }

  /**
   * Get entity by email
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON entity object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getByEmail(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    const { email } = req.params;
    const { user } = req;
    try {
      logger.info(`${LOG_FILE_NAME} Fetching ${TAG} by email`, { user, email });
      const data = await userService.getByEmail(email);
      return res.json(data);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${LOG_FILE_NAME} Error fetching ${TAG} by email`, {
          error: error.message,
          user,
          email,
        });
      }
      next(error);
    }
  }

  /**
   * Find entities by query (pagination, sorting, filtering)
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON result of the query
   */
  async findByQuery(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paginate, orderBy, filter } = req.body;
      const queryOptions = { paginate, orderBy, filter };
      logger.info(`${LOG_FILE_NAME} Finding ${TAG} by query`, { queryOptions });

      const result = await userService.findByQuery(queryOptions);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${LOG_FILE_NAME} Error finding ${TAG} by query`, { error: error.message });
      }
      next(error);
    }
  }

  /**
   * Create a new entity
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON created entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    const userDto: CreateUserDto = req.body;
    const { user } = req;
    try {
      logger.info(`${LOG_FILE_NAME} Creating new ${TAG}`, { user, userDto });
      const created = await userService.create(userDto);
      return res.json(created);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${LOG_FILE_NAME} Error creating ${TAG}`, {
          error: error.message,
          user,
          userDto,
        });
      }
      next(error);
    }
  }

  /**
   * Update an existing entity
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON updated entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    const updateDto = req.body;
    const { user } = req;
    try {
      logger.info(`${LOG_FILE_NAME} Updating ${TAG}`, { user, id, updateDto });
      const updatedData = await userService.update(id, updateDto);
      return res.json(updatedData);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${LOG_FILE_NAME} Error updating ${TAG}`, {
          error: error.message,
          user,
          id,
          updateDto,
        });
      }
      next(error);
    }
  }

  /**
   * Delete a entity by ID
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON success message
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async delete(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    const { uuid } = req.params;
    const { user } = req;
    try {
      logger.info(`${LOG_FILE_NAME} Deleting ${TAG} by uuid`, { user, uuid });
      await userService.delete(uuid);
      return res.json({ message: `${TAG} Deleted Successfully` });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${LOG_FILE_NAME} Error deleting ${TAG}`, {
          error: error.message,
          user,
          uuid,
        });
      }
      next(error);
    }
  }

  /**
   * Delete multiple entities
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON success message
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteAll(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
    const { ids } = req.body;
    const { user } = req;
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid or empty array of IDs", {
          resource: TAG,
        });
      }

      logger.info(`${LOG_FILE_NAME} Deleting multiple ${TAG}`, { user, ids });
      const result = await userService.deleteAll(ids);

      return res.json({
        message: `${result.deletedCount} ${TAG} deleted successfully`,
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${LOG_FILE_NAME} Error deleting ${TAG}`, {
          error: error.message,
          user,
          ids,
        });
      }
      next(error);
    }
  }
}
