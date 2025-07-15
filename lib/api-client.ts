import qs from './qs';
/**
 * API Client for E-Learning Platform
 * Based on the API documentation in README-api.md
 */

interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface ApiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}

// User types based on API documentation
export interface User {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  role?: {
    id: number;
    name: string;
    description: string;
    type: string;
  };
}

export interface UserProfile {
  id: number;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: {
    url: string;
  };
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  isInstructor: boolean;
  instructorBio?: string;
  expertise?: any;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learningGoals?: string;
  interests?: any;
  socialLinks?: any;
  user: {
    data: {
      id: number;
    };
  };
}

// Course types based on API documentation
export interface Course {
  id: number;
  documentId: string;
  title: string;
  description: string;
  slug: string;
  shortDescription?: string;
  thumbnail?: { url: string };
  avatar?: { url: string };
  introVideo?: { url: string; mime?: string; size?: number };
  promoVideo?: { url: string; mime?: string; size?: number };
  courseMedia?: Array<{ url: string; mime?: string; size?: number; name?: string }>;
  introVideoUrl?: string;
  promoVideoUrl?: string;
  price: number;
  isFree?: boolean;
  isPremium?: boolean;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  objectives?: string;
  prerequisites?: string;
  rating: number;
  totalRatings?: number;
  enrollmentCount?: number;
  completionRate?: number;
  isActive?: boolean;
  featured?: boolean;
  language?: string;
  level?: string;
  requirements?: string;
  createdAt: string;
  updatedAt?: string;
  instructor: {
    data: {
      id: number;
      attributes: {
        username: string;
        email: string;
      };
    };
  };
  category?: {
    data: {
      id: number;
      attributes: {
        name: string;
        slug: string;
      };
    };
  };
  lessons?: { data: Lesson[] };
  tags?: { data: Tag[] };
}

// Lesson types
export interface Lesson {
  id: number;
  documentId: string;
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoFile?: string;
  duration: number;
  sortOrder?: number;
  isPreview?: boolean;
  lessonType?: 'video' | 'reading' | 'assignment' | 'quiz';
  transcript?: string;
  resources?: Array<{ url: string; type?: string; name?: string }>;
  quiz?: any;
  assignment?: any;
  createdAt?: string;
  updatedAt?: string;
  course: {
    data: {
      id: number;
    };
  };
}

// Enrollment types
export interface Enrollment {
  id: number;
  documentId: string;
  enrollmentDate: string;
  completionDate?: string;
  progress: number; // 0-100
  isCompleted: boolean;
  lastAccessedAt?: string;
  certificateIssued: boolean;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentAmount: number;
  createdAt: string;
  updatedAt: string;
  student: {
    data: {
      id: number;
    };
  };
  course: {
    data: {
      id: number;
      attributes: Course;
    };
  };
}

// Progress tracking
export interface LessonProgress {
  id: number;
  documentId: string;
  isCompleted: boolean;
  completionDate?: string;
  timeSpent: number; // minutes
  progressPercentage: number; // 0-100
  lastAccessedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  student: {
    data: {
      id: number;
    };
  };
  lesson: {
    data: {
      id: number;
      attributes: Lesson;
    };
  };
  enrollment: {
    data: {
      id: number;
    };
  };
}

// Review types
export interface CourseReview {
  id: number;
  documentId: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  isPublic: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  course: {
    data: {
      id: number;
      attributes: Course;
    };
  };
  student: {
    data: {
      id: number;
      attributes: {
        username: string;
        email: string;
      };
    };
  };
}

// Certificate types
export interface Certificate {
  id: number;
  documentId: string;
  certificateId: string;
  verificationCode: string;
  issuedDate: string;
  certificateUrl?: string;
  isValid: boolean;
  createdAt: string;
  updatedAt: string;
  course: Course;
  student: User;
  enrollment: Enrollment
}

