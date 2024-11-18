import { Request, Response } from "express";
import { UserService } from "./user.service";
import { UserDto } from "./user.dto";

const userService = new UserService();

export class UserController {
  async getAllUsers(_req: Request, res: Response): Promise<any> {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(500).json({ message: "Unknown error occurred while fetching users." });
    }
  };

  async getUser(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    try {
      const user = await userService.getUserByUuid(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(500).json({ message: "Unknown error occurred while fetching user by UUID." });
    }
  };

  async getUserByUsername(req: Request, res: Response): Promise<any> {
    const { username } = req.params;
    try {
      const user = await userService.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(500).json({ message: "Unknown error occurred while fetching user by username." });
    }
  };

  async createUser(req: Request, res: Response): Promise<any> {
    const userDto: UserDto = req.body;
    try {
      const user = await userService.createUser(userDto);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Unknown error occurred while creating user." });
    }
  };

  async updateUser(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const updateData = req.body;
    try {
      const user = await userService.updateUser(id, updateData);
      return res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Unknown error occurred while updating user." });
    }
  };

  async deleteUser(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    try {
      const user = await userService.deleteUser(id);
      return res.status(201).send("User Deleted Successfully");
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Unknown error occurred while deleting user." });
    }
  };

  async deleteAllUsers(req: Request, res: Response): Promise<any> {
    const { ids } = req.body;
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid or empty array of IDs." });
      }

      const result = await userService.deleteAllUsers(ids);

      return res.status(200).json({
        message: `${result.deletedCount} users deleted successfully.`,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Unknown error occurred while deleting users." });
    }
  };
}
