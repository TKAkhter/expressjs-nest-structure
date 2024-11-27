import { UserModel, UpdateUserDto, CreateUserDto } from "./user.dto";
import { env } from "../../config/env";
import { hash } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { FindByQueryDto } from "../../schemas/find-by-query";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "../../common/winston/winston";

export class UserService {
  /**
   * Fetches all users from the database.
   * @returns Array of users
   */
  async getAllUsers() {
    try {
      logger.info("Fetching all users");
      const users = await UserModel.find();
      return users;
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error fetching all users", { error: error.message });
        throw new Error(`Error fetching users: ${error.message}`);
      }
      logger.error("Unknown error occurred while fetching all users");
      throw new Error("Unknown error occurred while fetching users.");
    }
  }

  /**
   * Fetches a user by their UUID.
   * @param uuid - User's unique identifier
   * @returns User data
   */
  async getUserByUuid(uuid: string) {
    try {
      logger.info(`Fetching user with UUID: ${uuid}`);
      const user = await UserModel.findOne({ uuid });

      if (!user) {
        logger.error(`User with UUID ${uuid} not found.`);
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
        logger.error("Error fetching user by UUID", { uuid, error: error.message });
        throw new Error(`Error fetching user by UUID: ${error.message}`);
      }
      logger.error("Unknown error occurred while fetching user by UUID");
      throw new Error("Unknown error occurred while fetching user by UUID.");
    }
  }

  /**
   * Fetches a user by their username.
   * @param username - User's username
   * @returns User data or false if not found
   */
  async getUserByUsername(username: string) {
    try {
      logger.info(`Fetching user with username: ${username}`);
      const user = await UserModel.findOne({ username });

      if (!user) {
        logger.error(`User with username ${username} not found.`);
        return false;
      }

      return user;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }
      if (error instanceof Error) {
        logger.error("Error fetching user by username", { username, error: error.message });
        throw new Error(`Error fetching user by username: ${error.message}`);
      }
      logger.error("Unknown error occurred while fetching user by username");
      throw new Error("Unknown error occurred while fetching user by username.");
    }
  }

  /**
   * Finds users based on query parameters.
   * @param options - Query parameters like pagination, sorting, and filtering
   * @returns Paginated user data
   */
  async findByQuery(options: FindByQueryDto) {
    const { page, rowsPerPage, sort, filter } = options;

    try {
      logger.info(`Querying users with options: ${JSON.stringify(options)}`);
      const [sortField, sortOrder] = sort.split(":");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortOptions: any = { [sortField]: sortOrder };

      const skip = (page - 1) * rowsPerPage;
      const limit = rowsPerPage;

      const [users, total] = await Promise.all([
        UserModel.find(filter).sort(sortOptions).skip(skip).limit(limit),
        UserModel.countDocuments(filter),
      ]);

      return {
        data: users,
        total,
        page,
        rowsPerPage,
      };
    } catch (error) {
      logger.error("Error querying users", {
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
  async createUser(userData: CreateUserDto) {
    try {
      logger.info(`Creating user with username: ${userData.username}`);
      const user = await this.getUserByUsername(userData.username);

      if (user) {
        logger.error(`User with username ${userData.username} already exists.`);
        throw createHttpError(StatusCodes.BAD_REQUEST, "User already exists!", {
          resource: "User",
        });
      }

      const hashedPassword = await hash(userData.password, env.HASH!);
      const currentTime = new Date();
      const newUser = new UserModel({
        ...userData,
        uuid: uuidv4(),
        password: hashedPassword,
        createdAt: currentTime,
        updatedAt: currentTime,
      });

      return await newUser.save();
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error("Error creating user", { userData, error: error.message });
        throw new Error(`Error creating user: ${error.message}`);
      }
      logger.error("Unknown error occurred while creating user");
      throw new Error("Unknown error occurred while creating user.");
    }
  }

  /**
   * Updates an existing user.
   * @param uuid - User's unique identifier
   * @param updateData - Data to update the user with
   * @returns Updated user data
   */
  async updateUser(uuid: string, updateData: UpdateUserDto) {
    try {
      logger.info(`Updating user with UUID: ${uuid}`);
      const user = await this.getUserByUuid(uuid);

      if (!user) {
        logger.error(`User with UUID ${uuid} does not exist.`);
        throw createHttpError(StatusCodes.BAD_REQUEST, "User does not exist!", {
          resource: "User",
        });
      }

      if (updateData.password) {
        updateData.password = await hash(updateData.password, env.HASH!);
      }

      updateData.updatedAt = new Date();

      return await UserModel.findByIdAndUpdate(user.id, updateData, { new: true });
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error("Error updating user", { uuid, updateData, error: error.message });
        throw new Error(`Error updating user: ${error.message}`);
      }
      logger.error("Unknown error occurred while updating user");
      throw new Error("Unknown error occurred while updating user.");
    }
  }

  /**
   * Deletes a user.
   * @param uuid - User's unique identifier
   * @returns Deletion result
   */
  async deleteUser(uuid: string) {
    try {
      logger.info(`Deleting user with UUID: ${uuid}`);
      const user = await this.getUserByUuid(uuid);

      if (!user) {
        logger.error(`User with UUID ${uuid} does not exist.`);
        throw createHttpError(StatusCodes.BAD_REQUEST, "User does not exist!", {
          resource: "User",
        });
      }

      return await UserModel.findByIdAndDelete(user.id);
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error("Error deleting user", { uuid, error: error.message });
        throw new Error(`Error deleting user: ${error.message}`);
      }
      logger.error("Unknown error occurred while deleting user");
      throw new Error("Unknown error occurred while deleting user.");
    }
  }

  /**
   * Deletes multiple users by their UUIDs.
   * @param ids - List of user UUIDs to delete
   * @returns Deletion result
   */
  async deleteAllUsers(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      logger.error("Invalid array of IDs for bulk delete.");
      throw new Error("Invalid array of IDs.");
    }

    const result = await UserModel.deleteMany({ uuid: { $in: ids } });

    if (result.deletedCount === 0) {
      logger.error("No users found to delete.", { ids });
      throw new Error("No users found to delete.");
    }

    return result;
  }
}
