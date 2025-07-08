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
    name: string;
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

interface StrapiCourse {
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

interface StrapiProgress {
  id: number;
  attributes: {
    completedLessons: string[];
    percentage: number;
    lastAccessed: string;
    user?: {
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
    enrolledAt: string;
    enrollmentStatus: string;
    user?: {
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

class StrapiAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('strapi-token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    console.log(`🔄 Strapi API: ${options.method || 'GET'} ${endpoint}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
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
    } catch (error) {
      console.error('❌ Strapi API: Request failed:', error);
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

  async getCourseById(id: string, populate: string = 'thumbnail,instructor.profile.avatar,lessons'): Promise<StrapiResponse<StrapiCourse>> {
    try {
      return await this.request<StrapiResponse<StrapiCourse>>(
        `/courses/${id}?populate=${populate}`
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

  async getCoursesByInstructor(instructorId: number, params: {
    page?: number;
    pageSize?: number;
  } = {}): Promise<StrapiResponse<StrapiCourse[]>> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('pagination[page]', params.page.toString());
    if (params.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());

    // Updated filtering format
    searchParams.append('filters[instructor]', instructorId.toString());
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
    return await this.request<StrapiResponse<StrapiOrder>>('/orders', {
      method: 'POST',
      body: JSON.stringify({ data: orderData }),
    });
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
      searchParams.append('filters[course][id][$eq]', params.courseId);
    }
    if (params.userId) {
      searchParams.append('filters[user][id][$eq]', params.userId);
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
    const searchParams = new URLSearchParams();
    searchParams.append('filters[user][id][$eq]', userId);
    
    if (courseId) {
      searchParams.append('filters[course][id][$eq]', courseId);
    }

    searchParams.append('populate', 'user,course');

    return await this.request<StrapiResponse<StrapiProgress[]>>(`/progresses?${searchParams.toString()}`);
  }

  async createProgress(progressData: any): Promise<StrapiResponse<StrapiProgress>> {
    return await this.request<StrapiResponse<StrapiProgress>>('/progresses', {
      method: 'POST',
      body: JSON.stringify({ data: progressData }),
    });
  }

  async updateProgress(id: string, progressData: any): Promise<StrapiResponse<StrapiProgress>> {
    return await this.request<StrapiResponse<StrapiProgress>>(`/progresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data: progressData }),
    });
  }

  // Enrollment management methods
  async getEnrollments(params: {
    userId?: string;
    courseId?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<StrapiResponse<StrapiEnrollment[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('pagination[page]', params.page.toString());
    if (params.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString());
    
    if (params.userId) {
      searchParams.append('filters[user][id][$eq]', params.userId);
    }
    if (params.courseId) {
      searchParams.append('filters[course][id][$eq]', params.courseId);
    }

    searchParams.append('populate', 'user,course');

    return await this.request<StrapiResponse<StrapiEnrollment[]>>(`/enrollments?${searchParams.toString()}`);
  }

  async createEnrollment(enrollmentData: any): Promise<StrapiResponse<StrapiEnrollment>> {
    return await this.request<StrapiResponse<StrapiEnrollment>>('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ data: enrollmentData }),
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
}

export const strapiAPI = new StrapiAPI();
export type { StrapiUser, StrapiAuthResponse, StrapiCourse, StrapiOrder, StrapiReview, StrapiCertificate, StrapiProgress, StrapiEnrollment };