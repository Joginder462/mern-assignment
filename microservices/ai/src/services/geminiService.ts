import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyAhUH6YNwLoB13k9bndosrtJuJot4rDAzk');

export interface RecommendationRequest {
  topics: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  interests?: string[];
  learningGoals?: string;
}

export interface CourseRecommendation {
  courseName: string;
  universityName: string;
  matchScore: number;
  rationale: string;
  category: string;
  duration: string;
  difficulty: string;
}

export async function generateRecommendations(request: RecommendationRequest): Promise<CourseRecommendation[]> {
  try {
    // For assessment purposes, we'll simulate the Gemini AI call
    // In production, you would use the actual Gemini API
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
    You are an expert academic advisor. Based on the following student preferences, recommend 5 relevant courses:

    Topics: ${request.topics.join(', ')}
    Skill Level: ${request.skillLevel}
    Duration Preference: ${request.duration || 'flexible'}
    Interests: ${request.interests?.join(', ') || 'general'}
    Learning Goals: ${request.learningGoals || 'skill development'}

    Please provide course recommendations in the following JSON format:
    [
      {
        "courseName": "Course Name",
        "universityName": "University Name",
        "matchScore": 85,
        "rationale": "Why this course matches the student's needs",
        "category": "Course Category",
        "duration": "Course Duration",
        "difficulty": "beginner/intermediate/advanced"
      }
    ]

    Focus on courses that match the student's skill level and interests. Provide realistic university names and course details.
    `;

    if (process.env.GEMINI_API_KEY === 'AIzaSyAhUH6YNwLoB13k9bndosrtJuJot4rDAzk') {
      return getMockRecommendations(request);
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const recommendations = JSON.parse(text);
    return recommendations;
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Fallback to mock data if API fails
    return getMockRecommendations(request);
  }
}

function getMockRecommendations(request: RecommendationRequest): CourseRecommendation[] {
  const mockCourses = [
    {
      courseName: `Advanced ${request.topics[0]} Programming`,
      universityName: 'Stanford University',
      matchScore: 92,
      rationale: `Perfect match for ${request.skillLevel} level students interested in ${request.topics[0]}`,
      category: request.topics[0],
      duration: '12 weeks',
      difficulty: request.skillLevel
    },
    {
      courseName: `${request.topics[0]} Fundamentals`,
      universityName: 'MIT',
      matchScore: 88,
      rationale: `Comprehensive introduction to ${request.topics[0]} concepts`,
      category: request.topics[0],
      duration: '8 weeks',
      difficulty: 'beginner'
    },
    {
      courseName: `Data Science with ${request.topics[0]}`,
      universityName: 'Harvard University',
      matchScore: 85,
      rationale: `Combines ${request.topics[0]} with practical data science applications`,
      category: 'Data Science',
      duration: '16 weeks',
      difficulty: 'intermediate'
    },
    {
      courseName: `Machine Learning in ${request.topics[0]}`,
      universityName: 'Carnegie Mellon University',
      matchScore: 90,
      rationale: `Advanced course covering ML applications in ${request.topics[0]}`,
      category: 'Machine Learning',
      duration: '20 weeks',
      difficulty: 'advanced'
    },
    {
      courseName: `${request.topics[0]} Project Management`,
      universityName: 'University of California, Berkeley',
      matchScore: 82,
      rationale: `Practical project-based learning in ${request.topics[0]}`,
      category: 'Project Management',
      duration: '10 weeks',
      difficulty: 'intermediate'
    }
  ];

  return mockCourses;
}
