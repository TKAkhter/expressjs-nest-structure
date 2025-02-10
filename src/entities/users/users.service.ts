import { UsersDto, UpdateUsersDto, CreateUsersDto } from "@/entities/users/users.dto";
import { env } from "@/config/env";
import { hash } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/common/winston/winston";
import { BaseService } from "@/common/base/base.services";

export class UsersService extends BaseService<UsersDto, CreateUsersDto, UpdateUsersDto> {
  private collectionNameService: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(model: any, collectionName: string, ignoreFields?: Record<string, boolean>) {
    super(model, collectionName, ignoreFields);
    this.collectionNameService = collectionName;
  }

  /**
   * Creates a new entity.
   * @param createDto - Data for creating a new entity
   * @returns Created entity data
   */
  create = async (createDto: CreateUsersDto): Promise<UsersDto | null> => {
    try {
      logger.info(
        `[${this.collectionNameService} Service] Creating ${this.collectionNameService} with email: ${createDto.email}`,
      );
      const data = await this.baseRepository.getByEmail(createDto.email);
      const username = await this.baseRepository.getByUsername(createDto.username);

      if (data) {
        logger.warn(
          `[${this.collectionNameService} Service] ${this.collectionNameService} with email ${createDto.email} already exists`,
        );
        throw createHttpError(
          StatusCodes.BAD_REQUEST,
          `${this.collectionNameService} already exists!`,
          {
            resource: this.collectionNameService,
          },
        );
      }

      if (username) {
        logger.warn(
          `[${this.collectionNameService} Service] ${this.collectionNameService} with username ${createDto.username} already exists.`,
        );
        throw createHttpError(StatusCodes.BAD_REQUEST, "username is taken!", {
          resource: "Users",
        });
      }

      const hashedPassword = await hash(createDto.password, env.HASH!);

      const newDto = {
        uuid: uuidv4(),
        name: createDto.name,
        email: createDto.email,
        username: createDto.username,
        password: hashedPassword,
      };

      return await this.baseRepository.create(newDto);
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.warn(
          `[${this.collectionNameService} Service] Error creating ${this.collectionNameService}`,
          {
            createDto,
            error: error.message,
          },
        );
        throw new Error(`Error creating ${this.collectionNameService}: ${error.message}`);
      }
      logger.warn(
        `[${this.collectionNameService} Service] Unknown error occurred while creating ${this.collectionNameService}`,
      );
      throw new Error(`Unknown error occurred while creating ${this.collectionNameService}`);
    }
  };

  /**
   * Updates an existing entity.
   * @param uuid - entity's unique identifier
   * @param updateDto - Data to update the entity with
   * @returns Updated entity data
   */
  update = async (uuid: string, updateDto: UpdateUsersDto): Promise<UsersDto | null> => {
    try {
      logger.info(
        `[${this.collectionNameService} Service] Updating ${this.collectionNameService} with uuid: ${uuid}`,
      );
      const data = await this.getByUuid(uuid);

      if (!data) {
        logger.warn(
          `[${this.collectionNameService} Service] ${this.collectionNameService} with uuid ${uuid} does not exist!`,
        );
        throw createHttpError(
          StatusCodes.BAD_REQUEST,
          `${this.collectionNameService} does not exist!`,
          {
            resource: this.collectionNameService,
          },
        );
      }

      if (updateDto.email) {
        const email = await this.baseRepository.getByEmail(updateDto.email);
        if (email) {
          logger.warn(
            `[${this.collectionNameService} Service] ${this.collectionNameService} with email ${updateDto.email} already exists`,
          );
          throw createHttpError(StatusCodes.BAD_REQUEST, "Email already exists!", {
            resource: this.collectionNameService,
          });
        }
      }

      if (updateDto.username) {
        const username = await this.baseRepository.getByUsername(updateDto.username);
        if (username) {
          logger.warn(
            `[${this.collectionNameService} Service] ${this.collectionNameService} with username ${updateDto.email} already exists`,
          );
          throw createHttpError(StatusCodes.BAD_REQUEST, "Username already exists!", {
            resource: this.collectionNameService,
          });
        }
      }

      // If (updateDto.password) {
      //   UpdateDto.password = await hash(updateDto.password, env.HASH!);
      // }

      updateDto.updatedAt = new Date();

      return await this.baseRepository.update(uuid, updateDto);
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        logger.warn(
          `[${this.collectionNameService} Service] Error updating ${this.collectionNameService}`,
          {
            uuid,
            updateDto,
            error: error.message,
          },
        );
        throw new Error(`Error updating ${this.collectionNameService}: ${error.message}`);
      }
      logger.warn(
        `[${this.collectionNameService} Service] Unknown error occurred while updating ${this.collectionNameService}`,
      );
      throw new Error(`Unknown error occurred while updating ${this.collectionNameService}`);
    }
  };
}
