import { UserModel, UserDto, CreateUserDto, UpdateUserDto } from "./user.dto";
import { FindByQueryDto } from "../../schemas/find-by-query";
import { logger } from "../../common/winston/winston";
import { mongoDbApplyFilter } from "../../utils/mongodb-apply-filter";
import { SortOrder } from "mongoose";

const TAG = "User";
const LOG_FILE_NAME = `[${TAG} Repository]`;
const DB_MODEL = UserModel;

export class UserRepository {
  /**
   * Fetches all entites from the database.
   * @returns Array of entites
   */
  async getAll(): Promise<UserDto[]> {
    try {
      logger.info(`${LOG_FILE_NAME} Fetching all ${TAG} from the database.`);
      return await DB_MODEL.find({}, { _id: 0, password: 0 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${LOG_FILE_NAME} Error fetching all ${TAG}`, { error: error.message });
      throw new Error(error);
    }
  }

  /**
   * Fetches a entity by their id.
   * @param uuid - entity's unique identifier
   * @returns entity data or null if not found
   */
  async getByUuid(uuid: string): Promise<UserDto | null> {
    try {
      logger.info(`${LOG_FILE_NAME} Fetching ${TAG} with uuid: ${uuid}`);
      return await DB_MODEL.findOne({ uuid }, { _id: 0, password: 0 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${LOG_FILE_NAME} Error fetching ${TAG} by uuid`, {
        uuid,
        error: error.message,
      });
      throw new Error(error);
    }
  }

  /**
   * Fetches a entity by their email.
   * @param email - entity's email
   * @returns entity data or null if not found
   */
  async getByEmail(email: string): Promise<UserDto | null> {
    try {
      logger.info(`${LOG_FILE_NAME} Fetching ${TAG} with email: ${email}`);
      return await DB_MODEL.findOne({ email });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${LOG_FILE_NAME} Error fetching ${TAG} by email`, {
        email,
        error: error.message,
      });
      throw new Error(error);
    }
  }

  /**
   * Fetches a user by their username.
   * @param username - User's username
   * @returns User data or null if not found
   */
  async getByUsername(username: string): Promise<UserDto | null> {
    try {
      logger.info(`${LOG_FILE_NAME} Fetching user with username: ${username}`);
      return await DB_MODEL.findOne({ username });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${LOG_FILE_NAME} Error fetching ${TAG} by username`, {
        username,
        error: error.message,
      });
      throw new Error(error);
    }
  }

  /**
   * Finds entites based on query parameters.
   * @param options - Query parameters like pagination, sorting, and filtering
   * @returns Paginated entity data
   */
  async findByQuery(options: FindByQueryDto) {
    const { filter = {}, paginate = { page: 1, perPage: 10 }, orderBy = [] } = options;

    const { page, perPage } = paginate;

    try {
      // Build the sort object for MongoDB
      const sortOptions = orderBy.reduce(
        (acc, { sort, order }) => {
          acc[sort] = order;
          return acc;
        },
        {} as Record<string, SortOrder>,
      );

      // Convert the filter for MongoDB
      const mongoFilter = mongoDbApplyFilter(filter);

      // Query the collection
      const [data, total] = await Promise.all([
        DB_MODEL.find(mongoFilter)
          .sort(sortOptions)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .exec(),
        DB_MODEL.countDocuments(mongoFilter),
      ]);

      return {
        data,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      };
    } catch (error) {
      logger.error(`${LOG_FILE_NAME} Error querying ${TAG}`, {
        options,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(error as any);
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
      const newUser = new DB_MODEL(createDto);
      const user = await newUser.save();
      const sanitizedUser = {
        uuid: user.uuid,
        name: user.name,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return sanitizedUser as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${LOG_FILE_NAME} Error creating ${TAG}`, { createDto, error: error.message });
      throw new Error(error);
    }
  }

  /**
   * Updates an existing entity.
   * @param uuid - entity's unique identifier
   * @param updateData - Data to update the entity with
   * @returns Updated wntity data
   */
  async update(uuid: string, updateData: UpdateUserDto): Promise<UserDto | null> {
    try {
      logger.info(`${LOG_FILE_NAME} Updating ${TAG} with uuid: ${uuid}`);
      return await DB_MODEL.findOneAndUpdate({ uuid }, updateData, { new: true });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${LOG_FILE_NAME} Error updating ${TAG}`, {
        uuid,
        updateData,
        error: error.message,
      });
      throw new Error(error);
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
      return await DB_MODEL.findOneAndDelete({ uuid });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${LOG_FILE_NAME} Error deleting ${TAG}`, { uuid, error: error.message });
      throw new Error(error);
    }
  }

  /**
   * Deletes multiple entities by their ids.
   * @param ids - List of entity ids to delete
   * @returns Deletion result
   */
  async deleteAll(ids: string[]): Promise<{ deletedCount: number }> {
    try {
      return await DB_MODEL.deleteMany({ uuid: { $in: ids } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${LOG_FILE_NAME} Error deleting multiple ${TAG}`, {
        ids,
        error: error.message,
      });
      throw new Error(error);
    }
  }
}
