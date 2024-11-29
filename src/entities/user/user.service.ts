import { UserDto, UpdateUserDto, CreateUserDto } from "./user.dto";
import { env } from "../../config/env";
import { hash } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { FindByQueryDto } from "../../schemas/find-by-query";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "../../common/winston/winston";
import { UserRepository } from "./user.repository";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Fetches all users from the database.
   * @returns Array of users
   */
  async getAllUsers(): Promise<UserDto[]> {
    try {
      logger.info("[User Service] Fetching all users");
      const users = await this.userRepository.getAllUsers();
      return users;
    } catch (error) {
      if (error instanceof Error) {
        logger.error("[User Service] Error fetching all users", { error: error.message });
        throw new Error(`Error fetching users: ${error.message}`);
      }
      logger.error("[User Service] Unknown error occurred while fetching all users");
      throw new Error("Unknown error occurred while fetching users.");
    }
  }

  /**
   * Fetches a user by their UUID.
   * @param uuid - User's unique identifier
   * @returns User data
   */
  async getUserByUuid(uuid: string): Promise<UserDto> {
    try {
      logger.info(`[User Service] Fetching user with UUID: ${uuid}`);
      const user = await this.userRepository.getUserByUuid(uuid);

      if (!user) {
        logger.error(`[User Service] User with UUID ${uuid} not found.`);
        throw createHttpError(StatusCodes.BAD_REQUEST, "User not found.", {
          resource: "User",
        });
      }

      return user;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }
      if (error instanceof Error) {
        logger.error("[User Service] Error fetching user by UUID", { uuid, error: error.message });
        throw new Error(`Error fetching user by UUID: ${error.message}`);
      }
      logger.error("[User Service] Unknown error occurred while fetching user by UUID");
      throw new Error("Unknown error occurred while fetching user by UUID.");
    }
  }

  /**
   * Fetches a user by their username.
   * @param username - User's username
   * @returns User data or false if not found
   */
  async getUserByUsername(username: string): Promise<UserDto | false> {
    try {
      logger.info(`[User Service] Fetching user with username: ${username}`);
      const user = await this.userRepository.getUserByUsername(username);

      if (!user) {
        logger.error(`[User Service] User with username ${username} not found.`);
        return false;
      }

      return user;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }
      if (error instanceof Error) {
        logger.error("[User Service] Error fetching user by username", {
          username,
          error: error.message,
        });
        throw new Error(`Error fetching user by username: ${error.message}`);
      }
      logger.error("[User Service] Unknown error occurred while fetching user by username");
      throw new Error("Unknown error occurred while fetching user by username.");
    }
  }

  /**
   * Finds users based on query parameters.
   * @param options - Query parameters like pagination, sorting, and filtering
   * @returns Paginated user data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findByQuery(options: FindByQueryDto): Promise<any> {
    try {
      logger.info(`[User Service] Querying users with options: ${JSON.stringify(options)}`);
      return await this.userRepository.findByQuery(options);
    } catch (error) {
      logger.error("[User Service] Error querying users", {
        options,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new Error("Error querying users.");
    }
  }

  /**
   * Creates a new user.
   * @param userData - Data for creating a new user
   * @returns Created user data
   */
  async createUser(userData: CreateUserDto): Promise<UserDto> {
    try {
      logger.info(`[User Service] Creating user with username: ${userData.username}`);
      const user = await this.userRepository.getUserByUsername(userData.username);

      if (user) {
        logger.error(`[User Service] User with username ${userData.username} already exists.`);
        throw createHttpError(StatusCodes.BAD_REQUEST, "User already exists!", {
          resource: "User",
        });
      }

      const hashedPassword = await hash(userData.password, env.HASH!);
      const currentTime = new Date();
      const newUser = {
        ...userData,
        uuid: uuidv4(),
        password: hashedPassword,
        createdAt: currentTime,
        updatedAt: currentTime,
      };

      return await this.userRepository.createUser(newUser);
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error("[User Service] Error creating user", { userData, error: error.message });
        throw new Error(`Error creating user: ${error.message}`);
      }
      logger.error("[User Service] Unknown error occurred while creating user");
      throw new Error("Unknown error occurred while creating user.");
    }
  }

  /**
   * Updates an existing user.
   * @param uuid - User's unique identifier
   * @param updateData - Data to update the user with
   * @returns Updated user data
   */
  async updateUser(uuid: string, updateData: UpdateUserDto): Promise<UserDto | null> {
    try {
      logger.info(`[User Service] Updating user with UUID: ${uuid}`);
      const user = await this.getUserByUuid(uuid);

      if (!user) {
        logger.error(`[User Service] User with UUID ${uuid} does not exist.`);
        throw createHttpError(StatusCodes.BAD_REQUEST, "User does not exist!", {
          resource: "User",
        });
      }

      if (updateData.password) {
        updateData.password = await hash(updateData.password, env.HASH!);
      }

      updateData.updatedAt = new Date();

      return await this.userRepository.updateUser(uuid, updateData);
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error("[User Service] Error updating user", {
          uuid,
          updateData,
          error: error.message,
        });
        throw new Error(`Error updating user: ${error.message}`);
      }
      logger.error("[User Service] Unknown error occurred while updating user");
      throw new Error("Unknown error occurred while updating user.");
    }
  }

  /**
   * Deletes a user.
   * @param uuid - User's unique identifier
   * @returns Deletion result
   */
  async deleteUser(uuid: string): Promise<UserDto | null> {
    try {
      logger.info(`[User Service] Deleting user with UUID: ${uuid}`);
      const user = await this.getUserByUuid(uuid);

      if (!user) {
        logger.error(`[User Service] User with UUID ${uuid} does not exist.`);
        throw createHttpError(StatusCodes.BAD_REQUEST, "User does not exist!", {
          resource: "User",
        });
      }

      return await this.userRepository.deleteUser(uuid);
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error("[User Service] Error deleting user", { uuid, error: error.message });
        throw new Error(`Error deleting user: ${error.message}`);
      }
      logger.error("[User Service] Unknown error occurred while deleting user");
      throw new Error("Unknown error occurred while deleting user.");
    }
  }

  /**
   * Deletes multiple users by their UUIDs.
   * @param ids - List of user UUIDs to delete
   * @returns Deletion result
   */
  async deleteAllUsers(ids: string[]): Promise<{ deletedCount: number }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      logger.error("[User Service] Invalid array of IDs for bulk delete.");
      throw new Error("Invalid array of IDs.");
    }

    const result = await this.userRepository.deleteAllUsers(ids);

    if (result.deletedCount === 0) {
      logger.error("[User Service] No users found to delete.", { ids });
      throw new Error("No users found to delete.");
    }

    return result;
  }
}
