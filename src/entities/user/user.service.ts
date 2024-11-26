import { UserModel, UpdateUserDto, CreateUserDto } from "./user.dto";
import { env } from "../../config/env";
import { hash } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { FindByQueryDto } from "../../schemas/find-by-query";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "../../common/winston/winston";

export class UserService {
  async getAllUsers() {
    try {
      const users = await UserModel.find();
      return users;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching users: ${error.message}`);
      }
      throw new Error("Unknown error occurred while fetching users.");
    }
  }

  async getUserByUuid(uuid: string) {
    try {
      const user = await UserModel.findOne({ uuid });

      if (!user) {
        throw createHttpError(StatusCodes.BAD_REQUEST, "User not found.", {
          resource: "User",
        });
      }

      return user;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(`Error fetching user by UUID: ${error.message}`);
      }
      throw new Error("Unknown error occurred while fetching user by UUID.");
    }
  }

  async getUserByUsername(username: string) {
    try {
      const user = await UserModel.findOne({ username });

      if (!user) {
        logger.error(`User with username ${username} not found.`);
        return false;
      }

      return user;
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        throw new Error(`Error fetching user by username: ${error.message}`);
      }
      throw new Error("Unknown error occurred while fetching user by username.");
    }
  }

  async findByQuery(options: FindByQueryDto) {
    const { page, rowsPerPage, sort, filter } = options;

    try {
      const [sortField, sortOrder] = sort.split(":");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortOptions: any = { [sortField]: sortOrder };

      const skip = (page - 1) * rowsPerPage;
      const limit = rowsPerPage;

      const [users, total] = await Promise.all([
        UserModel.find(filter).sort(sortOptions).skip(skip).limit(limit),
        UserModel.countDocuments(filter),
      ]);

      return {
        data: users,
        total,
        page,
        rowsPerPage,
      };
    } catch (error) {
      throw new Error(
        `Error querying users: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async createUser(userData: CreateUserDto) {
    try {
      const user = await this.getUserByUsername(userData.username);

      if (user) {
        throw createHttpError(StatusCodes.BAD_REQUEST, "User already exists!", {
          resource: "User",
        });
      }

      const hashedPassword = await hash(userData.password, env.HASH!);
      const currentTime = new Date();
      const newUser = new UserModel({
        ...userData,
        uuid: uuidv4(),
        password: hashedPassword,
        createdAt: currentTime,
        updatedAt: currentTime,
      });

      return await newUser.save();
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        throw new Error(`Error creating user: ${error.message}`);
      }
      throw new Error("Unknown error occurred while creating user.");
    }
  }

  async updateUser(uuid: string, updateData: UpdateUserDto) {
    try {
      const user = await this.getUserByUuid(uuid);

      if (!user) {
        throw createHttpError(StatusCodes.BAD_REQUEST, "User does not exist!", {
          resource: "User",
        });
      }

      if (updateData.password) {
        updateData.password = await hash(updateData.password, env.HASH!);
      }

      const currentTime = new Date();
      updateData.updatedAt = currentTime;

      return await UserModel.findByIdAndUpdate(user.id, updateData, { new: true });
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        throw new Error(`Error updating user: ${error.message}`);
      }
      throw new Error("Unknown error occurred while updating user.");
    }
  }

  async deleteUser(uuid: string) {
    try {
      const user = await this.getUserByUuid(uuid);

      if (!user) {
        throw createHttpError(StatusCodes.BAD_REQUEST, "User does not exist!", {
          resource: "User",
        });
      }

      return await UserModel.findByIdAndDelete(user.id);
    } catch (error) {
      if (createHttpError.isHttpError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        throw new Error(`Error deleting user: ${error.message}`);
      }
      throw new Error("Unknown error occurred while deleting user.");
    }
  }

  async deleteAllUsers(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Invalid array of IDs.");
    }

    const result = await UserModel.deleteMany({ uuid: { $in: ids } });

    if (result.deletedCount === 0) {
      throw new Error("No users found to delete.");
    }

    return result;
  }
}
