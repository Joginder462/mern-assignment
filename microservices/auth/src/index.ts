import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import connectDB from './utils/connectDB';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:9002',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Routes
app.use('/auth', authRouter);

// Health check endpoint
app.get('/', (req, res) => res.json({ 
    status: 'Auth microservice running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        adminOnly: 'GET /auth/admin-only',
        health: 'GET /auth/health'
    }
}));

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

async function start() {
    try {
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`🚀 Auth microservice running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:9002'}`);
        });
    } catch (err) {
        console.error('Failed to start auth microservice:', err);
        process.exit(1);
    }
}

start();

export default app;