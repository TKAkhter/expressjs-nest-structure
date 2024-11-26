import { NextFunction, Request, Response } from "express";
import { UserService } from "./user.service";
import { CreateUserDto } from "./user.dto";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";

const userService = new UserService();

export class UserController {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (error) {
      next(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    try {
      const user = await userService.getUserByUuid(id);
      if (!user) {
        throw createHttpError(StatusCodes.BAD_REQUEST, "User not found", { resource: "User" });
      }
      return res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUserByUsername(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { username } = req.params;
    try {
      const user = await userService.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async findByQuery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, rowsPerPage, sort, filter } = req.body;

      const queryOptions = {
        page,
        rowsPerPage,
        sort,
        filter,
      };

      const result = await userService.findByQuery(queryOptions);
      res.status(200).json(result);
    } catch (error) {
      next(createHttpError(500, error instanceof Error ? error.message : "Internal Server Error"));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    const userDto: CreateUserDto = req.body;
    try {
      const user = await userService.createUser(userDto);
      return res.status(StatusCodes.OK).json(user);
    } catch (error) {
      next(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    const updateData = req.body;
    try {
      const user = await userService.updateUser(id, updateData);
      return res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    try {
      await userService.deleteUser(id);
      return res.status(StatusCodes.CREATED).send("User Deleted Successfully");
    } catch (error) {
      next(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteAllUsers(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { ids } = req.body;
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw createHttpError(StatusCodes.BAD_REQUEST, "Invalid or empty array of IDs.", {
          resource: "User",
        });
      }

      const result = await userService.deleteAllUsers(ids);

      return res.status(StatusCodes.OK).json({
        message: `${result.deletedCount} users deleted successfully.`,
      });
    } catch (error) {
      next(error);
    }
  }
}
