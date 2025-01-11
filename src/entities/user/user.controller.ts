import { NextFunction, Response } from "express";
import { UserService } from "@/entities/user/user.service";
import { CreateUserDto } from "@/entities/user/user.dto";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/common/winston/winston";
import { CustomRequest } from "@/types/request";
import { csvToJson } from "@/utils/utils";
import { generateCache } from "@/common/cache/generate-cache";

export class UserController {
  public collectionName: string;
  public logFileName: string;
  public userService: UserService;

  constructor() {
    this.collectionName = "users";
    this.logFileName = `[${this.collectionName} Controller]`;
    this.userService = new UserService(this.collectionName, `[${this.collectionName} Service]`);
  }

  /**
   * Get all entities objects
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON list of entities
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll = async (_req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      logger.info(`${this.logFileName} Fetching all ${this.collectionName}`);
      const data = await this.userService.getAll();
      // Generate cache if enabled
      await generateCache(res.locals.cacheKey, data);

      return res.json(data);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching all ${this.collectionName}`, {
          error: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * Get entity by ID
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON entity object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getById = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const { user } = req;
    try {
      logger.info(`${this.logFileName} Fetching ${this.collectionName} by ID`, { user, id });
      const data = await this.userService.getById(id);
      // Generate cache if enabled
      await generateCache(res.locals.cacheKey, data);
      return res.json(data);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching ${this.collectionName} by ID`, {
          error: error.message,
          user,
          id,
        });
      }
      next(error);
    }
  };

  /**
   * Get entity by ID
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON entity object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getByUuid = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { uuid } = req.params;
    const { user } = req;
    try {
      logger.info(`${this.logFileName} Fetching ${this.collectionName} by uuid`, { user, uuid });
      const data = await this.userService.getByUuid(uuid);
      // Generate cache if enabled
      await generateCache(res.locals.cacheKey, data);
      return res.json(data);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching ${this.collectionName} by uuid`, {
          error: error.message,
          user,
          uuid,
        });
      }
      next(error);
    }
  };

  /**
   * Get entity by email
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON entity object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getByEmail = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { email } = req.params;
    const { user } = req;
    try {
      logger.info(`${this.logFileName} Fetching ${this.collectionName} by email`, { user, email });
      const data = await this.userService.getByEmail(email);
      // Generate cache if enabled
      await generateCache(res.locals.cacheKey, data);
      return res.json(data);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching ${this.collectionName} by email`, {
          error: error.message,
          user,
          email,
        });
      }
      next(error);
    }
  };

  /**
   * Find entities by query (pagination, sorting, filtering)
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON result of the query
   */
  findByQuery = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { paginate, orderBy, filter } = req.body;
      const queryOptions = { paginate, orderBy, filter };
      logger.info(`${this.logFileName} Finding ${this.collectionName} by query`, { queryOptions });

      const result = await this.userService.findByQuery(queryOptions);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error finding ${this.collectionName} by query`, {
          error: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * Create a new entity
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON created entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const createDto: CreateUserDto = req.body;
    const { user } = req;
    try {
      logger.info(`${this.logFileName} Creating new ${this.collectionName}`, { user, createDto });
      const created = await this.userService.create(createDto);
      return res.json(created);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error creating ${this.collectionName}`, {
          error: error.message,
          user,
          createDto,
        });
      }
      next(error);
    }
  };

  /**
   * Update an existing entity
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON updated entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const updateDto = req.body;
    const { user } = req;
    try {
      logger.info(`${this.logFileName} Updating ${this.collectionName}`, { user, id, updateDto });
      const updatedData = await this.userService.update(id, updateDto);
      return res.json(updatedData);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error updating ${this.collectionName}`, {
          error: error.message,
          user,
          id,
          updateDto,
        });
      }
      next(error);
    }
  };

  /**
   * Delete a entity by ID
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON success message
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const { user } = req;
    try {
      logger.info(`${this.logFileName} Deleting ${this.collectionName} by ID`, { user, id });
      await this.userService.delete(id);
      return res.json({ message: `${this.collectionName} Deleted Successfully` });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error deleting ${this.collectionName}`, {
          error: error.message,
          user,
          id,
        });
      }
      next(error);
    }
  };

  /**
   * Delete multiple entities
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON success message
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { ids } = req.body;
    const { user } = req;
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid or empty array of IDs", {
          resource: this.collectionName,
        });
      }

      logger.info(`${this.logFileName} Deleting multiple ${this.collectionName}`, { user, ids });
      const result = await this.userService.deleteAll(ids);

      return res.json({
        message: `${result.deletedCount} ${this.collectionName} deleted successfully`,
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error deleting ${this.collectionName}`, {
          error: error.message,
          user,
          ids,
        });
      }
      next(error);
    }
  };

  /**
   * Import entities
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON created entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  import = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { user, file } = req;
    const { userId } = req.body;
    if (!file) {
      return next(createHttpError(StatusCodes.BAD_REQUEST, "No file uploaded."));
    }
    try {
      logger.info(`${this.logFileName} Importing new ${this.collectionName}`, { user });

      const importEntries = await csvToJson(file.path);

      const imported = await this.userService.import(importEntries, userId);
      return res.json(imported);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error creating ${this.collectionName}`, {
          error: error.message,
          user,
        });
      }
      next(error);
    }
  };

  /**
   * Export entities
   * @param _req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON list of entities
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export = async (_req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      logger.info(`${this.logFileName} Exporting ${this.collectionName}`);
      const csv = await this.userService.export();
      res.header("Content-Type", "text/csv");
      res.header("Content-Disposition", "attachment; filename=accounts.csv");
      res.send(csv);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error exporting ${this.collectionName}`, {
          error: error.message,
        });
      }
      next(error);
    }
  };
}
