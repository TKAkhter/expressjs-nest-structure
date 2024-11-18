import { UserDto, User } from "./user.dto";
import { hash } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { env } from "../../config/env";

export class UserService {
  async getAllUsers() {
    try {
      const users = await User.find();
      return users;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Error fetching users: " + error.message);
      }
      throw new Error("Unknown error occurred while fetching users.");
    }
  }

  async getUserByUuid(uuid: string) {
    try {
      const user = await User.findOne({ uuid });
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Error fetching user by UUID: " + error.message);
      }
      throw new Error("Unknown error occurred while fetching user by UUID.");
    }
  }

  async getUserByUsername(username: string) {
    try {
      const user = await User.findOne({ username });
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Error fetching user by username: " + error.message);
      }
      throw new Error("Unknown error occurred while fetching user by username.");
    }
  }

  async createUser(userData: UserDto) {
    try {
      const user = await this.getUserByUsername(userData.username);

      if (user) {
        throw new Error("User already exists!");
      }

      const hashedPassword = await hash(userData.password, env.HASH!);
      const currentTime = new Date();
      const newUser = new User({ ...userData, uuid: uuidv4(), password: hashedPassword, createdAt: currentTime, updatedAt: currentTime });

      return await newUser.save();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Error creating user: " + error.message);
      }
      throw new Error("Unknown error occurred while creating user.");
    }
  }

  async updateUser(uuid: string, updateData: Partial<UserDto>) {
    try {
      const user = await this.getUserByUuid(uuid);

      if (!user) {
        throw new Error("User does not exist!");
      }

      if (updateData.password) {
        updateData.password = await hash(updateData.password, env.HASH!);
      }

      const currentTime = new Date();
      updateData.updatedAt = currentTime;

      return await User.findByIdAndUpdate(user.id, updateData, { new: true });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Error updating user: " + error.message);
      }
      throw new Error("Unknown error occurred while updating user.");
    }
  }

  async deleteUser(uuid: string) {
    try {
      const user = await this.getUserByUuid(uuid);

      if (!user) {
        throw new Error("User does not exist!");
      }

      return await User.findByIdAndDelete(user.id);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Error deleting user: " + error.message);
      }
      throw new Error("Unknown error occurred while deleting user.");
    }
  }

  async deleteAllUsers(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Invalid array of IDs.");
    }

    const result = await User.deleteMany({ uuid: { $in: ids } });

    if (result.deletedCount === 0) {
      throw new Error("No users found to delete.");
    }

    return result;
  }
}