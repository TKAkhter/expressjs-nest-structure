import { UserDto, UpdateUserDto, CreateUserDto } from "./user.dto";
import { env } from "../../config/env";
import { hash } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { FindByQueryDto } from "../../schemas/find-by-query";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "../../common/winston/winston";
import { UserRepository } from "./user.repository";

const TAG = "User";
const LOG_FILE_NAME = `[${TAG} service]`;

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Fetches all entities from the database.
   * @returns Array of entities
   */
  async getAll(): Promise<UserDto[]> {
    try {
      logger.info(`${LOG_FILE_NAME} Fetching all ${TAG}`);
      const data = await this.userRepository.getAll();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`${LOG_FILE_NAME} Error fetching all ${TAG}`, { error: error.message });
        throw new Error(`Error fetching ${TAG}: ${error.message}`);
      }
      logger.error(`${LOG_FILE_NAME} Unknown error occurred while fetching all ${TAG}`);
      throw new Error(`Unknown error occurred while fetching ${TAG}`);
    }
  }

  /**
   * Fetches a entity by their id.
   * @param uuid - entity's unique identifier
   * @returns entity data
   */
  async getByUuid(uuid: string): Promise<UserDto> {
    try {
      logger.info(`${LOG_FILE_NAME} Fetching ${TAG} with uuid: ${uuid}`);
      const data = await this.userRepository.getByUuid(uuid);

      if (!data) {
        logger.error(`${LOG_FILE_NAME} ${TAG} with uuid ${uuid} not found`);
        throw createHttpError(StatusCodes.BAD_REQUEST, `${TAG} not found`, {
          resource: TAG,
        });
      }

      return data;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }
      if (error instanceof Error) {
        logger.error(`${LOG_FILE_NAME} Error fetching ${TAG} by uuid`, {
          uuid,
          error: error.message,
        });
        throw new Error(`Error fetching ${TAG} by uuid: ${error.message}`);
      }
      logger.error(`${LOG_FILE_NAME} Unknown error occurred while fetching ${TAG} by uuid`);
      throw new Error(`Unknown error occurred while fetching ${TAG} by uuid`);
    }
  }

  /**
   * Fetches a entity by their email.
   * @param email - entity's email
   * @returns entity data or false if not found
   */
  async getByEmail(email: string): Promise<UserDto | false> {
    try {
      logger.info(`${LOG_FILE_NAME} Fetching ${TAG} with email: ${email}`);
      const data = await this.userRepository.getByEmail(email);

      if (!data) {
        logger.error(`${LOG_FILE_NAME} ${TAG} with email ${email} not found`);
        return false;
      }

      return data;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }
      if (error instanceof Error) {
        logger.error(`${LOG_FILE_NAME} Error fetching ${TAG} by email`, {
          email,
          error: error.message,
        });
        throw new Error(`Error fetching ${TAG} by email: ${error.message}`);
      }
      logger.error(`${LOG_FILE_NAME} Unknown error occurred while fetching ${TAG} by email`);
      throw new Error(`Unknown error occurred while fetching ${TAG} by email`);
    }
  }

  /**
   * Finds entities based on query parameters.
   * @param options - Query parameters like pagination, sorting, and filtering
   * @returns Paginated entity data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findByQuery(options: FindByQueryDto): Promise<any> {
    try {
      logger.info(`${LOG_FILE_NAME} Querying ${TAG} with options: ${JSON.stringify(options)}`);
      return await this.userRepository.findByQuery(options);
    } catch (error) {
      logger.error(`${LOG_FILE_NAME} Error querying ${TAG}`, {
        options,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new Error(`Error querying ${TAG}`);
    }
  }

  /**
   * Creates a new entity.
   * @param createDto - Data for creating a new entity
   * @returns Created entity data
   */
  async create(createDto: CreateUserDto): Promise<UserDto> {
    try {
      logger.info(`${LOG_FILE_NAME} Creating ${TAG} with email: ${createDto.email}`);
      const data = await this.userRepository.getByEmail(createDto.email);
      const username = await this.userRepository.getByUsername(createDto.username);

      if (data) {
        logger.error(`${LOG_FILE_NAME} ${TAG} with email ${createDto.email} already exists`);
        throw createHttpError(StatusCodes.BAD_REQUEST, `${TAG} already exists!`, {
          resource: TAG,
        });
      }

      if (username) {
        logger.error(`${LOG_FILE_NAME} ${TAG} with username ${createDto.username} already exists.`);
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
        logger.error(`${LOG_FILE_NAME} Error creating ${TAG}`, {
          createDto,
          error: error.message,
        });
        throw new Error(`Error creating ${TAG}: ${error.message}`);
      }
      logger.error(`${LOG_FILE_NAME} Unknown error occurred while creating ${TAG}`);
      throw new Error(`Unknown error occurred while creating ${TAG}`);
    }
  }

  /**
   * Updates an existing entity.
   * @param uuid - entity's unique identifier
   * @param updateDto - Data to update the entity with
   * @returns Updated entity data
   */
  async update(uuid: string, updateDto: UpdateUserDto): Promise<UserDto | null> {
    try {
      logger.info(`${LOG_FILE_NAME} Updating ${TAG} with uuid: ${uuid}`);
      const data = await this.getByUuid(uuid);

      if (!data) {
        logger.error(`${LOG_FILE_NAME} ${TAG} with uuid ${uuid} does not exist!`);
        throw createHttpError(StatusCodes.BAD_REQUEST, `${TAG} does not exist!`, {
          resource: TAG,
        });
      }

      // If(updateDto.password) {
      //   UpdateDto.password = await hash(updateDto.password, env.HASH!);
      // }

      // UpdateDto.updatedAt = new Date();

      return await this.userRepository.update(uuid, updateDto);
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error(`${LOG_FILE_NAME} Error updating ${TAG}`, {
          uuid,
          updateDto,
          error: error.message,
        });
        throw new Error(`Error updating ${TAG}: ${error.message}`);
      }
      logger.error(`${LOG_FILE_NAME} Unknown error occurred while updating ${TAG}`);
      throw new Error(`Unknown error occurred while updating ${TAG}`);
    }
  }

  /**
   * Deletes a entity.
   * @param uuid - entity's unique identifier
   * @returns Deletion result
   */
  async delete(uuid: string): Promise<UserDto | null> {
    try {
      logger.info(`${LOG_FILE_NAME} Deleting ${TAG} with uuid: ${uuid}`);
      const data = await this.getByUuid(uuid);

      if (!data) {
        logger.error(`${LOG_FILE_NAME} ${TAG} with uuid ${uuid} does not exist!`);
        throw createHttpError(StatusCodes.BAD_REQUEST, `${TAG} does not exist!`, {
          resource: TAG,
        });
      }

      return await this.userRepository.delete(uuid);
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error(`${LOG_FILE_NAME} Error deleting ${TAG}`, { uuid, error: error.message });
        throw new Error(`Error deleting ${TAG}: ${error.message}`);
      }
      logger.error(`${LOG_FILE_NAME} Unknown error occurred while deleting ${TAG}`);
      throw new Error(`Unknown error occurred while deleting ${TAG}`);
    }
  }

  /**
   * Deletes multiple entities by their ids.
   * @param ids - List of entity ids to delete
   * @returns Deletion result
   */
  async deleteAll(ids: string[]): Promise<{ deletedCount: number }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      logger.error(`${LOG_FILE_NAME} Invalid array of IDs for bulk delete`);
      throw new Error("Invalid array of IDs");
    }

    const result = await this.userRepository.deleteAll(ids);

    if (result.deletedCount === 0) {
      logger.error(`${LOG_FILE_NAME} No ${TAG} found to delete`, { ids });
      throw new Error(`No ${TAG} found to delete`);
    }

    return result;
  }
}
