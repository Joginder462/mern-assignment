import jwt from 'jsonwebtoken';
import { IAdmin } from "../models/Admin";

const JWT_SECRET = process.env.JWT_SECRET || 'this_is_a_secret_key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '4h';

export const generateToken = (admin: IAdmin): string => {
    const payload = { 
        id: admin._id,
        email: admin.email,
        name: admin.name 
    };
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY } as any);
};

export const sendToken = (admin: IAdmin, statusCode: number, res: any) => {
    const token = generateToken(admin);
    
    const adminData = {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
    };

    res.status(statusCode).json({
        success: true,
        data: {
            admin: adminData,
            token
        },
        message: 'Authentication successful'
    });
};

export default { generateToken, sendToken };