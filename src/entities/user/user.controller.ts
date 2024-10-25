import { Request, Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';

const userService = new UserService();

export const createUser = async (req: Request, res: Response): Promise<any> => {
  const userDto: CreateUserDto = req.body;

  const user = await userService.createUser(userDto);
  return res.json(user);
};