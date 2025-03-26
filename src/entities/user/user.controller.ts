import { NextFunction, Response } from "express";
import { UserService } from "@/entities/user/user.service";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/common/winston/winston";
import { CustomRequest } from "@/types/request";
import { createResponse } from "@/utils/create-response";
import { BaseController } from "@/common/base/base.controller";
import { CreateUserDto, UpdateUserDto } from "@/entities/user/user.dto";
import { PrismaClient, user as User } from "@prisma/client";

const prisma = new PrismaClient();
const IGNORE_FIELDS = { password: true };

export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  public collectionName: string;
  public userService: UserService;

  constructor() {
    super(prisma.user, "User", IGNORE_FIELDS);
    this.collectionName = "User";
    this.userService = new UserService(prisma.user, this.collectionName, IGNORE_FIELDS);
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
      const created = await this.userService.create(createDto);
      return res.json(createResponse({ data: created, status: StatusCodes.CREATED }));
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
    const { id } = req.params;
    const updateDto = req.body;
    const { loggedUser } = req;
    try {
      logger.info(`[${this.collectionName} Controller] Updating ${this.collectionName}`, {
        loggedUser,
        id,
        updateDto,
      });
      const updatedData = await this.userService.update(id, updateDto);
      return res.json(createResponse({ data: updatedData, status: StatusCodes.CREATED }));
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`[${this.collectionName} Controller] Error updating ${this.collectionName}`, {
          error: error.message,
          loggedUser,
          id,
          updateDto,
        });
      }
      next(error);
    }
  };
}
