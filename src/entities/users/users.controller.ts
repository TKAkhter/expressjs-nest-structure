import { NextFunction, Response } from "express";
import { UsersService } from "@/entities/users/users.service";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/common/winston/winston";
import { CustomRequest } from "@/types/request";
import { createResponse } from "@/utils/create-response";
import { BaseController } from "@/common/base/base.controller";
import { CreateUsersDto, UpdateUsersDto, UsersDto, UsersModel } from "./users.dto";

export class UsersController extends BaseController<UsersDto, CreateUsersDto, UpdateUsersDto> {
  public collectionName: string;
  public usersService: UsersService;

  constructor() {
    super(UsersModel, "Users");
    this.collectionName = "Users";
    this.usersService = new UsersService(UsersModel, this.collectionName);
  }

  /**
   * Create a new entity
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON created entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const createDto = req.body;
    const { loggedUser } = req;
    try {
      logger.info(`[${this.collectionName} Controller] Creating new ${this.collectionName}`, {
        loggedUser,
        createDto,
      });
      const created = await this.usersService.create(createDto);
      return res.json(
        createResponse(req, created, "User created successfully", StatusCodes.CREATED),
      );
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`[${this.collectionName} Controller] Error creating ${this.collectionName}`, {
          error: error.message,
          loggedUser,
          createDto,
        });
      }
      next(error);
    }
  };

  /**
   * Update an existing entity
   * @param req - CustomRequest object
   * @param res - Response object
   * @param next - Next middleware function
   * @returns JSON updated entity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    const { uuid } = req.params;
    const updateDto = req.body;
    const { loggedUser } = req;
    try {
      logger.info(`[${this.collectionName} Controller] Updating ${this.collectionName}`, {
        loggedUser,
        uuid,
        updateDto,
      });
      const updatedData = await this.usersService.update(uuid, updateDto);
      return res.json(createResponse(req, updatedData, "User updated successfully"));
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`[${this.collectionName} Controller] Error updating ${this.collectionName}`, {
          error: error.message,
          loggedUser,
          uuid,
          updateDto,
        });
      }
      next(error);
    }
  };
}
