import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export const validateZod = (zSchema: ZodTypeAny) =>
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const data = zSchema.parse(req.body);
            if (data) {
                req.body = data;
                next();
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json(error);
        }
    };

export default validateZod;