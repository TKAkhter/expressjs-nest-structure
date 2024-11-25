import { NextFunction, Request, Response } from "express";
import { UserService } from "./user.service";
import { CreateUserDto } from "./user.dto";
import createHttpError from "http-errors";

const userService = new UserService();

export class UserController {
  async getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (error) {
      next(error);
    }
  };

  async getUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    try {
      const user = await userService.getUserByUuid(id);
      if (!user) {
        throw createHttpError(400, "User not found", { resource: "User" });
      }
      return res.json(user);
    } catch (error) {
      next(error);
    }
  };

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
  };

  async createUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    const userDto: CreateUserDto = req.body;
    try {
      const user = await userService.createUser(userDto);
      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    const updateData = req.body;
    try {
      const user = await userService.updateUser(id, updateData);
      return res.json(user);
    } catch (error) {
      next(error);
    }
  };

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    try {
      await userService.deleteUser(id);
      return res.status(201).send("User Deleted Successfully");
    } catch (error) {
      next(error);
    }
  };

  async deleteAllUsers(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { ids } = req.body;
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw createHttpError(400, "Invalid or empty array of IDs.", { resource: "User" });
      }

      const result = await userService.deleteAllUsers(ids);

      return res.status(200).json({
        message: `${result.deletedCount} users deleted successfully.`,
      });
    } catch (error) {
      next(error);
    }
  };
}
