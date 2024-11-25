import { UserModel, UpdateUserDto, CreateUserDto } from "./user.dto";
import { env } from "../../config/env";
import { hash } from "bcrypt";
import { v4 as uuidv4 } from "uuid";

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
            return user;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching user by UUID: ${error.message}`);
            }
            throw new Error("Unknown error occurred while fetching user by UUID.");
        }
    }

    async getUserByUsername(username: string) {
        try {
            const user = await UserModel.findOne({ username });
            return user;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching user by username: ${error.message}`);
            }
            throw new Error("Unknown error occurred while fetching user by username.");
        }
    }

    async createUser(userData: CreateUserDto) {
        try {
            const user = await this.getUserByUsername(userData.username);

            if (user) {
                throw new Error("User already exists!");
            }

            const hashedPassword = await hash(userData.password, env.HASH!);
            const currentTime = new Date();
            const newUser = new UserModel({
                ...userData,
                "uuid": uuidv4(),
                "password": hashedPassword,
                "createdAt": currentTime,
                "updatedAt": currentTime
            });

            return await newUser.save();
        } catch (error) {
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
                throw new Error("User does not exist!");
            }

            if (updateData.password) {
                updateData.password = await hash(updateData.password, env.HASH!);
            }

            const currentTime = new Date();
            updateData.updatedAt = currentTime;

            return await UserModel.findByIdAndUpdate(user.id, updateData, { "new": true });
        } catch (error) {
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
                throw new Error("User does not exist!");
            }

            return await UserModel.findByIdAndDelete(user.id);
        } catch (error) {
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

        const result = await UserModel.deleteMany({ "uuid": { "$in": ids } });

        if (result.deletedCount === 0) {
            throw new Error("No users found to delete.");
        }

        return result;
    }
}
