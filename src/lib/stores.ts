import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, aiAPI, courseAPI } from '@/lib/api';

// Auth Store
interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(email, password);
          set({
            user: response.data,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(name, email, password);
          set({
            user: response.data,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Course Store
interface Course {
  _id: string;
  courseName: string;
  universityName: string;
  discipline: string;
  courseLevel: string;
  overview: string;
  summary: string;
  keywords: string[];
  duration: number;
  credits: number;
  totalTuitionFee: number;
  tuitionFeeCurrency: string;
}

interface CourseState {
  courses: Course[];
  searchResults: Course[];
  currentCourse: Course | null;
  isLoading: boolean;
  searchQuery: string;
  filters: {
    university?: string;
    discipline?: string;
    courseLevel?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  cache: Map<string, any>;
  
  // Actions
  searchCourses: (query: string, filters?: any) => Promise<void>;
  getCourses: (filters?: any) => Promise<void>;
  getCourseById: (id: string) => Promise<void>;
  uploadCSV: (file: File) => Promise<void>;
  setFilters: (filters: any) => void;
  setSearchQuery: (query: string) => void;
  clearCache: () => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  searchResults: [],
  currentCourse: null,
  isLoading: false,
  searchQuery: '',
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  cache: new Map(),

  searchCourses: async (query: string, filters = {}) => {
    set({ isLoading: true, searchQuery: query, filters });
    
    const cacheKey = `search:${query}:${JSON.stringify(filters)}`;
    const cached = get().cache.get(cacheKey);
    
    if (cached) {
      set({
        searchResults: cached.results,
        pagination: cached.pagination,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await courseAPI.searchCourses(query, filters);
      const results = response.data.results || [];
      
      set({
        searchResults: results,
        pagination: response.data.pagination,
        isLoading: false,
      });

      // Cache results
      get().cache.set(cacheKey, {
        results,
        pagination: response.data.pagination,
        timestamp: Date.now(),
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  getCourses: async (filters = {}) => {
    set({ isLoading: true });
    
    const cacheKey = `courses:${JSON.stringify(filters)}`;
    const cached = get().cache.get(cacheKey);
    
    if (cached) {
      set({
        courses: cached.courses,
        pagination: cached.pagination,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await courseAPI.getCourses(filters);
      const courses = response.data.courses || [];
      
      set({
        courses,
        pagination: response.data.pagination,
        isLoading: false,
      });

      // Cache results
      get().cache.set(cacheKey, {
        courses,
        pagination: response.data.pagination,
        timestamp: Date.now(),
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  getCourseById: async (id: string) => {
    set({ isLoading: true });
    
    const cacheKey = `course:${id}`;
    const cached = get().cache.get(cacheKey);
    
    if (cached) {
      set({
        currentCourse: cached,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await courseAPI.getCourseById(id);
      const course = response.data;
      
      set({
        currentCourse: course,
        isLoading: false,
      });

      // Cache result
      get().cache.set(cacheKey, course);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  uploadCSV: async (file: File) => {
    set({ isLoading: true });
    try {
      const response = await courseAPI.uploadCSV(file);
      set({ isLoading: false });
      
      // Clear cache after upload
      get().clearCache();
      
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  clearCache: () => {
    set({ cache: new Map() });
  },
}));

// AI Recommendations Store
interface Recommendation {
  courseName: string;
  universityName: string;
  matchScore: number;
  rationale: string;
  category: string;
  duration: string;
  difficulty: string;
}

interface AIState {
  recommendations: Recommendation[];
  isLoading: boolean;
  preferences: {
    topics: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    duration?: string;
    interests?: string[];
    learningGoals?: string;
  };
  
  getRecommendations: (preferences: any) => Promise<void>;
  setPreferences: (preferences: any) => void;
}

export const useAIStore = create<AIState>((set) => ({
  recommendations: [],
  isLoading: false,
  preferences: {
    topics: [],
    skillLevel: 'beginner',
  },

  getRecommendations: async (preferences) => {
    set({ isLoading: true, preferences });
    try {
      const response = await aiAPI.getRecommendations(preferences);
      set({
        recommendations: response.data || [],
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setPreferences: (preferences) => {
    set({ preferences });
  },
}));
