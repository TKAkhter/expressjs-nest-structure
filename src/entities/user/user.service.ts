import { CreateUserDto } from "./dto/user.dto";

export class UserService {
    async createUser(userData: CreateUserDto) {
      console.log("🚀 ~ UserService ~ createUser ~ userData:", userData);
      // Implementation for creating a user
    }
  }