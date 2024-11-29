import { UserModel, UserDto, CreateUserDto, UpdateUserDto } from "./user.dto";
import { FindByQueryDto } from "../../schemas/find-by-query";
import { logger } from "../../common/winston/winston";

export class UserRepository {
  /**
   * Fetches all users from the database.
   * @returns Array of users
   */
  async getAllUsers(): Promise<UserDto[]> {
    try {
      logger.info("[User Repository] Fetching all users from the database.");
      return await UserModel.find();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error("[User Repository] Error fetching all users", { error: error.message });
      throw new Error(error);
    }
  }

  /**
   * Fetches a user by their UUID.
   * @param uuid - User's unique identifier
   * @returns User data or null if not found
   */
  async getUserByUuid(uuid: string): Promise<UserDto | null> {
    try {
      logger.info(`[User Repository] Fetching user with UUID: ${uuid}`);
      return await UserModel.findOne({ uuid });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error("[User Repository] Error fetching user by UUID", { uuid, error: error.message });
      throw new Error(error);
    }
  }

  /**
   * Fetches a user by their username.
   * @param username - User's username
   * @returns User data or null if not found
   */
  async getUserByUsername(username: string): Promise<UserDto | null> {
    try {
      logger.info(`[User Repository] Fetching user with username: ${username}`);
      return await UserModel.findOne({ username });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error("[User Repository] Error fetching user by username", {
        username,
        error: error.message,
      });
      throw new Error(error);
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
      logger.info(`[User Repository] Querying users with options: ${JSON.stringify(options)}`);
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
      logger.error("[User Repository] Error querying users", {
        options,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(error as any);
    }
  }

  /**
   * Creates a new user.
   * @param userData - Data for creating a new user
   * @returns Created user data
   */
  async createUser(userData: CreateUserDto): Promise<UserDto> {
    try {
      logger.info(`[User Repository] Creating user with username: ${userData.username}`);
      const newUser = new UserModel(userData);
      return await newUser.save();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error("[User Repository] Error creating user", { userData, error: error.message });
      throw new Error(error);
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
      logger.info(`[User Repository] Updating user with UUID: ${uuid}`);
      return await UserModel.findOneAndUpdate({ uuid }, updateData, { new: true });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error("[User Repository] Error updating user", {
        uuid,
        updateData,
        error: error.message,
      });
      throw new Error(error);
    }
  }

  /**
   * Deletes a user.
   * @param uuid - User's unique identifier
   * @returns Deletion result
   */
  async deleteUser(uuid: string): Promise<UserDto | null> {
    try {
      logger.info(`[User Repository] Deleting user with UUID: ${uuid}`);
      return await UserModel.findOneAndDelete({ uuid });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error("[User Repository] Error deleting user", { uuid, error: error.message });
      throw new Error(error);
    }
  }

  /**
   * Deletes multiple users by their UUIDs.
   * @param ids - List of user UUIDs to delete
   * @returns Deletion result
   */
  async deleteAllUsers(ids: string[]): Promise<{ deletedCount: number }> {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error("Invalid array of IDs.");
      }
      return await UserModel.deleteMany({ uuid: { $in: ids } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error("[User Repository] Error deleting multiple users", {
        ids,
        error: error.message,
      });
      throw new Error(error);
    }
  }
}
