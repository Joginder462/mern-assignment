import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generateRecommendations } from '../services/geminiService';

const router = Router();

const RecommendationRequestSchema = z.object({
  topics: z.array(z.string()).min(1, 'At least one topic is required'),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.string().optional(),
  interests: z.array(z.string()).optional(),
  learningGoals: z.string().optional()
});

router.post('/recommendations', async (req: Request, res: Response) => {
  try {
    const body = RecommendationRequestSchema.parse(req.body);

    const recommendations = await generateRecommendations(body);

    res.json({
      success: true,
      data: recommendations,
      message: 'Course recommendations generated successfully'
    });
  } catch (error: any) {
    console.error('Recommendation error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
});

export default router;
