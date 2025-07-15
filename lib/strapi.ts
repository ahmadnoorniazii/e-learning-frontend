import qs from 'qs';

interface StrapiResponse<T> {
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

interface StrapiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  role?: {
    id: number;
    name: string; // 'authenticated', 'student', 'instructor', 'admin'
    description: string;
    type: string;
  };
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: {
      url: string;
    };
  };
}

interface StrapiAuthResponse {
  jwt: string;
  user: StrapiUser;
}

export interface StrapiCourse {
  id: number;
  attributes: {
    title: string;
    description: string;
    price: number;
    category: string;
    level: string;
    publicationStatus: string;
    duration: number;
    studentsCount: number;
    rating: number;
    reviewsCount: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    thumbnail?: {
      data?: {
        attributes: {
          url: string;
        };
      };
    };
    instructor?: {
      data?: {
        id: number;
        attributes: {
          username: string;
          email: string;
          profile?: {
            avatar?: {
              url: string;
            };
          };
        };
      };
    };
    lessons?: {
      data?: Array<{
        id: number;
        attributes: {
          title: string;
          description: string;
          duration: number;
          order: number;
          videoUrl?: string;
        };
      }>;
    };
  };
}

interface StrapiOrder {
  id: number;
  attributes: {
    amount: number;
    orderStatus: string;
    paymentMethod: string;
    createdAt: string;
    user?: {
      data?: {
        attributes: {
          username: string;
          email: string;
        };
      };
    };
    course?: {
      data?: {
        attributes: {
          title: string;
        };
      };
    };
  };
}

interface StrapiReview {
  id: number;
  attributes: {
    rating: number;
    comment: string;
    reviewStatus: string;
    createdAt: string;
    user?: {
      data?: {
        attributes: {
          username: string;
          email: string;
          profile?: {
            avatar?: {
              url: string;
            };
          };
        };
      };
    };
    course?: {
      data?: {
        attributes: {
          title: string;
        };
      };
    };
  };
}

interface StrapiCertificate {
  id: number;
  attributes: {
    certificateId: string;
    issuedAt: string;
    certificateStatus: string;
    certificateUrl?: string;
    user?: {
      data?: {
        attributes: {
          username: string;
          email: string;
        };
      };
    };
    course?: {
      data?: {
        id: number;
        attributes: {
          title: string;
        };
      };
    };
  };
}

interface StrapiLessonProgress {
  id: number;
  attributes: {
    student?: {
      data?: {
        id: number;
      };
    };
    lesson?: {
      data?: {
        id: number;
      };
    };
    enrollment?: {
      data?: {
        id: number;
      };
    };
    isCompleted: boolean;
    completionDate?: string;
    timeSpent?: number;
    progressPercentage: number;
    lastAccessedAt?: string;
    notes?: string;
  };
}

interface StrapiProgress {
  id: number;
  attributes: {
    completedLessons: string[];
    percentage: number;
    progress?: number;  // Alternative field name from enrollment
    lastAccessed: string;
    updatedAt?: string;  // From Strapi's metadata
    createdAt?: string;  // From Strapi's metadata
    student?: {
      data?: {
        id: number;
      };
    };
    course?: {
      data?: {
        id: number;
      };
    };
  };
}

interface StrapiEnrollment {
  id: number;
  attributes: {
    enrolledAt?: string;
    enrollmentDate?: string;
    enrollmentStatus?: string;
    status?: string;
    progress?: number;
    isCompleted?: boolean;
    paymentStatus?: string;
    paymentAmount?: number;
    completionDate?: string;
    certificateIssued?: boolean;
    createdAt?: string;
    updatedAt?: string;
    lessonProgress?: {
      data?: Array<{
        id: number;
        attributes: {
          isCompleted: boolean;
          progressPercentage: number;
          lesson: {
            data: {
              id: number;
            }
          }
        }
      }>
    };
    user?: {
      data?: {
        id: number;
        attributes: {
          username: string;
          email: string;
        };
      };
    };
    student?: {
      data?: {
        id: number;
        attributes: {
          username: string;
          email: string;
        };
      };
    };
    course?: {
      data?: {
        id: number;
        attributes: {
          title: string;
        };
      };
    };
  };
}

// Add this interface after the StrapiEnrollment interface (around line 245)

