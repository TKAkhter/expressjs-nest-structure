import { sign, verify } from 'jsonwebtoken';
import { env } from '../../config/env';

export const generateToken = (payload: object) => {
    return sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_SECRET_EXPIRATION });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const verifyToken = (token: string): any => {
    try {
        return verify(token, env.JWT_SECRET);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};