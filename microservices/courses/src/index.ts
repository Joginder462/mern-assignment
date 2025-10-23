import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import courseRouter from './routes/courses';
import { connectDB } from './utils/connectDB';
import { connectElasticsearch } from './utils/elasticsearch';
import { connectRedis } from './utils/redis';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT ? Number(process.env.PORT) : 4002;

app.use('/api', courseRouter);

app.get('/', (req, res) => res.json({ 
  status: 'Course Management microservice running',
  version: '1.0.0',
  endpoints: {
    upload: '/api/courses/upload',
    search: '/api/courses/search',
    courses: '/api/courses'
  }
}));

async function start() {
  try {
    // Connect to all services
    await connectDB();
    await connectElasticsearch();
    await connectRedis();
    
    app.listen(PORT, () => {
      console.log(`🚀 Course Management microservice running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start course-ms', err);
    process.exit(1);
  }
}

start();

export default app;
