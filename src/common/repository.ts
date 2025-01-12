import { Model, UpdateQuery, SortOrder } from "mongoose";
import { FindByQueryDto } from "@/schemas/find-by-query";
import { logger } from "@/common/winston/winston";
import { mongoDbApplyFilter } from "@/utils/mongodb-apply-filter";

const IGNORE_FIELDS = { password: 0 };
export class GenericRepository<T, TCreateDto, TUpdateDto> {
  private model: Model<T>;
  private logFileName: string;

  constructor(model: Model<T>, logFileName: string) {
    this.logFileName = logFileName;
    this.model = model;
  }

  /**
   * Fetches all entities from the collection.
   * @returns Array of entities
   */
  getAll = async (): Promise<T[]> => {
    try {
      logger.info(`${this.logFileName} Fetching all from ${this.model.modelName}`);
      return await this.model.find({}, IGNORE_FIELDS);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching all from ${this.model.modelName}`, {
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Fetches an entity by ID.
   * @param id - Entity's unique identifier
   * @returns Entity data or null if not found
   */
  getById = async (id: string): Promise<T | null> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.model.modelName} with id: ${id}`);
      return await this.model.findById(id, IGNORE_FIELDS);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching ${this.model.modelName} by id`, {
        id,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Fetches a entity by their id.
   * @param uuid - entity's unique identifier
   * @returns entity data or null if not found
   */
  getByUuid = async (uuid: string): Promise<T | null> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.model.modelName} with uuid: ${uuid}`);
      return await this.model.findOne({ uuid }, IGNORE_FIELDS);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching ${this.model.modelName} by uuid`, {
        uuid,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Fetches a entity by their email.
   * @param email - entity's email
   * @returns entity data or null if not found
   */
  getByEmail = async (email: string): Promise<T | null> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.model.modelName} with email: ${email}`);
      return await this.model.findOne({ email }, IGNORE_FIELDS);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching ${this.model.modelName} by email`, {
        email,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Fetches a user by their username.
   * @param username - User's username
   * @returns User data or null if not found
   */
  getByUsername = async (username: string): Promise<T | null> => {
    try {
      logger.info(
        `${this.logFileName} Fetching ${this.model.modelName} with username: ${username}`,
      );
      return await this.model.findOne({ username }, IGNORE_FIELDS);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching ${this.model.modelName} by username`, {
        username,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Finds entities with pagination.
   * @param options - Query options
   * @returns Paginated data
   */
  findByQuery = async (options: FindByQueryDto) => {
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
        this.model
          .find(mongoFilter, IGNORE_FIELDS)
          .sort(sortOptions)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .exec(),
        this.model.countDocuments(mongoFilter),
      ]);

      return {
        data,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error querying ${this.model.modelName}`, {
        options,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Creates a new entity.
   * @param createDto - Data for creating a new entity
   * @returns Created entity data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create = async (createDto: TCreateDto): Promise<any> => {
    try {
      logger.info(`${this.logFileName} Creating document in ${this.model.modelName}`);
      const created = new this.model(createDto);
      await created.save();
      return this.getById(created.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error creating entry in ${this.model.modelName}`, {
        createDto,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Updates an existing entity.
   * @param uuid - Entity's unique identifier
   * @param updateDto - Data to update the entity
   * @returns Updated entity data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update = async (uuid: string, updateDto: TUpdateDto): Promise<any> => {
    try {
      logger.info(`${this.logFileName} Updating ${this.model.modelName} with uuid: ${uuid}`);
      return await this.model.findOneAndUpdate({ uuid }, updateDto as UpdateQuery<T>, {
        new: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error updating ${this.model.modelName}`, {
        uuid,
        updateDto,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Deletes an entity by uuid.
   * @param uuid - Entity's unique identifier
   * @returns Deleted entity data
   */
  delete = async (uuid: string): Promise<T | null> => {
    try {
      logger.info(`${this.logFileName} Deleting ${this.model.modelName} with uuid: ${uuid}`);
      return await this.model.findOneAndDelete({ uuid });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error deleting ${this.model.modelName}`, {
        uuid,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Deletes multiple entities by their uuids.
   * @param uuids - List of entity uuids to delete
   * @returns Deletion result
   */
  async deleteAll(uuids: string[]): Promise<{ deletedCount: number }> {
    try {
      return await this.model.deleteMany({ uuid: { $in: uuids } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error deleting multiple ${this.model.modelName}`, {
        uuids,
        error: error.message,
      });
      throw new Error(error);
    }
  }

  /**
   * Imports multiple user objects into the database.
   * @param users - Array of user objects to be saved
   * @returns Array of successfully created users
   */
  import = async (
    users: TCreateDto[],
  ): Promise<{
    createdUsers: T[];
    createdCount: number;
    skippedCount: number;
  }> => {
    try {
      logger.info(
        `${this.logFileName} Importing ${users.length} documents into ${this.model.modelName}`,
      );

      const createdUsers = (await this.model.insertMany(users, {
        ordered: true,
      })) as unknown as T[];
      const createdCount = createdUsers.length;
      const skippedCount = users.length - createdCount;

      logger.info(`${this.logFileName} Import Summary:`, {
        createdCount,
        skippedCount,
        createdUsers,
      });

      return {
        createdUsers,
        createdCount,
        skippedCount,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error importing users into ${this.model.modelName}`, {
        usersCount: users.length,
        error: error.message,
      });
      throw new Error(error);
    }
  };
}
