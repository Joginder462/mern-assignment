import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin';
import { validateReqFields } from '../utils/validateReqFields';
import { z } from 'zod';
import { errorResponse, successResponse } from '../utils/response';
import { authMiddleware } from '../middleware/authMiddleware';
import { generateToken } from '../utils/generateToken';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
    try {
        const validatedData = validateReqFields(req.body, {
            email: z.string().email('Invalid email format'),
            password: z.string().min(6, 'Password must be at least 6 characters long'),
            name: z.string().min(2, 'Name must be at least 2 characters long').max(50, 'Name must be at most 50 characters long')
        });

        const { email, password, name } = validatedData;

        // Check if admin already exists
        const existing = await Admin.findOne({ email });
        if (existing) {
            return res.status(400).json(errorResponse('Admin with this email already exists'));
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password as string, 12);

        // Create admin
        const admin = await Admin.create({ 
            email, 
            name, 
            passwordHash 
        });

        // Generate token
        const token = generateToken(admin);

        // Return response without password hash
        const adminData = {
            id: admin._id,
            email: admin.email,
            name: admin.name,
            createdAt: admin.createdAt
        };

        return res.status(201).json(successResponse({
            admin: adminData,
            token
        }, 'Admin registered successfully'));

    } catch (err: any) {
        console.error('Registration error:', err);
        
        if (err.statusCode) {
            return res.status(err.statusCode).json(errorResponse(err.message));
        }
        
        return res.status(500).json(errorResponse('Internal server error'));
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const validatedData = validateReqFields(req.body, {
            email: z.string().email('Invalid email format'),
            password: z.string().min(6, 'Password must be at least 6 characters long')
        });

        const { email, password } = validatedData;

        // Find admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json(errorResponse('Invalid email or password'));
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password as string, admin.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json(errorResponse('Invalid email or password'));
        }

        // Generate token
        const token = generateToken(admin);

        // Return response without password hash
        const adminData = {
            id: admin._id,
            email: admin.email,
            name: admin.name,
            createdAt: admin.createdAt
        };

        return res.json(successResponse({
            admin: adminData,
            token
        }, 'Login successful'));

    } catch (err: any) {
        console.error('Login error:', err);
        
        if (err.statusCode) {
            return res.status(err.statusCode).json(errorResponse(err.message));
        }
        
        return res.status(500).json(errorResponse('Internal server error'));
    }
});

router.get('/admin-only', authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user;
    return res.json(successResponse({
        message: 'Hello Admin',
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    }, 'Protected route accessed successfully'));
});

router.get('/health', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Auth microservice is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

export default router;
