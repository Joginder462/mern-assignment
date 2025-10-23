import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import recommendationRouter from './routes/recommendations';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT ? Number(process.env.PORT) : 4001;

app.use('/api', recommendationRouter);

app.get('/', (req, res) => res.json({ 
  status: 'AI Recommendations microservice running',
  version: '1.0.0',
  endpoints: {
    recommendations: '/api/recommendations'
  }
}));

app.listen(PORT, () => {
  console.log(`🚀 AI Recommendations microservice running on port ${PORT}`);
});

export default app;
