import { NextFunction, Request, Response } from "express";
import { AuthDto, RegisterDto } from "./auth.dto";
import { AuthService } from "./auth.services";

const authService = new AuthService();

export class AuthController {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async login(req: Request, res: Response, next: NextFunction): Promise<any> {
        const userDto: AuthDto = req.body;
        try {
            const user = await authService.login(userDto);
            return res.json(user);
        } catch (error) {
            next(error);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async register(req: Request, res: Response, next: NextFunction): Promise<any> {
        const registerDto: RegisterDto = req.body;
        try {
            const user = await authService.register(registerDto);
            return res.json(user);
        } catch (error) {
            next(error);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async logout(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const result = await authService.logout(token!);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async extendToken(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const newToken = await authService.extendToken(token!);
            return res.json({ token: newToken });
        } catch (error) {
            next(error);
        }
    }
}
