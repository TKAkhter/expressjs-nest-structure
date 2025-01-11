import { UserDto, UpdateUserDto, CreateUserDto } from "@/entities/user/user.dto";
import { env } from "@/config/env";
import { hash } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { FindByQueryDto } from "@/schemas/find-by-query";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/common/winston/winston";
import { UserRepository } from "@/entities/user/user.repository";
import { parseAsync } from "json2csv";

export class UserService {
  private userRepository: UserRepository;
  private collectionName: string;
  private logFileName: string;

  constructor(collectionName: string, logFileName: string) {
    this.userRepository = new UserRepository(collectionName, `[${collectionName} Repository]`);
    this.collectionName = collectionName;
    this.logFileName = logFileName;
  }

  /**
   * Fetches all entities from the database.
   * @returns Array of entities
   */
  getAll = async (): Promise<UserDto[]> => {
    try {
      logger.info(`${this.logFileName} Fetching all ${this.collectionName}`);
      const data = await this.userRepository.getAll();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching all ${this.collectionName}`, {
          error: error.message,
        });
        throw new Error(`Error fetching ${this.collectionName}: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while fetching all ${this.collectionName}`,
      );
      throw new Error(`Unknown error occurred while fetching ${this.collectionName}`);
    }
  };

  /**
   * Fetches a entity by their id.
   * @param id - entity's unique identifier
   * @returns entity data
   */
  getById = async (id: string): Promise<UserDto> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.collectionName} with id: ${id}`);
      const data = await this.userRepository.getById(id);

      if (!data) {
        logger.error(`${this.logFileName} ${this.collectionName} with id ${id} not found`);
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.collectionName} not found`, {
          resource: this.collectionName,
        });
      }

      return data;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching ${this.collectionName} by id`, {
          id,
          error: error.message,
        });
        throw new Error(`Error fetching ${this.collectionName} by id: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while fetching ${this.collectionName} by id`,
      );
      throw new Error(`Unknown error occurred while fetching ${this.collectionName} by id`);
    }
  };

  /**
   * Fetches a entity by their UUID.
   * @param uuid - entity's unique identifier
   * @returns entity data
   */
  getByUuid = async (uuid: string): Promise<UserDto> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.collectionName} with uuid: ${uuid}`);
      const data = await this.userRepository.getByUuid(uuid);

      if (!data) {
        logger.error(`${this.logFileName} ${this.collectionName} with uuid ${uuid} not found`);
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.collectionName} not found`, {
          resource: this.collectionName,
        });
      }

      return data;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching ${this.collectionName} by uuid`, {
          uuid,
          error: error.message,
        });
        throw new Error(`Error fetching ${this.collectionName} by uuid: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while fetching ${this.collectionName} by uuid`,
      );
      throw new Error(`Unknown error occurred while fetching ${this.collectionName} by uuid`);
    }
  };

  /**
   * Fetches a entity by their email.
   * @param email - entity's email
   * @returns entity data or false if not found
   */
  getByEmail = async (email: string): Promise<UserDto | false> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.collectionName} with email: ${email}`);
      const data = await this.userRepository.getByEmail(email);

      if (!data) {
        logger.error(`${this.logFileName} ${this.collectionName} with email ${email} not found`);
        return false;
      }

      return data;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching ${this.collectionName} by email`, {
          email,
          error: error.message,
        });
        throw new Error(`Error fetching ${this.collectionName} by email: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while fetching ${this.collectionName} by email`,
      );
      throw new Error(`Unknown error occurred while fetching ${this.collectionName} by email`);
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
        `${this.logFileName} Querying ${this.collectionName} with options: ${JSON.stringify(options)}`,
      );
      return await this.userRepository.findByQuery(options);
    } catch (error) {
      logger.error(`${this.logFileName} Error querying ${this.collectionName}`, {
        options,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new Error(`Error querying ${this.collectionName}`);
    }
  };

  /**
   * Creates a new entity.
   * @param createDto - Data for creating a new entity
   * @returns Created entity data
   */
  create = async (createDto: CreateUserDto): Promise<UserDto> => {
    try {
      logger.info(
        `${this.logFileName} Creating ${this.collectionName} with email: ${createDto.email}`,
      );
      const data = await this.userRepository.getByEmail(createDto.email);
      const username = await this.userRepository.getByUsername(createDto.username);

      if (data) {
        logger.error(
          `${this.logFileName} ${this.collectionName} with email ${createDto.email} already exists`,
        );
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.collectionName} already exists!`, {
          resource: this.collectionName,
        });
      }

      if (username) {
        logger.error(
          `${this.logFileName} ${this.collectionName} with username ${createDto.username} already exists.`,
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
        logger.error(`${this.logFileName} Error creating ${this.collectionName}`, {
          createDto,
          error: error.message,
        });
        throw new Error(`Error creating ${this.collectionName}: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while creating ${this.collectionName}`,
      );
      throw new Error(`Unknown error occurred while creating ${this.collectionName}`);
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
      logger.info(`${this.logFileName} Updating ${this.collectionName} with id: ${id}`);
      const data = await this.getById(id);

      if (!data) {
        logger.error(`${this.logFileName} ${this.collectionName} with id ${id} does not exist!`);
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.collectionName} does not exist!`, {
          resource: this.collectionName,
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
        logger.error(`${this.logFileName} Error updating ${this.collectionName}`, {
          id,
          updateDto,
          error: error.message,
        });
        throw new Error(`Error updating ${this.collectionName}: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while updating ${this.collectionName}`,
      );
      throw new Error(`Unknown error occurred while updating ${this.collectionName}`);
    }
  };

  /**
   * Deletes a entity.
   * @param id - entity's unique identifier
   * @returns Deletion result
   */
  delete = async (id: string): Promise<UserDto | null> => {
    try {
      logger.info(`${this.logFileName} Deleting ${this.collectionName} with id: ${id}`);
      const data = await this.getById(id);

      if (!data) {
        logger.error(`${this.logFileName} ${this.collectionName} with id ${id} does not exist!`);
        throw createHttpError(StatusCodes.BAD_REQUEST, `${this.collectionName} does not exist!`, {
          resource: this.collectionName,
        });
      }

      return await this.userRepository.delete(id);
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error deleting ${this.collectionName}`, {
          id,
          error: error.message,
        });
        throw new Error(`Error deleting ${this.collectionName}: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while deleting ${this.collectionName}`,
      );
      throw new Error(`Unknown error occurred while deleting ${this.collectionName}`);
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
      logger.error(`${this.logFileName} No ${this.collectionName} found to delete`, { ids });
      throw new Error(`No ${this.collectionName} found to delete`);
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
      logger.info(`${this.logFileName} Starting import ${this.collectionName}`);

      // Const imported = await this.userRepository.import(importDto, accountId);
      const imported = { createdCount: 0, skippedCount: 0, accountId };

      logger.info(
        `${this.logFileName} ${imported.createdCount} completed, ${imported.skippedCount} skipped for ${this.collectionName}`,
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
        logger.error(`${this.logFileName} Error creating ${this.collectionName}`, {
          importDto,
          error: error.message,
        });
        throw new Error(`Error creating ${this.collectionName}: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while creating ${this.collectionName}`,
      );
      throw new Error(`Unknown error occurred while creating ${this.collectionName}`);
    }
  };

  /**
   * Export entities from the database.
   * @returns csv of entities
   */
  export = async (): Promise<string> => {
    try {
      logger.info(`${this.logFileName} Fetching all ${this.collectionName}`);
      const data = await this.userRepository.getAll();

      if (data.length === 0) {
        throw createHttpError(StatusCodes.NOT_FOUND, `No ${this.collectionName} found to export`);
      }

      const csv = await parseAsync(data);

      return csv;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${this.logFileName} Error fetching all ${this.collectionName}`, {
          error: error.message,
        });
        throw new Error(`Error fetching ${this.collectionName}: ${error.message}`);
      }
      logger.error(
        `${this.logFileName} Unknown error occurred while fetching all ${this.collectionName}`,
      );
      throw new Error(`Unknown error occurred while fetching ${this.collectionName}`);
    }
  };
}
