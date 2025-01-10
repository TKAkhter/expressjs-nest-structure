import { Model, Document, SortOrder, UpdateQuery } from "mongoose";
import { logger } from "@/common/winston/winston";
import { mongoDbApplyFilter } from "@/utils/mongodb-apply-filter";
import { FindByQueryDto } from "@/schemas/find-by-query";

export class GenericRepository<
  TModel extends Document,
  TCreateDto,
  TUpdateDto extends UpdateQuery<TModel>,
> {
  private readonly model: Model<TModel>;
  private logFileName: string;

  constructor(model: Model<TModel>, logFileName: string) {
    this.model = model;
    this.logFileName = logFileName;
  }

  /**
   * Fetches all entites from the database.
   * @returns Array of entites
   */
  async getAll(): Promise<TModel[]> {
    try {
      logger.info(
        `${this.logFileName} Fetching all ${this.model.collection.name} from the database.`,
      );
      return await this.model.find({}, { _id: 0, password: 0 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching all ${this.model.collection.name}`, {
        error: error.message,
      });
      throw new Error(error);
    }
  }

  /**
   * Fetches entities from the database based on the provided query object.
   * @param query - The query object containing the main table, filters, joins, and selected columns.
   * @returns Array of entities
   */
  getByQuery = async (query: {
    filter?: Record<string, unknown>;
    select: string[];
  }): Promise<TModel[]> => {
    try {
      logger.info(
        `${this.logFileName} Fetching data using dynamic query from ${this.model.collection.name}`,
      );

      const filter = query.filter || {};
      const projection = query.select.reduce((acc: Record<string, number>, field) => {
        acc[field] = 1;
        return acc;
      }, {});

      return await this.model.find(filter, projection);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(
        `${this.logFileName} Error fetching data with dynamic query from ${this.model.collection.name}`,
        {
          error: error.message,
        },
      );
      throw new Error(error.message);
    }
  };

  /**
   * Fetches an entity by their id.
   * @param id - entity's unique identifier
   * @returns entity data or null if not found
   */
  getById = async (id: string): Promise<TModel | null> => {
    try {
      logger.info(`${this.logFileName} Fetching ${this.model.collection.name} with id: ${id}`);
      return await this.model.findById(id).exec();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching ${this.model.collection.name} by id`, {
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
  async getByUuid(uuid: string): Promise<TModel | null> {
    try {
      logger.info(
        `${this.logFileName} Fetching with uuid: ${uuid} from ${this.model.collection.name}`,
      );
      return await this.model.findOne({ uuid }, { _id: 0, password: 0 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(
        `${this.logFileName} Error fetching by uuid from ${this.model.collection.name}`,
        {
          uuid,
          error: error.message,
        },
      );
      throw new Error(error);
    }
  }

  /**
   * Fetches an entity by their email.
   * @param email - entity's email
   * @returns entity data or null if not found
   */
  getByEmail = async (email: string): Promise<TModel | null> => {
    try {
      logger.info(
        `${this.logFileName} Fetching ${this.model.collection.name} with email: ${email}`,
      );
      return await this.model.findOne({ email }).exec();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching ${this.model.collection.name} by email`, {
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
  async getByUsername(username: string): Promise<TModel | null> {
    try {
      logger.info(`${this.logFileName} Fetching user with username: ${username}`);
      return await this.model.findOne({ username });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching by username`, {
        username,
        error: error.message,
      });
      throw new Error(error);
    }
  }

  /**
   * Fetches an entity by a specific column and value.
   * @param column - The column to filter by (e.g., 'email', 'id', etc.).
   * @param value - The value to search for in the specified column.
   * @returns Entity data or null if not found.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getByColumn = async (column: string, value: any): Promise<TModel | null> => {
    try {
      logger.info(
        `${this.logFileName} Fetching ${this.model.collection.name} with ${column}: ${value}`,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await this.model.findOne({ [column]: value } as any).exec();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(
        `${this.logFileName} Error fetching ${this.model.collection.name} by ${column}`,
        {
          column,
          value,
          error: error.message,
        },
      );
      throw new Error(error.message);
    }
  };

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
        this.model
          .find(mongoFilter)
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
      };
    } catch (error) {
      logger.error(`${this.logFileName} Error querying ${this.model.collection.name}`, {
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
  create = async (createDto: TCreateDto): Promise<TModel> => {
    try {
      logger.info(`${this.logFileName} Creating entry in ${this.model.collection.name}`);
      const created = await this.model.create(createDto);
      return created;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error creating entry in ${this.model.collection.name}`, {
        createDto,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Creates many entities.
   * @param createDto - Data for creating many entities
   * @returns Created entity data
   */
  createMany = async (
    createDto: TCreateDto[],
  ): Promise<{ created: TModel[]; skippedCount: number }> => {
    try {
      logger.info(`${this.logFileName} Creating many entries in ${this.model.collection.name}`);

      // Check for existing records and remove them from createDto
      const newEntries = await this.removeExistingRecords(createDto);

      if (newEntries.length === 0) {
        return { created: [], skippedCount: createDto.length };
      }

      const created = await this.model.insertMany(newEntries);
      return { created, skippedCount: createDto.length - created.length };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(
        `${this.logFileName} Error creating many entries in ${this.model.collection.name}`,
        {
          createDto,
          error: error.message,
        },
      );
      throw new Error(error);
    }
  };

  /**
   * Updates an existing entity.
   * @param uuid - entity's unique identifier
   * @param updateData - Data to update the entity with
   * @returns Updated wntity data
   */
  async update(uuid: string, updateData: TUpdateDto): Promise<TModel | null> {
    try {
      logger.info(`${this.logFileName} Updating ${this.model.collection.name} with uuid: ${uuid}`);
      return await this.model.findOneAndUpdate({ uuid }, updateData, { new: true });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error updating`, {
        uuid,
        updateData,
        error: error.message,
      });
      throw new Error(error);
    }
  }

  /**
   * Deletes an entity.
   * @param id - entity's unique identifier
   * @returns Deletion result
   */
  delete = async (id: string): Promise<TModel | null> => {
    try {
      logger.info(`${this.logFileName} Deleting from ${this.model.collection.name} with id: ${id}`);
      const deleted = await this.model.findByIdAndDelete(id);
      return deleted;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error deleting from ${this.model.collection.name}`, {
        id,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  /**
   * Deletes multiple entities by their ids.
   * @param ids - List of entity ids to delete
   * @returns Deletion result
   */
  deleteAll = async (ids: string[]): Promise<{ deletedCount: number }> => {
    try {
      const deletedCount = await this.model.deleteMany({ _id: { $in: ids } });
      return { deletedCount: deletedCount.deletedCount };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error deleting multiple ${this.model.collection.name}`, {
        ids,
        error: error.message,
      });
      throw new Error(error);
    }
  };

  // Helper method to remove existing records before creating new ones
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeExistingRecords = async (createDto: any[]): Promise<any[]> => {
    // Example for contacts and domains logic
    const existingEntities = await this.model.find({
      email: { $in: createDto.map((entry) => entry.email) },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingEmails = existingEntities.map((entry: any) => entry.email);
    return createDto.filter((entry) => !existingEmails.includes(entry.email));
  };
}