interface EnrollmentCreateData {
  student: string | number;  // User ID of the student
  course: string | number;   // Course ID
  enrollmentDate: string;    // ISO date string
  progress?: number;         // Default: 0
  isCompleted?: boolean;     // Default: false
  paymentStatus?: string;    // "completed", "pending", etc.
  paymentAmount?: number;    // Course price
}

class StrapiAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('strapi-token');
    }
    
    console.log('🔧 Strapi API initialized with base URL:', this.baseURL);
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

  private async request<T>(
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

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    console.log(`🔄 Strapi API: ${options.method || 'GET'} ${endpoint}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        // Add timeout and better error handling
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorData: StrapiError;
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
        
        console.error('❌ Strapi API Error:', errorData);
        throw new Error(errorData.error.message || 'API request failed');
      }

      if (!responseText) {
        return {} as T;
      }

      const data = JSON.parse(responseText);
      console.log('✅ Strapi API: Request successful');
      return data;
    } catch (error: any) {
      console.error('❌ Strapi API: Request failed:', error);
      
      // Handle specific error types
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new Error('Request timeout - please check if Strapi server is running');
      }
      
      if (error.message?.includes('fetch')) {
        throw new Error('Unable to connect to Strapi server - please ensure it is running at ' + this.baseURL);
      }
      
      throw error;
    }
  }

  private async publicRequest<T>(
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

    // Don't add authorization header for public requests

    console.log(`🔄 Strapi Public API: ${options.method || 'GET'} ${endpoint}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        // Add timeout and better error handling
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorData: StrapiError;
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
        
        console.error('❌ Strapi Public API Error:', errorData);
        throw new Error(errorData.error.message || 'API request failed');
      }

      if (!responseText) {
        return {} as T;
      }

      const data = JSON.parse(responseText);
      console.log('✅ Strapi Public API: Request successful');
      return data;
    } catch (error: any) {
      console.error('❌ Strapi Public API: Request failed:', error);
      
      // Handle specific error types
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new Error('Request timeout - please check if Strapi server is running');
      }
      
      if (error.message?.includes('fetch')) {
        throw new Error('Unable to connect to Strapi server - please ensure it is running at ' + this.baseURL);
      }
      
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<StrapiAuthResponse> {
    const response = await this.request<StrapiAuthResponse>('/auth/local', {
      method: 'POST',
      body: JSON.stringify({
        identifier: email,
        password,
      }),
    });

    this.token = response.jwt;
    if (typeof window !== 'undefined') {
      localStorage.setItem('strapi-token', response.jwt);
    }

    // Try to get user with role information
    try {
      const userWithRole = await this.getCurrentUser();
      if (userWithRole && userWithRole.role) {
        response.user = userWithRole;
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch user role information:', error);
      // Continue with basic user data
    }

    return response;
  }

  async register(email: string, password: string, username: string): Promise<StrapiAuthResponse> {
    const response = await this.request<StrapiAuthResponse>('/auth/local/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    this.token = response.jwt;
    if (typeof window !== 'undefined') {
      localStorage.setItem('strapi-token', response.jwt);
    }

    return response;
  }

  // Role-based registration method using standard auth/local/register endpoint
  async registerWithRole(email: string, password: string, username: string, role: 'student' | 'instructor' | 'admin'): Promise<StrapiAuthResponse> {
    // First, register the user with the standard endpoint
    const response = await this.request<StrapiAuthResponse>('/auth/local/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    this.token = response.jwt;
    if (typeof window !== 'undefined') {
      localStorage.setItem('strapi-token', response.jwt);
    }

    // Note: Role assignment would need to be handled separately
    // The standard Strapi registration assigns the default authenticated role
    console.log(`User registered with standard endpoint. Role '${role}' would need separate assignment.`);

    return response;

    return response;
  }

  async getCurrentUser(): Promise<StrapiUser> {
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    return await this.request<StrapiUser>('/users/me?populate=role,profile.avatar');
  }

  logout(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('strapi-token');
    }
  }

  // User management methods
  async getUsers(params: {
    page?: number;
    pageSize?: number;
    filters?: any;
  } = {}): Promise<StrapiResponse<StrapiUser[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('pagination[page]', params.page.toString());
    if (params.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());
    
    searchParams.append('populate', 'role,profile.avatar');

    return await this.request<StrapiResponse<StrapiUser[]>>(`/users?${searchParams.toString()}`);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Course management methods
  async getCourses(params: {
    page?: number;
    pageSize?: number;
    filters?: any;
  } = {}): Promise<StrapiResponse<StrapiCourse[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('pagination[page]', params.page.toString());
    if (params.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());
    
    // Add filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(`filters[${key}][$eq]`, value.toString());
        }
      });
    }

    searchParams.append('populate', 'thumbnail,instructor.profile.avatar,lessons');

    return await this.request<StrapiResponse<StrapiCourse[]>>(`/courses?${searchParams.toString()}`);
  }

  // Public course methods (no authentication required)
  async getPublicCourses(params: {
    page?: number;
    pageSize?: number;
    filters?: any;
  } = {}): Promise<StrapiResponse<StrapiCourse[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('pagination[page]', params.page.toString());
    if (params.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());
    
    // Add filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(`filters[${key}][$eq]`, value.toString());
        }
      });
    }

    searchParams.append('populate', 'thumbnail,instructor.profile.avatar,lessons');

    return await this.publicRequest<StrapiResponse<StrapiCourse[]>>(`/courses?${searchParams.toString()}`);
  }

  async getCourseById(id: string, populate: string = 'thumbnail,instructor.profile.avatar,lessons'): Promise<StrapiResponse<StrapiCourse>> {
    try {
      // Convert populate string to array format for Strapi v5
      const populateArray = populate.split(',');
      const queryParams = {
        populate: populateArray
      };
      
      const queryString = this.formatQueryString(queryParams);
      
      console.log(`🔍 Getting course by ID: ${id} with query: ${queryString}`);
      
      return await this.request<StrapiResponse<StrapiCourse>>(
        `/courses/${id}?${queryString}`
      );
    } catch (error) {
      console.error(`Error fetching course with ID ${id}:`, error);
      throw new Error('Failed to fetch course details. Please check the API or population parameters.');
    }
  }

  async getPublicCourseById(id: string, populate: string = 'thumbnail,instructor.profile.avatar,lessons'): Promise<StrapiResponse<StrapiCourse>> {
    try {
      // Convert populate string to array format for Strapi v5
      const populateArray = populate.split(',');
      const queryParams = {
        populate: populateArray
      };
      
      const queryString = this.formatQueryString(queryParams);
      
      console.log(`🔍 Getting public course by ID: ${id} with query: ${queryString}`);
      
      return await this.publicRequest<StrapiResponse<StrapiCourse>>(
        `/courses/${id}?${queryString}`
      );
    } catch (error) {
      console.error(`Error fetching course with ID ${id}:`, error);
      throw new Error('Failed to fetch course details. Please check the API or population parameters.');
    }
  }

  async createCourse(courseData: any): Promise<StrapiResponse<StrapiCourse>> {
    return await this.request<StrapiResponse<StrapiCourse>>('/courses', {
      method: 'POST',
      body: JSON.stringify({ data: courseData }),
    });
  }

  async updateCourse(id: string, courseData: any): Promise<StrapiResponse<StrapiCourse>> {
    return await this.request<StrapiResponse<StrapiCourse>>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data: courseData }),
    });
  }

  async deleteCourse(id: string): Promise<void> {
    await this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  async getCoursesByInstructor(instructorId: number | string, params: {
    page?: number;
    pageSize?: number;
  } = {}): Promise<StrapiResponse<StrapiCourse[]>> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('pagination[page]', params.page.toString());
    if (params.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());

    // Updated filtering format - use documentId for instructor filtering
    searchParams.append('filters[instructor][documentId][$eq]', instructorId.toString());
    searchParams.append('populate', 'thumbnail,instructor.profile.avatar,lessons');

    return await this.request<StrapiResponse<StrapiCourse[]>>(`/courses?${searchParams.toString()}`);
  }

  // Order management methods
  async getOrders(params: {
    page?: number;
    pageSize?: number;
    filters?: any;
  } = {}): Promise<StrapiResponse<StrapiOrder[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('pagination[page]', params.page.toString());
    if (params.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(`filters[${key}][$eq]`, value.toString());
        }
      });
    }

    searchParams.append('populate', 'user,course');

    return await this.request<StrapiResponse<StrapiOrder[]>>(`/orders?${searchParams.toString()}`);
  }

  async createOrder(orderData: any): Promise<StrapiResponse<StrapiOrder>> {
    console.log('📝 Creating order (MOCK):', JSON.stringify(orderData, null, 2));
    console.warn('⚠️ The /orders endpoint is not available in the current API. Order creation is being mocked.');
    
    // Return a mock response since the endpoint is not available
    return {
      data: {
        id: Math.floor(Math.random() * 1000) + 1,
        attributes: {
          ...orderData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    };
    
    // If the endpoint becomes available in the future, uncomment this code:
    /*
    return await this.request<StrapiResponse<StrapiOrder>>('/orders', {
      method: 'POST',
      body: JSON.stringify({ data: orderData }),
    });
    */
  }

  // Review management methods
  async getReviews(params: {
    page?: number;
    pageSize?: number;
    courseId?: string;
    userId?: string;
  } = {}): Promise<StrapiResponse<StrapiReview[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('pagination[page]', params.page.toString());
    if (params.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());
    
    if (params.courseId) {
      searchParams.append('filters[course][documentId][$eq]', params.courseId);
    }
    if (params.userId) {
      searchParams.append('filters[user][documentId][$eq]', params.userId);
    }

    searchParams.append('populate', 'user.profile.avatar,course');

    return await this.request<StrapiResponse<StrapiReview[]>>(`/reviews?${searchParams.toString()}`);
  }

  async createReview(reviewData: any): Promise<StrapiResponse<StrapiReview>> {
    return await this.request<StrapiResponse<StrapiReview>>('/reviews', {
      method: 'POST',
      body: JSON.stringify({ data: reviewData }),
    });
  }

  async updateReview(id: string, reviewData: any): Promise<StrapiResponse<StrapiReview>> {
    return await this.request<StrapiResponse<StrapiReview>>(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data: reviewData }),
    });
  }

  async deleteReview(id: string): Promise<void> {
    await this.request(`/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  // Certificate management methods
  async getCertificates(params: {
    page?: number;
    pageSize?: number;
    userId?: string;
  } = {}): Promise<StrapiResponse<StrapiCertificate[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('pagination[page]', params.page.toString());
    if (params.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());
    
    if (params.userId) {
      searchParams.append('filters[user][id][$eq]', params.userId);
    }

    searchParams.append('populate', 'user,course');

    return await this.request<StrapiResponse<StrapiCertificate[]>>(`/certificates?${searchParams.toString()}`);
  }

  async createCertificate(certificateData: any): Promise<StrapiResponse<StrapiCertificate>> {
    return await this.request<StrapiResponse<StrapiCertificate>>('/certificates', {
      method: 'POST',
      body: JSON.stringify({ data: certificateData }),
    });
  }

  // Progress management methods
  async getProgress(userId: string, courseId?: string): Promise<StrapiResponse<StrapiProgress[]>> {
    console.log(`🔍 Getting progress for user ${userId} and course ${courseId}`);
    
    // First try to get the numeric ID for the course if it's a document ID
    let numericCourseId = courseId;
    if (courseId && !(/^\d+$/.test(courseId))) {
      try {
        // If courseId is not a number, it's likely a document ID - try to get the numeric ID
        const courseResponse = await this.getCourseById(courseId, 'id');
        if (courseResponse.data) {
          numericCourseId = courseResponse.data.id.toString();
          console.log(`📋 Converted document ID ${courseId} to numeric ID ${numericCourseId}`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not convert document ID ${courseId} to numeric ID`, error);
        // Continue with the original ID
      }
    }
    
    // According to the API documentation, progress is tracked via enrollments
    try {
      // Get enrollments for this student and course
      const enrollmentResponse = await this.getEnrollments({
        userId,
        courseId: numericCourseId
      });
      
      if (enrollmentResponse.data && enrollmentResponse.data.length > 0) {
        // Transform enrollment data to match the expected progress format
        const progressData = enrollmentResponse.data.map(enrollment => {
          return {
            id: enrollment.id,
            attributes: {
              student: enrollment.attributes.student,
              course: enrollment.attributes.course,
              // Map from enrollment fields to progress fields
              completedLessons: enrollment.attributes.lessonProgress?.data?.map((lp: any) => 
                lp.attributes?.isCompleted ? lp.attributes.lesson?.data?.id?.toString() : null
              ).filter(Boolean) || [],
              percentage: enrollment.attributes.progress || 0,
              progress: enrollment.attributes.progress || 0,
              lastAccessed: enrollment.attributes.updatedAt || new Date().toISOString(),
              createdAt: enrollment.attributes.createdAt || new Date().toISOString(),
              updatedAt: enrollment.attributes.updatedAt || new Date().toISOString()
            }
          };
        });
        
        console.log('✅ Transformed enrollment data to progress format');
        return {
          data: progressData,
          meta: enrollmentResponse.meta
        };
      } else {
        console.log('⚠️ No enrollments found for this student and course');
        return { data: [] };
      }
    } catch (error) {
      console.error('❌ Error getting progress from enrollments:', error);
      console.warn('⚠️ Returning empty progress data');
      return { data: [] };
    }
  }

  async createProgress(progressData: {
    student: string | number;
    course: string | number;
    completedLessons: string[];
    percentage: number;
    lastAccessed: string;
  }): Promise<StrapiResponse<StrapiProgress>> {
    console.log('📝 Creating course progress:', JSON.stringify(progressData, null, 2));
    
    // According to the API documentation, progress is tracked via the enrollment record
    // First, find the enrollment record for this student and course
    try {
      // Convert course ID if it's a document ID
      let numericCourseId = progressData.course.toString();
      if (!(/^\d+$/.test(numericCourseId))) {
        try {
          // If course ID is not a number, it's likely a document ID - try to get the numeric ID
          const courseResponse = await this.getCourseById(numericCourseId, 'id');
          if (courseResponse.data) {
            numericCourseId = courseResponse.data.id.toString();
            console.log(`📋 Converted document ID ${progressData.course} to numeric ID ${numericCourseId}`);
            progressData = {
              ...progressData,
              course: numericCourseId
            };
          }
        } catch (error) {
          console.warn(`⚠️ Could not convert document ID ${progressData.course} to numeric ID`, error);
          // Continue with the original ID
        }
      }
      
      // Find the enrollment for this student and course
      const enrollmentResponse = await this.getEnrollments({
        userId: progressData.student.toString(),
        courseId: numericCourseId
      });
      
      if (enrollmentResponse.data && enrollmentResponse.data.length > 0) {
        const enrollmentId = enrollmentResponse.data[0].id;
        
        // Update the enrollment with progress information
        const updateResponse = await this.updateEnrollment(enrollmentId, {
          progress: progressData.percentage,
          // Map other fields as needed
          lastAccessed: progressData.lastAccessed
        });
        
        console.log('✅ Updated enrollment with progress information');
        return {
          data: {
            id: enrollmentId,
            attributes: {
              student: { data: { id: Number(progressData.student) } },
              course: { data: { id: Number(numericCourseId) } },
              completedLessons: progressData.completedLessons,
              percentage: progressData.percentage,
              progress: progressData.percentage, // Add progress field to match enrollment schema
              lastAccessed: progressData.lastAccessed,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        };
      } else {
        throw new Error('No enrollment found for this student and course');
      }
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      throw error;
    }
  }

  async updateProgress(id: string, progressData: {
    completedLessons?: string[];
    percentage?: number;
    lastAccessed?: string;
  }): Promise<StrapiResponse<StrapiProgress>> {
    console.log('📝 Updating course progress:', id, JSON.stringify(progressData, null, 2));
    
    // According to the API documentation, progress is tracked via the enrollment record
    try {
      // Update the enrollment with the progress information
      const updateResponse = await this.updateEnrollment(id, {
        progress: progressData.percentage,
        // Other fields as needed
        lastAccessed: progressData.lastAccessed
      });
      
      console.log('✅ Updated enrollment with progress information');
      return {
        data: {
          id: Number(id),
          attributes: {
            completedLessons: progressData.completedLessons || [],
            percentage: progressData.percentage || 0,
            progress: progressData.percentage || 0,
            lastAccessed: progressData.lastAccessed || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      };
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      throw error;
    }
  }

  // Enrollment management methods
  async getEnrollments(params: {
    userId?: string;
    courseId?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<StrapiResponse<StrapiEnrollment[]>> {
    const queryParams: any = {};
    
    if (params.page) queryParams['pagination[page]'] = params.page;
    if (params.pageSize) queryParams['pagination[pageSize]'] = params.pageSize;
    
    // Try different possible field names for Strapi v5 enrollment schema
    if (params.userId) {
      // Try the most common field names
      queryParams['filters[student][id][$eq]'] = params.userId;
    }
    if (params.courseId) {
      queryParams['filters[course][id][$eq]'] = params.courseId;
    }

    // Use Strapi v5 array format for populate
    queryParams.populate = ['student', 'course'];

    // Use qs.stringify for proper Strapi parameter encoding
    const queryString = this.formatQueryString(queryParams);

    console.log('🔍 Enrollment query:', {
      queryParams,
      queryString,
      url: `/enrollments?${queryString}`
    });

    try {
      return await this.request<StrapiResponse<StrapiEnrollment[]>>(`/enrollments?${queryString}`);
    } catch (error: any) {
      console.error('❌ Enrollment API error:', error);
      
      // If we get a validation error about the field name, try alternative field names
      if (error?.message?.includes('Invalid key') || error?.error?.message?.includes('Invalid key')) {
        console.log('🔄 Trying alternative enrollment field names...');
        
        const alternativeQueryParams: any = { ...queryParams };
        
        // Try with 'user' instead of 'student'
        if (params.userId) {
          delete alternativeQueryParams['filters[student][id][$eq]'];
          alternativeQueryParams['filters[user][id][$eq]'] = params.userId;
        }
        
        // Update populate as well
        alternativeQueryParams.populate = ['user', 'course'];
        
        const alternativeQueryString = this.formatQueryString(alternativeQueryParams);
        
        console.log('🔄 Trying alternative query:', alternativeQueryString);
        
        try {
          return await this.request<StrapiResponse<StrapiEnrollment[]>>(`/enrollments?${alternativeQueryString}`);
        } catch (secondError: any) {
          console.error('❌ Alternative enrollment query also failed:', secondError);
          
          // Try with direct ID fields (no relationship)
          const directQueryParams: any = {};
          if (params.page) directQueryParams['pagination[page]'] = params.page;
          if (params.pageSize) directQueryParams['pagination[pageSize]'] = params.pageSize;
          
          if (params.userId) {
            directQueryParams['filters[userId][$eq]'] = params.userId;
          }
          if (params.courseId) {
            directQueryParams['filters[courseId][$eq]'] = params.courseId;
          }
          
          const directQueryString = this.formatQueryString(directQueryParams);
          
          console.log('🔄 Trying direct ID fields:', directQueryString);
          return await this.request<StrapiResponse<StrapiEnrollment[]>>(`/enrollments?${directQueryString}`);
        }
      }
      
      throw error;
    }
  }

  async createEnrollment(enrollmentData: EnrollmentCreateData): Promise<StrapiResponse<StrapiEnrollment>> {
    console.log('📝 Creating enrollment:', JSON.stringify(enrollmentData, null, 2));
    return await this.request<StrapiResponse<StrapiEnrollment>>('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ data: enrollmentData }),
    });
  }
  
  async updateEnrollment(enrollmentId: string | number, updateData: any): Promise<StrapiResponse<StrapiEnrollment>> {
    console.log(`📝 Updating enrollment ${enrollmentId}:`, JSON.stringify(updateData, null, 2));
    return await this.request<StrapiResponse<StrapiEnrollment>>(`/enrollments/${enrollmentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data: updateData }),
    });
  }

  // Analytics methods
  async getAnalytics(): Promise<any> {
    try {
      return await this.request('/analytics/dashboard');
    } catch (error) {
      console.warn('Analytics endpoint not available, using fallback data');
      return {
        totalUsers: 0,
        activeCourses: 0,
        totalRevenue: 0,
        totalEnrollments: 0
      };
    }
  }

  async getRevenueAnalytics(timeRange: string): Promise<any> {
    try {
      return await this.request(`/analytics/revenue?timeRange=${timeRange}`);
    } catch (error) {
      console.warn('Revenue analytics endpoint not available');
      return { monthlyData: [] };
    }
  }

  async getUserAnalytics(timeRange: string): Promise<any> {
    try {
      return await this.request(`/analytics/users?timeRange=${timeRange}`);
    } catch (error) {
      console.warn('User analytics endpoint not available');
      return { growthData: [] };
    }
  }

  async getCourseAnalytics(timeRange: string): Promise<any> {
    try {
      return await this.request(`/analytics/courses?timeRange=${timeRange}`);
    } catch (error) {
      console.warn('Course analytics endpoint not available');
      return { categoryDistribution: [], topCourses: [] };
    }
  }

  async createLesson(lessonData: any): Promise<StrapiResponse<{ id: number }>> {
    return await this.request<StrapiResponse<{ id: number }>>('/lessons', {
      method: 'POST',
      body: JSON.stringify({ data: lessonData }),
    });
  }

  // Get detailed enrollments for a user with course details
  async getUserEnrollmentsWithCourses(userId: string): Promise<StrapiResponse<StrapiEnrollment[]>> {
    const queryParams: any = {
      'filters[student][id][$eq]': userId,
      'populate': ['course.thumbnail', 'course.instructor.profile.avatar']
    };
    
    const queryString = this.formatQueryString(queryParams);
    
    console.log('🔍 Getting user enrollments with course details:', queryString);
    
    try {
      return await this.request<StrapiResponse<StrapiEnrollment[]>>(`/enrollments?${queryString}`);
    } catch (error) {
      console.error('❌ Error getting user enrollments with courses:', error);
      
      // Try with 'user' instead of 'student'
      const altQueryParams: any = {
        'filters[user][id][$eq]': userId,
        'populate': ['course.thumbnail', 'course.instructor.profile.avatar']
      };
      
      const altQueryString = this.formatQueryString(altQueryParams);
      
      return await this.request<StrapiResponse<StrapiEnrollment[]>>(`/enrollments?${altQueryString}`);
    }
  }

  // Lesson Progress methods
  async getLessonProgress(params: {
    studentId?: string;
    lessonId?: string;
    enrollmentId?: string;
  } = {}): Promise<StrapiResponse<StrapiLessonProgress[]>> {
    const queryParams: any = {};
    
    if (params.studentId) {
      queryParams['filters[student][id][$eq]'] = params.studentId;
    }
    if (params.lessonId) {
      queryParams['filters[lesson][id][$eq]'] = params.lessonId;
    }
    if (params.enrollmentId) {
      queryParams['filters[enrollment][id][$eq]'] = params.enrollmentId;
    }

    queryParams.populate = ['student', 'lesson', 'enrollment'];
    
    const queryString = this.formatQueryString(queryParams);
    
    return await this.request<StrapiResponse<StrapiLessonProgress[]>>(`/lesson-progresses?${queryString}`);
  }
  
  async createLessonProgress(progressData: {
    student: string | number;
    lesson: string | number;
    enrollment: string | number;
    progressPercentage?: number;
    isCompleted?: boolean;
    lastAccessedAt?: string;
    timeSpent?: number;
  }): Promise<StrapiResponse<StrapiLessonProgress>> {
    console.log('📝 Creating lesson progress:', JSON.stringify(progressData, null, 2));
    return await this.request<StrapiResponse<StrapiLessonProgress>>('/lesson-progresses', {
      method: 'POST',
      body: JSON.stringify({ data: progressData }),
    });
  }
  
  async updateLessonProgress(id: string, progressData: any): Promise<StrapiResponse<StrapiLessonProgress>> {
    return await this.request<StrapiResponse<StrapiLessonProgress>>(`/lesson-progresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data: progressData }),
    });
  }
  
  async markLessonCompleted(id: string): Promise<StrapiResponse<StrapiLessonProgress>> {
    return await this.request<StrapiResponse<StrapiLessonProgress>>(`/lesson-progresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ 
        data: {
          progressPercentage: 100,
          isCompleted: true,
          completionDate: new Date().toISOString()
        } 
      }),
    });
  }

  // Helper to convert between document ID and numeric ID
  async resolveDocumentId(id: string | number): Promise<string> {
    const idStr = id.toString();
    
    // If it's already a numeric ID, return it
    if (/^\d+$/.test(idStr)) {
      return idStr;
    }
    
    // Try to get the numeric ID from the API
    try {
      const response = await this.getCourseById(idStr, 'id');
      if (response.data && response.data.id) {
        console.log(`📋 Resolved document ID ${idStr} to numeric ID ${response.data.id}`);
        return response.data.id.toString();
      }
    } catch (error) {
      console.warn(`⚠️ Could not resolve document ID ${idStr}`, error);
    }
    
    // If we couldn't resolve it, return the original ID
    return idStr;
  }
}

export const strapiAPI = new StrapiAPI();