// Category and Tag types
export interface CourseCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: {
    url: string;
  };
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth-token');
    }
    
    console.log('🔧 API Client initialized with base URL:', this.baseURL);
  }

  /**
   * Helper method to format query strings for Strapi v5
   * This ensures proper formatting of pagination, populate, and filters
   */
  private formatQueryString(queryParams: any): string {
    return qs.stringify(queryParams, { 
      encode: false,
      arrayFormat: 'indices',
      allowDots: false
    });
  }

  private formatPopulateForStrapiV5(populate: string | string[] | Record<string, any> | undefined): any {
    if (!populate) return undefined;
    
    // If it's a string, convert to array
    if (typeof populate === 'string') {
      return populate.split(',').map(item => item.trim());
    }
    
    // If it's already an array, return as is
    if (Array.isArray(populate)) {
      return populate;
    }
    
    // If it's an object, convert to Strapi v5 format
    if (typeof populate === 'object') {
      const formattedPopulate: any = {};
      
      for (const [key, value] of Object.entries(populate)) {
        if (typeof value === 'boolean') {
          // Simple boolean populate
          formattedPopulate[key] = value;
        } else if (typeof value === 'object' && value !== null) {
          // Nested populate
          formattedPopulate[key] = {
            populate: this.formatPopulateForStrapiV5(value)
          };
        } else if (typeof value === 'string') {
          // String populate (like "deep")
          formattedPopulate[key] = value;
        }
      }
      
      return formattedPopulate;
    }
    
    return populate;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add any additional headers from options
    if (options.headers) {
      Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
        headers[key] = value;
      });
    }

    // Only add Authorization header if we have a token and it's not an auth endpoint
    const isAuthEndpoint = endpoint.includes('/auth/');
    if (this.token && !isAuthEndpoint) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    console.log(`🔄 API: ${options.method || 'GET'} ${endpoint}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorData: ApiError;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = {
            error: {
              status: response.status,
              name: 'NetworkError',
              message: `HTTP ${response.status}: ${response.statusText}`,
            },
          };
        }
        
        console.error('❌ API Error:', errorData);
        
        // Handle 401 Unauthorized - automatic logout
        if (errorData.error.status === 401) {
          console.warn('🚪 API: 401 Unauthorized detected, triggering automatic logout');
          this.handleUnauthorized();
        }
        
        throw new Error(errorData.error.message || 'API request failed');
      }

      if (!responseText) {
        return {} as T;
      }

      const data = JSON.parse(responseText);
      console.log('✅ API: Request successful');
      return data;
    } catch (error: any) {
      console.error('❌ API: Request failed:', error);
      
      // Handle specific error types
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new Error('Request timeout - please check if the server is running');
      }
      
      if (error.message?.includes('fetch')) {
        throw new Error('Unable to connect to server - please ensure it is running at ' + this.baseURL);
      }
      
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ jwt: string; user: User }> {
    // Use makeRequest directly to avoid sending Authorization header during login
    const response = await this.makeRequest<{ jwt: string; user: User }>('/auth/local', {
      method: 'POST',
      body: JSON.stringify({
        identifier: email,
        password,
      }),
    });

    console.log('🔍 Login API response:', response);
    console.log('👤 User data from login:', response.user);

    this.token = response.jwt;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', response.jwt);
    }

    return response;
  }

  async register(username: string, email: string, password: string, role?: 'student' | 'instructor'): Promise<{ jwt: string; user: User }> {
    // Use makeRequest directly to avoid sending Authorization header during registration
    const payload: any = {
      username,
      email,
      password,
    };

    // Add role to payload if provided
    if (role) {
      payload.role = role;
    }

    const response = await this.makeRequest<{ jwt: string; user: User }>('/auth/local/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    console.log('🔍 Register API response:', response);
    console.log('👤 User data from register:', response.user);

    this.token = response.jwt;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', response.jwt);
    }

    return response;
  }

  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    try {
      // Request all fields including documentId
      return await this.request<User>('/users/me?populate=role&fields=id,documentId,username,email,confirmed,blocked,createdAt,updatedAt');
    } catch (error) {
      // If getCurrentUser fails, it's likely due to an invalid token
      console.error('❌ API: getCurrentUser failed, token may be invalid:', error);
      throw error;
    }
  }

  async validateToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.log('❌ API: Token validation failed:', error);
      return false;
    }
  }

  logout(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  }

  // User Profile methods
  async getUserProfiles(params?: {
    page?: number;
    pageSize?: number;
    populate?: string | string[] | Record<string, any>;
    filters?: Record<string, any>;
    sort?: string;
  }): Promise<ApiResponse<UserProfile[]>> {
    const queryParams: any = {};
    
    // Add pagination
    if (params?.page) {
      queryParams.pagination = { page: params.page };
    }
    if (params?.pageSize) {
      if (!queryParams.pagination) queryParams.pagination = {};
      queryParams.pagination.pageSize = params.pageSize;
    }
    
    // Add populate
    if (params?.populate !== undefined) {
      queryParams.populate = params.populate;
    }
    
    // Add sort
    if (params?.sort) {
      queryParams.sort = params.sort;
    }
    
    // Add filters
    if (params?.filters) {
      queryParams.filters = params.filters;
    }
    
    const queryString = this.formatQueryString(queryParams);
    
    const url = queryString ? `/user-profiles?${queryString}` : '/user-profiles';
    return await this.request<ApiResponse<UserProfile[]>>(url);
  }

  async getUserProfile(id: string, populate?: string | string[] | Record<string, any>): Promise<ApiResponse<UserProfile>> {
    const queryParams: any = {};
    
    if (populate !== undefined) {
      queryParams.populate = populate;
    }
    
    const queryString = this.formatQueryString(queryParams);
    
    const url = queryString ? `/user-profiles/${id}?${queryString}` : `/user-profiles/${id}`;
    return await this.request<ApiResponse<UserProfile>>(url);
  }

  async createUserProfile(data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    dateOfBirth?: string;
    phone?: string;
    address?: string;
    isInstructor?: boolean;
    instructorBio?: string;
    expertise?: any;
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    learningGoals?: string;
    interests?: any;
    socialLinks?: any;
    user?: number;
  }): Promise<ApiResponse<UserProfile>> {
    return await this.request<ApiResponse<UserProfile>>('/user-profiles', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async updateUserProfile(id: string, data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    dateOfBirth?: string;
    phone?: string;
    address?: string;
    isInstructor?: boolean;
    instructorBio?: string;
    expertise?: any;
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    learningGoals?: string;
    interests?: any;
    socialLinks?: any;
    user?: number;
  }): Promise<ApiResponse<UserProfile>> {
    return await this.request<ApiResponse<UserProfile>>(`/user-profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async deleteUserProfile(id: string): Promise<void> {
    await this.makeRequest(`/user-profiles/${id}`, {
      method: 'DELETE',
    });
  }

  // Course methods
  async getCourses(params: {
    page?: number;
    pageSize?: number;
    populate?: string | string[] | Record<string, any>;
    filters?: Record<string, any>;
    sort?: string;
  } = {}): Promise<ApiResponse<Course[]>> {
    const queryParams: any = {};
    
    // Add pagination
    if (params.page) {
      queryParams.pagination = { page: params.page };
    }
    if (params.pageSize) {
      if (!queryParams.pagination) queryParams.pagination = {};
      queryParams.pagination.pageSize = params.pageSize;
    }
    
    // Add populate
    if (params.populate !== undefined) {
      queryParams.populate = params.populate;
    }
    
    // Add sort
    if (params.sort) {
      queryParams.sort = params.sort;
    }
    
    // Add filters
    if (params.filters) {
      queryParams.filters = params.filters;
    }

    // Use qs to serialize the entire query object
    const queryString = this.formatQueryString(queryParams);
    debugger;
    console.log("log request here", `/courses?${queryString}`)
    return await this.request<ApiResponse<Course[]>>(`/courses?${queryString}`);
  }

  async getCourse(id: string, populate?: string | string[] | Record<string, any>): Promise<ApiResponse<Course>> {
    const queryParams: any = {};
    
    if (populate !== undefined) {
      queryParams.populate = populate;
    }
    
    const queryString = this.formatQueryString(queryParams);
    const url = queryString ? `/courses/${id}?${queryString}` : `/courses/${id}`;
    
    console.log('🔍 API: GET', url);
    return await this.request<ApiResponse<Course>>(url);
  }

  async getFeaturedCourses(): Promise<ApiResponse<Course[]>> {
    return await this.request<ApiResponse<Course[]>>('/courses/featured');
  }

  async searchCourses(query: string, populate?: string | string[] | Record<string, any>): Promise<ApiResponse<Course[]>> {
    const queryParams: any = {
      query: query
    };
    
    if (populate !== undefined) {
      queryParams.populate = populate;
    }
    
    const queryString = this.formatQueryString(queryParams);
    
    return await this.request<ApiResponse<Course[]>>(`/courses/search?${queryString}`);
  }

  async getCoursesByCategory(categoryId: string): Promise<ApiResponse<Course[]>> {
    return await this.request<ApiResponse<Course[]>>(`/courses/category/${categoryId}`);
  }

  async getCourseStats(id: string): Promise<{ data: { enrollmentCount: number; reviewCount: number; lessonCount: number; rating: number; completionRate: number } }> {
    return await this.makeRequest(`/courses/${id}/stats`);
  }

  // Instructor-only course methods
  async createCourse(courseData: {
    title: string;
    description: string;
    shortDescription?: string;
    price: number;
    isFree?: boolean;
    isPremium?: boolean;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    objectives?: string;
    prerequisites?: string;
    category?: number;
    tags?: number[];
  }): Promise<ApiResponse<Course>> {
    return await this.request<ApiResponse<Course>>('/courses', {
      method: 'POST',
      body: JSON.stringify({ data: courseData }),
    });
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<ApiResponse<Course>> {
    return await this.request<ApiResponse<Course>>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data: courseData }),
    });
  }

  async deleteCourse(id: string): Promise<void> {
    await this.makeRequest(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // Lesson methods
  async getLessons(params?: {
    page?: number;
    pageSize?: number;
    populate?: string | string[] | Record<string, any>;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<Lesson[]>> {
    const queryParams: any = {};
    
    // Add pagination
    if (params?.page) {
      queryParams.pagination = { page: params.page };
    }
    if (params?.pageSize) {
      if (!queryParams.pagination) queryParams.pagination = {};
      queryParams.pagination.pageSize = params.pageSize;
    }
    
    // Add populate
    if (params?.populate !== undefined) {
      queryParams.populate = params.populate;
    }
    
    // Handle filters
    if (params?.filters) {
      for (const [entity, entityFilters] of Object.entries(params.filters)) {
        if (typeof entityFilters === 'object' && entityFilters !== null) {
          for (const [field, fieldFilter] of Object.entries(entityFilters)) {
            if (typeof fieldFilter === 'object' && fieldFilter !== null && '$eq' in fieldFilter) {
              queryParams[`filters[${entity}][${field}]`] = [fieldFilter.$eq];
            } else {
              queryParams[`filters[${entity}][${field}]`] = Array.isArray(fieldFilter) ? fieldFilter : [fieldFilter];
            }
          }
        }
      }
    }

    const queryString = this.formatQueryString(queryParams);
    const url = queryString ? `/lessons?${queryString}` : '/lessons';
    
    console.log('🔍 API: GET', url);
    return await this.request<ApiResponse<Lesson[]>>(url);
  }

  async getLesson(id: string, populate?: string | string[] | Record<string, any>): Promise<ApiResponse<Lesson>> {
    const queryParams: any = {};
    
    if (populate !== undefined) {
      queryParams.populate = populate;
    }
    
    const queryString = this.formatQueryString(queryParams);
    const url = queryString ? `/lessons/${id}?${queryString}` : `/lessons/${id}`;
    
    console.log('🔍 API: GET', url);
    return await this.request<ApiResponse<Lesson>>(url);
  }

  async createLesson(lessonData: {
    title: string;
    description?: string;
    content?: string;
    videoUrl?: string;
    duration: number;
    sortOrder?: number;
    isPreview?: boolean;
    lessonType?: 'video' | 'reading' | 'assignment' | 'quiz';
    course: string;
  }): Promise<ApiResponse<Lesson>> {
    console.log('📝 Creating lesson:', JSON.stringify(lessonData, null, 2));
    return await this.request<ApiResponse<Lesson>>('/lessons', {
      method: 'POST',
      body: JSON.stringify({ data: lessonData }),
    });
  }

  async updateLesson(id: string, lessonData: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
    return await this.request<ApiResponse<Lesson>>(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data: lessonData }),
    });
  }

  async deleteLesson(id: string): Promise<void> {
    await this.makeRequest(`/lessons/${id}`, {
      method: 'DELETE',
    });
  }

  // Enrollment methods
  async getEnrollments(params?: {
    page?: number;
    pageSize?: number;
    populate?: string | string[] | Record<string, any>;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<Enrollment[]>> {
    const queryParams: any = {};
    
    // Add pagination
    if (params?.page) {
      queryParams.pagination = { page: params.page };
    }
    if (params?.pageSize) {
      if (!queryParams.pagination) queryParams.pagination = {};
      queryParams.pagination.pageSize = params.pageSize;
    }
    
    // Add populate with Strapi v5 formatting
    if (params?.populate !== undefined) {
      queryParams.populate = this.formatPopulateForStrapiV5(params.populate);
    }
    
    // Handle filters - convert nested format to Strapi v5 format
    if (params?.filters) {
      // Convert nested filter format to flat format for Strapi v5
      // Example: { student: { id: { $eq: 10 } } } becomes { 'filters[student][id]': [10] }
      for (const [entity, entityFilters] of Object.entries(params.filters)) {
        if (typeof entityFilters === 'object' && entityFilters !== null) {
          for (const [field, fieldFilter] of Object.entries(entityFilters)) {
            if (typeof fieldFilter === 'object' && fieldFilter !== null && '$eq' in fieldFilter) {
              // Convert $eq format to array format for Strapi v5
              queryParams[`filters[${entity}][${field}]`] = [fieldFilter.$eq];
            } else {
              // Direct value assignment
              queryParams[`filters[${entity}][${field}]`] = Array.isArray(fieldFilter) ? fieldFilter : [fieldFilter];
            }
          }
        }
      }
    }

    // Use qs to serialize with brackets format
    const queryString = this.formatQueryString(queryParams);

    console.log('🔍 API: GET', `/enrollments?${queryString}`);
    return await this.request<ApiResponse<Enrollment[]>>(`/enrollments?${queryString}`);
  }

  async getEnrollment(id: string, populate?: string | string[] | Record<string, any>): Promise<ApiResponse<Enrollment>> {
    const queryParams: any = {};
    
    if (populate !== undefined) {
      queryParams.populate = populate;
    }
    
    const queryString = this.formatQueryString(queryParams);
    
    const url = queryString ? `/enrollments/${id}?${queryString}` : `/enrollments/${id}`;
    return await this.request<ApiResponse<Enrollment>>(url);
  }

  async enrollInCourse(courseId: number, paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' = 'pending', paymentAmount?: number): Promise<ApiResponse<Enrollment>> {
    // Get current user to associate enrollment with the user
    const currentUser = await this.getCurrentUser();
    
    const enrollmentData: any = {
      student: currentUser.id,  // Associate enrollment with current user
      course: courseId,
      enrollmentDate: new Date().toISOString(),
      progress: 0,
      isCompleted: false,
      paymentStatus,
      certificateIssued: false
    };

    if (paymentAmount !== undefined) {
      enrollmentData.paymentAmount = paymentAmount;
    }

    console.log('🔄 Creating enrollment with data:', enrollmentData);
    return await this.request<ApiResponse<Enrollment>>('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ data: enrollmentData }),
    });
  }

  async updateEnrollment(id: string, data: Partial<Enrollment>): Promise<ApiResponse<Enrollment>> {
    return await this.request<ApiResponse<Enrollment>>(`/enrollments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async markCourseCompleted(enrollmentId: string): Promise<ApiResponse<Enrollment>> {
    return await this.updateEnrollment(enrollmentId, {
      progress: 100,
      isCompleted: true,
      completionDate: new Date().toISOString()
    });
  }

  // Lesson Progress methods
  async getLessonProgress(params?: {
    page?: number;
    pageSize?: number;
    populate?: string | string[] | Record<string, any>;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<LessonProgress[]>> {
    const queryParams: any = {};
    
    // Add pagination
    if (params?.page) {
      queryParams.pagination = { page: params.page };
    }
    if (params?.pageSize) {
      if (!queryParams.pagination) queryParams.pagination = {};
      queryParams.pagination.pageSize = params.pageSize;
    }
    
    // Add populate
    if (params?.populate !== undefined) {
      queryParams.populate = params.populate;
    }
    
    // Add filters
    if (params?.filters) {
      queryParams.filters = params.filters;
    }
    
    const queryString = this.formatQueryString(queryParams);
    
    const url = queryString ? `/lesson-progresses?${queryString}` : '/lesson-progresses';
    return await this.request<ApiResponse<LessonProgress[]>>(url);
  }

  async getLessonProgressById(id: string, populate?: string | string[] | Record<string, any>): Promise<ApiResponse<LessonProgress>> {
    const queryParams: any = {};
    
    if (populate !== undefined) {
      queryParams.populate = populate;
    }
    
    const queryString = this.formatQueryString(queryParams);
    
    const url = queryString ? `/lesson-progresses/${id}?${queryString}` : `/lesson-progresses/${id}`;
    return await this.request<ApiResponse<LessonProgress>>(url);
  }

  async createLessonProgress(data: {
    student: number;
    lesson: number;
    enrollment: number;
    isCompleted?: boolean;
    progressPercentage?: number;
    timeSpent?: number;
    notes?: string;
    lastAccessedAt?: string;
  }): Promise<ApiResponse<LessonProgress>> {
    const progressData = {
      student: data.student,
      lesson: data.lesson,
      enrollment: data.enrollment,
      lastAccessedAt: data.lastAccessedAt || new Date().toISOString(),
      progressPercentage: data.progressPercentage || 0,
      timeSpent: data.timeSpent || 0,
      isCompleted: data.isCompleted || false,
      notes: data.notes || ''
    };

    return await this.request<ApiResponse<LessonProgress>>('/lesson-progresses', {
      method: 'POST',
      body: JSON.stringify({ data: progressData }),
    });
  }

  async updateLessonProgress(id: string, data: Partial<LessonProgress>): Promise<ApiResponse<LessonProgress>> {
    return await this.request<ApiResponse<LessonProgress>>(`/lesson-progresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async markLessonCompleted(progressId: string, timeSpent?: number): Promise<ApiResponse<LessonProgress>> {
    const updateData: any = {
      progressPercentage: 100,
      isCompleted: true,
      completionDate: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    };

    if (timeSpent !== undefined) {
      updateData.timeSpent = timeSpent;
    }

    return await this.updateLessonProgress(progressId, updateData);
  }

  // Course Reviews methods
  async getCourseReviews(params?: {
    page?: number;
    pageSize?: number;
    populate?: string | string[] | Record<string, any>;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<CourseReview[]>> {
    const queryParams: any = {};
    
    // Add pagination
    if (params?.page) {
      queryParams.pagination = { page: params.page };
    }
    if (params?.pageSize) {
      if (!queryParams.pagination) queryParams.pagination = {};
      queryParams.pagination.pageSize = params.pageSize;
    }
    
    // Add populate
    if (params?.populate !== undefined) {
      queryParams.populate = params.populate;
    }
    
    // Add filters
    if (params?.filters) {
      queryParams.filters = params.filters;
    }
    
    const queryString = this.formatQueryString(queryParams);
    
    const url = queryString ? `/course-reviews?${queryString}` : '/course-reviews';
    return await this.request<ApiResponse<CourseReview[]>>(url);
  }

  async getCourseReview(id: string, populate?: string | string[] | Record<string, any>): Promise<ApiResponse<CourseReview>> {
    const queryParams: any = {};
    
    if (populate !== undefined) {
      queryParams.populate = populate;
    }
    
    const queryString = this.formatQueryString(queryParams);
    
    const url = queryString ? `/course-reviews/${id}?${queryString}` : `/course-reviews/${id}`;
    return await this.request<ApiResponse<CourseReview>>(url);
  }

  async createCourseReview(data: {
    student: number;
    course: number;
    rating: number;
    title: string;
    comment: string;
    isPublic?: boolean;
  }): Promise<ApiResponse<CourseReview>> {
    // Format data for Strapi v5 using connect syntax for relations
    const reviewData = {
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      isPublic: data.isPublic !== false, // Default to true
      helpfulCount: 0,
      student: {
        connect: [data.student]
      },
      course: {
        connect: [data.course]
      }
    };

    return await this.request<ApiResponse<CourseReview>>('/course-reviews', {
      method: 'POST',
      body: JSON.stringify({ data: reviewData }),
    });
  }

  async updateCourseReview(id: string, data: Partial<CourseReview>): Promise<ApiResponse<CourseReview>> {
    return await this.request<ApiResponse<CourseReview>>(`/course-reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  // Certificate methods
  async getCertificates(params?: {
    page?: number;
    pageSize?: number;
    populate?: string | string[] | Record<string, any>;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<Certificate[]>> {
    const queryParams: any = {};
    
    // Add pagination
    if (params?.page) {
      queryParams.pagination = { page: params.page };
    }
    if (params?.pageSize) {
      if (!queryParams.pagination) queryParams.pagination = {};
      queryParams.pagination.pageSize = params.pageSize;
    }
    
    // Add populate
    if (params?.populate !== undefined) {
      queryParams.populate = params.populate;
    }
    
    // Add filters
    if (params?.filters) {
      queryParams.filters = params.filters;
    }
    
    const queryString = this.formatQueryString(queryParams);
    
    const url = queryString ? `/certificates?${queryString}` : '/certificates';
    return await this.request<ApiResponse<Certificate[]>>(url);
  }

  async getCertificate(id: string, populate?: string | string[] | Record<string, any>): Promise<ApiResponse<Certificate>> {
    const queryParams: any = {};
    
    if (populate !== undefined) {
      queryParams.populate = populate;
    }
    
    const queryString = this.formatQueryString(queryParams);
    
    const url = queryString ? `/certificates/${id}?${queryString}` : `/certificates/${id}`;
    return await this.request<ApiResponse<Certificate>>(url);
  }

  async createCertificate(data: {
    student: number;
    course: number;
    enrollment: number;
    certificateId: string;
    verificationCode: string;
    issuedDate: string;
    certificateUrl?: string;
    isValid?: boolean;
  }): Promise<ApiResponse<Certificate>> {
    // Format data for Strapi v5 using connect syntax for relations
    const certificateData = {
      certificateId: data.certificateId,
      verificationCode: data.verificationCode,
      issuedDate: data.issuedDate,
      certificateUrl: data.certificateUrl,
      isValid: data.isValid !== false, // Default to true
      student: {
        connect: [data.student]
      },
      course: {
        connect: [data.course]
      },
      enrollment: {
        connect: [data.enrollment]
      }
    };

    return await this.request<ApiResponse<Certificate>>('/certificates', {
      method: 'POST',
      body: JSON.stringify({ data: certificateData }),
    });
  }

  async updateCertificate(id: string, data: Partial<Certificate>): Promise<ApiResponse<Certificate>> {
    return await this.request<ApiResponse<Certificate>>(`/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async verifyCertificate(certificateId: string, verificationCode: string): Promise<ApiResponse<Certificate[]>> {
    return await this.getCertificates({
      filters: {
        certificateId: { $eq: certificateId },
        verificationCode: { $eq: verificationCode },
        isValid: { $eq: true }
      }
    });
  }

  // Category methods
  async getCategories(params?: {
    page?: number;
    pageSize?: number;
    populate?: string | string[] | Record<string, any>;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<CourseCategory[]>> {
    const queryParams: any = {};
    
    // Add pagination
    if (params?.page) {
      queryParams.pagination = { page: params.page };
    }
    if (params?.pageSize) {
      if (!queryParams.pagination) queryParams.pagination = {};
      queryParams.pagination.pageSize = params.pageSize;
    }
    
    // Add populate
    if (params?.populate) {
      queryParams.populate = params.populate;
    }
    
    // Add filters
    if (params?.filters) {
      queryParams.filters = params.filters;
    }

    const query = Object.keys(queryParams).length > 0 ? `?${this.formatQueryString(queryParams)}` : '';
    return await this.request<ApiResponse<CourseCategory[]>>(`/categories${query}`);
  }

  async getCategory(id: string, populate?: string | string[] | Record<string, any>): Promise<ApiResponse<CourseCategory>> {
    const queryParams: any = {};
    if (populate) queryParams.populate = populate;
    const query = Object.keys(queryParams).length > 0 ? `?${this.formatQueryString(queryParams)}` : '';
    return await this.request<ApiResponse<CourseCategory>>(`/categories/${id}${query}`);
  }

  async getTags(params?: {
    page?: number;
    pageSize?: number;
    populate?: string | string[] | Record<string, any>;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<Tag[]>> {
    const queryParams: any = {};
    
    // Add pagination
    if (params?.page) {
      queryParams.pagination = { page: params.page };
    }
    if (params?.pageSize) {
      if (!queryParams.pagination) queryParams.pagination = {};
      queryParams.pagination.pageSize = params.pageSize;
    }
    
    // Add populate
    if (params?.populate) {
      queryParams.populate = params.populate;
    }
    
    // Add filters
    if (params?.filters) {
      queryParams.filters = params.filters;
    }

    const query = Object.keys(queryParams).length > 0 ? `?${this.formatQueryString(queryParams)}` : '';
    return await this.request<ApiResponse<Tag[]>>(`/tags${query}`);
  }

  async getTag(id: string, populate?: string | string[] | Record<string, any>): Promise<ApiResponse<Tag>> {
    const queryParams: any = {};
    if (populate) queryParams.populate = populate;
    const query = Object.keys(queryParams).length > 0 ? `?${this.formatQueryString(queryParams)}` : '';
    return await this.request<ApiResponse<Tag>>(`/tags/${id}${query}`);
  }

  // Public request method for external services
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, options);
  }

  // Public request method without authentication for external services
  async publicRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // For now, just use makeRequest - we can add a separate public method later if needed
    return this.makeRequest<T>(endpoint, options);
  }

  // File upload method
  async uploadFile(formData: FormData): Promise<any> {
    const url = `${this.baseURL}/api/upload`;
    
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    console.log('🔄 API Client: Uploading file');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: AbortSignal.timeout(30000), // 30 second timeout for file uploads
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ File upload error:', errorText);
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ File uploaded successfully');
      return data;
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw error;
    }
  }

  // Set token manually (for cases where token is obtained elsewhere)
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private handleUnauthorized(): void {
    // Clear the token and localStorage
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      
      // Trigger custom logout event for components to listen to
      window.dispatchEvent(new CustomEvent('auth-logout', { 
        detail: { reason: 'unauthorized' } 
      }));
      
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/auth/')) {
        console.log('🔄 API: Redirecting to login page due to 401');
        window.location.href = '/auth/login?reason=session-expired';
      }
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
