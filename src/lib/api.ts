// API configuration and services for microservices integration
const API_BASE_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:4000',
  ai: process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:4001',
  courses: process.env.NEXT_PUBLIC_COURSES_API_URL || 'http://localhost:4002'
};

// Auth API Service
export class AuthAPI {
  private baseURL = API_BASE_URLS.auth;

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  async register(name: string, email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  async verifyToken(token: string) {
    const response = await fetch(`${this.baseURL}/auth/admin-only`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    return response.json();
  }
}

// AI Recommendations API Service
export class AIAPI {
  private baseURL = API_BASE_URLS.ai;

  async getRecommendations(preferences: {
    topics: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    duration?: string;
    interests?: string[];
    learningGoals?: string;
  }) {
    const response = await fetch(`${this.baseURL}/api/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get recommendations');
    }

    return response.json();
  }
}

// Course Management API Service
export class CourseAPI {
  private baseURL = API_BASE_URLS.courses;

  async uploadCSV(file: File) {
    const formData = new FormData();
    formData.append('csvFile', file);

    const response = await fetch(`${this.baseURL}/api/courses/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'CSV upload failed');
    }

    return response.json();
  }

  async searchCourses(query: string, filters?: {
    university?: string;
    discipline?: string;
    courseLevel?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams({
      q: query,
      ...(filters?.university && { university: filters.university }),
      ...(filters?.discipline && { discipline: filters.discipline }),
      ...(filters?.courseLevel && { courseLevel: filters.courseLevel }),
      ...(filters?.page && { page: filters.page.toString() }),
      ...(filters?.limit && { limit: filters.limit.toString() }),
    });

    const response = await fetch(`${this.baseURL}/api/courses/search?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Search failed');
    }

    return response.json();
  }

  async getCourses(filters?: {
    page?: number;
    limit?: number;
    university?: string;
    discipline?: string;
  }) {
    const params = new URLSearchParams({
      ...(filters?.page && { page: filters.page.toString() }),
      ...(filters?.limit && { limit: filters.limit.toString() }),
      ...(filters?.university && { university: filters.university }),
      ...(filters?.discipline && { discipline: filters.discipline }),
    });

    const response = await fetch(`${this.baseURL}/api/courses?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get courses');
    }

    return response.json();
  }

  async getCourseById(id: string) {
    const response = await fetch(`${this.baseURL}/api/courses/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get course');
    }

    return response.json();
  }
}

// Export API instances
export const authAPI = new AuthAPI();
export const aiAPI = new AIAPI();
export const courseAPI = new CourseAPI();
