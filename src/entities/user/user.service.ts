import { UserDto, UpdateUserDto, CreateUserDto } from "@/entities/user/user.dto";
import { env } from "@/config/env";
import { hash } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { FindByQueryDto } from "@/schemas/find-by-query";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/common/winston/winston";
import { UserRepository } from "./user.repository";
import { parseAsync } from "json2csv";

export class UserService {
  private userRepository: UserRepository;
  private tableName: string;
  private logFileName: string;

  constructor(tableName: string, logFileName: string) {
    this.userRepository = new UserRepository();
    this.tableName = tableName;
    this.logFileName = logFileName;
  }

  /**
   * Fetches all entities from the database.
   * @returns Array of entities
   */
  getAll = async (): Promise<UserDto[]> => {
    try {
      logger.info(`${this.logFileName} Fetching all ${this.tableName}`);
      const data = await this.userRepository.getAll();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching all ${this.tableName}`, {
          error: error.message,
        });
        throw new Error(`Error fetching ${this.tableName}: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while fetching all ${this.tableName}`,
      );
      throw new Error(`Unknown error occurred while fetching ${this.tableName}`);
    }
  };

  /**
   * Fetches a entity by their id.
   * @param id - entity's unique identifier
   * @returns entity data
   */
  getById = async (id: string): Promise<UserDto> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.tableName} with id: ${id}`);
      const data = await this.userRepository.getById(id);

      if (!data) {
        logger.error(`${this.logFileName} ${this.tableName} with id ${id} not found`);
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.tableName} not found`, {
          resource: this.tableName,
        });
      }

      return data;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching ${this.tableName} by id`, {
          id,
          error: error.message,
        });
        throw new Error(`Error fetching ${this.tableName} by id: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while fetching ${this.tableName} by id`,
      );
      throw new Error(`Unknown error occurred while fetching ${this.tableName} by id`);
    }
  };

  /**
   * Fetches a entity by their UUID.
   * @param uuid - entity's unique identifier
   * @returns entity data
   */
  getByUuid = async (uuid: string): Promise<UserDto> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.tableName} with uuid: ${uuid}`);
      const data = await this.userRepository.getByUuid(uuid);

      if (!data) {
        logger.error(`${this.logFileName} ${this.tableName} with uuid ${uuid} not found`);
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.tableName} not found`, {
          resource: this.tableName,
        });
      }

      return data;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching ${this.tableName} by uuid`, {
          uuid,
          error: error.message,
        });
        throw new Error(`Error fetching ${this.tableName} by uuid: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while fetching ${this.tableName} by uuid`,
      );
      throw new Error(`Unknown error occurred while fetching ${this.tableName} by uuid`);
    }
  };

  /**
   * Fetches a entity by their email.
   * @param email - entity's email
   * @returns entity data or false if not found
   */
  getByEmail = async (email: string): Promise<UserDto | false> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.tableName} with email: ${email}`);
      const data = await this.userRepository.getByEmail(email);

      if (!data) {
        logger.error(`${this.logFileName} ${this.tableName} with email ${email} not found`);
        return false;
      }

      return data;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching ${this.tableName} by email`, {
          email,
          error: error.message,
        });
        throw new Error(`Error fetching ${this.tableName} by email: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while fetching ${this.tableName} by email`,
      );
      throw new Error(`Unknown error occurred while fetching ${this.tableName} by email`);
    }
  };

  /**
   * Finds entities based on query parameters.
   * @param options - Query parameters like pagination, sorting, and filtering
   * @returns Paginated entity data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findByQuery = async (options: FindByQueryDto): Promise<any> => {
    try {
      logger.info(
        `${this.logFileName} Querying ${this.tableName} with options: ${JSON.stringify(options)}`,
      );
      return await this.userRepository.findByQuery(options);
    } catch (error) {
      logger.error(`${this.logFileName} Error querying ${this.tableName}`, {
        options,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new Error(`Error querying ${this.tableName}`);
    }
  };

  /**
   * Creates a new entity.
   * @param createDto - Data for creating a new entity
   * @returns Created entity data
   */
  create = async (createDto: CreateUserDto): Promise<UserDto> => {
    try {
      logger.info(`${this.logFileName} Creating ${this.tableName} with email: ${createDto.email}`);
      const data = await this.userRepository.getByEmail(createDto.email);
      const username = await this.userRepository.getByUsername(createDto.username);

      if (data) {
        logger.error(
          `${this.logFileName} ${this.tableName} with email ${createDto.email} already exists`,
        );
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.tableName} already exists!`, {
          resource: this.tableName,
        });
      }

      if (username) {
        logger.error(
          `${this.logFileName} ${this.tableName} with username ${createDto.username} already exists.`,
        );
        throw createHttpError(StatusCodes.BAD_REQUEST, "Username is taken!", {
          resource: "User",
        });
      }

      const hashedPassword = await hash(createDto.password, env.HASH!);
      const currentTime = new Date();
      const newDto = {
        ...createDto,
        uuid: uuidv4(),
        password: hashedPassword,
        createdAt: currentTime,
        updatedAt: currentTime,
      };

      return await this.userRepository.create(newDto);
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error creating ${this.tableName}`, {
          createDto,
          error: error.message,
        });
        throw new Error(`Error creating ${this.tableName}: ${error.message}`);
      }
      logger.error(`${this.logFileName} Unknown error occurred while creating ${this.tableName}`);
      throw new Error(`Unknown error occurred while creating ${this.tableName}`);
    }
  };

  /**
   * Updates an existing entity.
   * @param id - entity's unique identifier
   * @param updateDto - Data to update the entity with
   * @returns Updated entity data
   */
  update = async (id: string, updateDto: UpdateUserDto): Promise<UserDto | null> => {
    try {
      logger.info(`${this.logFileName} Updating ${this.tableName} with id: ${id}`);
      const data = await this.getById(id);

      if (!data) {
        logger.error(`${this.logFileName} ${this.tableName} with id ${id} does not exist!`);
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.tableName} does not exist!`, {
          resource: this.tableName,
        });
      }

      // If (updateDto.password) {
      //   UpdateDto.password = await hash(updateDto.password, env.HASH!);
      // }

      // UpdateDto.updatedAt = new Date();

      return await this.userRepository.update(id, updateDto);
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error updating ${this.tableName}`, {
          id,
          updateDto,
          error: error.message,
        });
        throw new Error(`Error updating ${this.tableName}: ${error.message}`);
      }
      logger.error(`${this.logFileName} Unknown error occurred while updating ${this.tableName}`);
      throw new Error(`Unknown error occurred while updating ${this.tableName}`);
    }
  };

  /**
   * Deletes a entity.
   * @param id - entity's unique identifier
   * @returns Deletion result
   */
  delete = async (id: string): Promise<UserDto | null> => {
    try {
      logger.info(`${this.logFileName} Deleting ${this.tableName} with id: ${id}`);
      const data = await this.getById(id);

      if (!data) {
        logger.error(`${this.logFileName} ${this.tableName} with id ${id} does not exist!`);
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.tableName} does not exist!`, {
          resource: this.tableName,
        });
      }

      return await this.userRepository.delete(id);
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error deleting ${this.tableName}`, {
          id,
          error: error.message,
        });
        throw new Error(`Error deleting ${this.tableName}: ${error.message}`);
      }
      logger.error(`${this.logFileName} Unknown error occurred while deleting ${this.tableName}`);
      throw new Error(`Unknown error occurred while deleting ${this.tableName}`);
    }
  };

  /**
   * Deletes multiple entities by their ids.
   * @param ids - List of entity ids to delete
   * @returns Deletion result
   */
  deleteAll = async (ids: string[]): Promise<{ deletedCount: number }> => {
    if (!Array.isArray(ids) || ids.length === 0) {
      logger.error(`${this.logFileName} Invalid array of IDs for bulk delete`);
      throw new Error("Invalid array of IDs");
    }

    const result = await this.userRepository.deleteAll(ids);

    if (result.deletedCount === 0) {
      logger.error(`${this.logFileName} No ${this.tableName} found to delete`, { ids });
      throw new Error(`No ${this.tableName} found to delete`);
    }

    return result;
  };

  /**
   * Import entities.
   * @param importDto - Data for creating entities
   * @param accountId - account id for creating entities
   * @returns number of imported entities
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  import = async (importDto: CreateUserDto[], accountId: string): Promise<any> => {
    try {
      logger.info(`${this.logFileName} Starting import ${this.tableName}`);

      // Const imported = await this.userRepository.import(importDto, accountId);
      const imported = { createdCount: 0, skippedCount: 0, accountId };

      logger.info(
        `${this.logFileName} ${imported.createdCount} completed, ${imported.skippedCount} skipped for ${this.tableName}`,
      );

      return {
        message: `${imported.createdCount} completed, ${imported.skippedCount} skipped`,
        ...imported,
      };
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error creating ${this.tableName}`, {
          importDto,
          error: error.message,
        });
        throw new Error(`Error creating ${this.tableName}: ${error.message}`);
      }
      logger.error(`${this.logFileName} Unknown error occurred while creating ${this.tableName}`);
      throw new Error(`Unknown error occurred while creating ${this.tableName}`);
    }
  };

  /**
   * Export entities from the database.
   * @returns csv of entities
   */
  export = async (): Promise<string> => {
    try {
      logger.info(`${this.logFileName} Fetching all ${this.tableName}`);
      const data = await this.userRepository.getAll();

      if (data.length === 0) {
        throw createHttpError(StatusCodes.NOT_FOUND, `No ${this.tableName} found to export`);
      }

      const csv = await parseAsync(data);

      return csv;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching all ${this.tableName}`, {
          error: error.message,
        });
        throw new Error(`Error fetching ${this.tableName}: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while fetching all ${this.tableName}`,
      );
      throw new Error(`Unknown error occurred while fetching ${this.tableName}`);
    }
  };
}
