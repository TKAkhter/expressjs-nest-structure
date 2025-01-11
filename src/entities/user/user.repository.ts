import { UserModel, UserDto, CreateUserDto, UpdateUserDto } from "@/entities/user/user.dto";
import { FindByQueryDto } from "@/schemas/find-by-query";
import { logger } from "@/common/winston/winston";
import { mongoDbApplyFilter } from "@/utils/mongodb-apply-filter";
import { SortOrder } from "mongoose";

export class UserRepository {
  private collectionName: string;
  private logFileName: string;
  private dbModel: typeof UserModel;

  constructor(collectionName: string, logFileName: string) {
    this.collectionName = collectionName;
    this.logFileName = logFileName;
    this.dbModel = UserModel;
  }

  /**
   * Fetches all entites from the database.
   * @returns Array of entites
   */
  async getAll(): Promise<UserDto[]> {
    try {
      logger.info(`${this.logFileName} Fetching all ${this.collectionName} from the database.`);
      return await this.dbModel.find({}, { _id: 0, password: 0 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching all ${this.collectionName}`, {
        error: error.message,
      });
      throw new Error(error);
    }
  }

  /**
   * Fetches a entity by their id.
   * @param id - entity's unique identifier
   * @returns entity data or null if not found
   */
  async getById(id: string): Promise<UserDto | null> {
    try {
      logger.info(`${this.logFileName} Fetching ${this.collectionName} with uuid: ${id}`);
      return await this.dbModel.findOne({ id }, { _id: 0, password: 0 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching ${this.collectionName} by uuid`, {
        id,
        error: error.message,
      });
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
      logger.info(`${this.logFileName} Fetching ${this.collectionName} with uuid: ${uuid}`);
      return await this.dbModel.findOne({ uuid }, { _id: 0, password: 0 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching ${this.collectionName} by uuid`, {
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
      logger.info(`${this.logFileName} Fetching ${this.collectionName} with email: ${email}`);
      return await this.dbModel.findOne({ email });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching ${this.collectionName} by email`, {
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
      logger.info(`${this.logFileName} Fetching user with username: ${username}`);
      return await this.dbModel.findOne({ username });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching ${this.collectionName} by username`, {
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
        this.dbModel
          .find(mongoFilter)
          .sort(sortOptions)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .exec(),
        this.dbModel.countDocuments(mongoFilter),
      ]);

      return {
        data,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      };
    } catch (error) {
      logger.error(`${this.logFileName} Error querying ${this.collectionName}`, {
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
      logger.info(
        `${this.logFileName} Creating ${this.collectionName} with email: ${createDto.email}`,
      );
      const newUser = new this.dbModel(createDto);
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
      logger.error(`${this.logFileName} Error creating ${this.collectionName}`, {
        createDto,
        error: error.message,
      });
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
      logger.info(`${this.logFileName} Updating ${this.collectionName} with uuid: ${uuid}`);
      return await this.dbModel.findOneAndUpdate({ uuid }, updateData, { new: true });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error updating ${this.collectionName}`, {
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
      logger.info(`${this.logFileName} Deleting ${this.collectionName} with uuid: ${uuid}`);
      return await this.dbModel.findOneAndDelete({ uuid });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error deleting ${this.collectionName}`, {
        uuid,
        error: error.message,
      });
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
      return await this.dbModel.deleteMany({ uuid: { $in: ids } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error deleting multiple ${this.collectionName}`, {
        ids,
        error: error.message,
      });
      throw new Error(error);
    }
  }
}
