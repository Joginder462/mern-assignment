import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'this_is_a_secret_key';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) {
            return res.status(401).json({ 
                success: false,
                message: 'No token provided' 
            });
        }

        const token = auth.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'No token provided' 
            });
        }

        const payload = jwt.verify(token, JWT_SECRET) as any;
        (req as any).user = payload;
        next();
    } catch (error: any) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ 
            success: false,
            message: 'Invalid or expired token' 
        });
    }
};