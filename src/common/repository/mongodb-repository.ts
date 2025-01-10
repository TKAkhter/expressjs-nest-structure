import { Model, Document, SortOrder, UpdateQuery } from "mongoose";
import { FindByQueryDto } from "@/schemas/find-by-query";
import { logger } from "@/common/winston/winston";
import { mongoDbApplyFilter } from "@/utils/mongodb-apply-filter";

export class MongodbGenericRepository<
  TModel extends Document,
  TCreateDto,
  TUpdateDto extends UpdateQuery<TModel>,
> {
  private readonly model: Model<TModel>;
  private readonly tag: string;
  private readonly logFileName: string;

  constructor(model: Model<TModel>, tag: string) {
    this.model = model;
    this.tag = tag;
    this.logFileName = `[${tag} Repository]`;
  }

  /**
   * Fetches all entites from the database.
   * @returns Array of entites
   */
  async getAll(): Promise<TModel[]> {
    try {
      logger.info(`${this.logFileName} Fetching all ${this.tag} from the database.`);
      return await this.model.find({}, { _id: 0, password: 0 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching all ${this.tag}`, { error: error.message });
      throw new Error(error);
    }
  }

  /**
   * Fetches a entity by their id.
   * @param uuid - entity's unique identifier
   * @returns entity data or null if not found
   */
  async getByUuid(uuid: string): Promise<TModel | null> {
    try {
      logger.info(`${this.logFileName} Fetching ${this.tag} with uuid: ${uuid}`);
      return await this.model.findOne({ uuid }, { _id: 0, password: 0 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching ${this.tag} by uuid`, {
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
  async getByEmail(email: string): Promise<TModel | null> {
    try {
      logger.info(`${this.logFileName} Fetching ${this.tag} with email: ${email}`);
      return await this.model.findOne({ email });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching ${this.tag} by email`, {
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
  async getByUsername(username: string): Promise<TModel | null> {
    try {
      logger.info(`${this.logFileName} Fetching user with username: ${username}`);
      return await this.model.findOne({ username });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error fetching ${this.tag} by username`, {
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
      logger.error(`${this.logFileName} Error querying ${this.tag}`, {
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
  async create(createDto: TCreateDto): Promise<TModel> {
    try {
      logger.info(`${this.logFileName} Creating ${this.tag}`);
      const entity = new this.model(createDto);
      return await entity.save();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error creating ${this.tag}`, {
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
  async update(uuid: string, updateData: TUpdateDto): Promise<TModel | null> {
    try {
      logger.info(`${this.logFileName} Updating ${this.tag} with uuid: ${uuid}`);
      return await this.model.findOneAndUpdate({ uuid }, updateData, { new: true });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error updating ${this.tag}`, {
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
  async delete(uuid: string): Promise<TModel | null> {
    try {
      logger.info(`${this.logFileName} Deleting ${this.tag} with uuid: ${uuid}`);
      return await this.model.findOneAndDelete({ uuid });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error deleting ${this.tag}`, {
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
      return await this.model.deleteMany({ uuid: { $in: ids } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`${this.logFileName} Error deleting multiple ${this.tag}`, {
        ids,
        error: error.message,
      });
      throw new Error(error);
    }
  }
}
