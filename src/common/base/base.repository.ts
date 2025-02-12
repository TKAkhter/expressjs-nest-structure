import { FindByQueryDto, FindByQueryResult, ImportResult } from "@/schemas/find-by-query";
import { logger } from "@/common/winston/winston";

export class BaseRepository<T, TCreateDto, TUpdateDto> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private model: any;
  private collectionName: string;
  private ignoreFields: Record<string, boolean>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(model: any, collectionName: string, ignoreFields: Record<string, boolean> = {}) {
    this.model = model;
    this.collectionName = collectionName;
    this.ignoreFields = ignoreFields;
  }

  /**
   * Fetches all entities from the collection.
   * @returns Array of entities
   */
  getAll = async (): Promise<T[]> => {
    try {
      logger.info(`[${this.collectionName} Repository] Fetching all from ${this.collectionName}`);
      const getAll = await this.model.findMany({ omit: this.ignoreFields });
      return getAll;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(
        `[${this.collectionName} Repository] Error fetching all from ${this.collectionName}`,
        {
          error: error.message,
        },
      );
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
      logger.info(
        `[${this.collectionName} Repository] Fetching ${this.collectionName} with id: ${id}`,
      );
      return await this.model.findUnique({ where: { id }, omit: this.ignoreFields });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(
        `[${this.collectionName} Repository] Error fetching ${this.collectionName} by id`,
        {
          id,
          error: error.message,
        },
      );
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
      logger.info(
        `[${this.collectionName} Repository] Fetching ${this.collectionName} with uuid: ${uuid}`,
      );
      return await this.model.findUnique({ where: { uuid }, omit: this.ignoreFields });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(
        `[${this.collectionName} Repository] Error fetching ${this.collectionName} by uuid`,
        {
          uuid,
          error: error.message,
        },
      );
      throw new Error(error);
    }
  };

  /**
   * Fetches a entity or entities by their userId.
   * @param uuid - entity's unique identifier
   * @returns entity data or null if not found
   */
  getByUser = async (userId: string): Promise<T | T[] | null> => {
    try {
      logger.info(
        `[${this.collectionName} Repository] Fetching ${this.collectionName} with userId: ${userId}`,
      );
      return await this.model.findMany({ where: { userRef: userId }, omit: this.ignoreFields });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(
        `[${this.collectionName} Repository] Error fetching ${this.collectionName} by userId`,
        {
          userId,
          error: error.message,
        },
      );
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
      logger.info(
        `[${this.collectionName} Repository] Fetching ${this.collectionName} with email: ${email}`,
      );
      return await this.model.findUnique({ where: { email } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(
        `[${this.collectionName} Repository] Error fetching ${this.collectionName} by email`,
        {
          email,
          error: error.message,
        },
      );
      throw new Error(error);
    }
  };

  /**
   * Fetches a entity by their username.
   * @param username - entity's username
   * @returns entity data or null if not found
   */
  getByUsername = async (username: string): Promise<T | null> => {
    try {
      logger.info(
        `[${this.collectionName} Repository] Fetching ${this.collectionName} with username: ${username}`,
      );
      return await this.model.findUnique({ where: { username }, omit: this.ignoreFields });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(
        `[${this.collectionName} Repository] Error fetching ${this.collectionName} by username`,
        {
          username,
          error: error.message,
        },
      );
      throw new Error(error);
    }
  };

  /**
   * Fetches a document based on a specified field and its value.
   * @param field - The field name to search by.
   * @param value - The value to match for the specified field.
   * @returns The matched document or null if not found.
   */
  getByField = async (field: string, value: string | number): Promise<T | null> => {
    try {
      logger.info(
        `[${this.collectionName} Repository] Fetching ${this.collectionName} where ${field}: ${value}`,
      );
      return await this.model.findMany({ where: { [field]: value }, omit: this.ignoreFields });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(
        `[${this.collectionName} Repository] Error fetching ${this.collectionName} by ${field}`,
        {
          field,
          value,
          error: error.message,
        },
      );
      throw new Error(error);
    }
  };

  /**
   * Finds entities with pagination.
   * @param options - Query options
   * @returns Paginated data
   */
  findByQuery = async (options: FindByQueryDto): Promise<FindByQueryResult<T>> => {
    const { filter = {}, paginate = { page: 1, perPage: 10 }, orderBy = [] } = options;
    const { page, perPage } = paginate;

    try {
      const sortOptions = orderBy.reduce(
        (acc, { sort, order }) => {
          acc[sort] = order;
          return acc;
        },
        {} as Record<string, "asc" | "desc">,
      );

      const [data, total] = await Promise.all([
        this.model.findMany({
          where: filter,
          orderBy: sortOptions,
          skip: (page - 1) * perPage,
          take: perPage,
          omit: this.ignoreFields,
        }),
        this.model.count({ where: filter }),
      ]);

      return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`[${this.collectionName} Repository] Error querying ${this.collectionName}`, {
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
  create = async (createDto: TCreateDto): Promise<T | null> => {
    try {
      logger.info(
        `[${this.collectionName} Repository] Creating document in ${this.collectionName}`,
      );
      const created = this.model.create({ data: createDto });
      return created;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(
        `[${this.collectionName} Repository] Error creating entry in ${this.collectionName}`,
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
   * @param uuid - Entity's unique identifier
   * @param updateDto - Data to update the entity
   * @returns Updated entity data
   */
  update = async (uuid: string, updateDto: TUpdateDto): Promise<T | null> => {
    try {
      logger.info(
        `[${this.collectionName} Repository] Updating ${this.collectionName} with uuid: ${uuid}`,
      );
      return await this.model.update({ where: { uuid }, data: updateDto });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`[${this.collectionName} Repository] Error updating ${this.collectionName}`, {
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
      logger.info(
        `[${this.collectionName} Repository] Deleting ${this.collectionName} with uuid: ${uuid}`,
      );
      return await this.model.delete({ where: { uuid } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`[${this.collectionName} Repository] Error deleting ${this.collectionName}`, {
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
  async deleteMany(uuids: string[]): Promise<{ deletedCount: number }> {
    try {
      const result = await this.model.deleteMany({ where: { uuid: { in: uuids } } });
      return { deletedCount: result.count };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(
        `[${this.collectionName} Repository] Error deleting multiple ${this.collectionName}`,
        {
          uuids,
          error: error.message,
        },
      );
      throw new Error(error);
    }
  }

  /**
   * Imports multiple entity objects into the database.
   * Skips objects where email or username already exist in the database.
   * @param entities - Array of entity objects to be saved
   * @returns Object containing created entities, created count, and skipped count
   */
  import = async (entities: TCreateDto[]): Promise<ImportResult<T>> => {
    try {
      logger.info(
        `[${this.collectionName} Repository] Importing ${entities.length} documents into ${this.collectionName}`,
      );

      const uniqueEntities = [];
      const skippedEntities = [];

      for (const entity of entities) {
        // eslint-disable-next-line no-await-in-loop
        const exists = await this.model.findFirst({
          where: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            OR: [{ email: (entity as any).email }, { username: (entity as any).username }],
          },
        });

        if (exists) {
          skippedEntities.push(entity);
        } else {
          uniqueEntities.push(entity);
        }
      }

      const createdEntities = await this.model.createMany({
        data: uniqueEntities,
      });

      logger.info(`[${this.collectionName} Repository] Import Summary:`, {
        createdEntities,
        createdCount: createdEntities.length,
        skippedCount: skippedEntities.length,
      });

      return {
        createdEntities,
        createdCount: createdEntities.length,
        skippedCount: skippedEntities.length,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(
        `[${this.collectionName} Repository] Error importing into ${this.collectionName}`,
        {
          totalEntities: entities.length,
          error: error.message,
        },
      );
      throw new Error(error);
    }
  };
}
