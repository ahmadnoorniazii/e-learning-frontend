import { apiClient } from './api-client';

// Types
export interface UserProfile {
  id: number;
  documentId: string;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  provider?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface AvatarFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path?: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

export interface Avatar {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: AvatarFormat;
    small?: AvatarFormat;
    medium?: AvatarFormat;
    large?: AvatarFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface InstructorProfile {
  id: number;
  documentId: string;
  firstName: string;
  lastName: string;
  bio?: string;
  isInstructor: boolean;
  instructorBio?: string;
  expertise?: string[];
  experienceLevel?: string;
  socialLinks?: any;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  occupation?: string;
  dateOfBirth?: string;
  interests?: string[];
  learningGoals?: string[];
  notificationPreferences?: any;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  totalCoursesCompleted: number;
  totalLearningHours: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  user: UserProfile;
  avatar?: Avatar;
  courseCount?: number;
  averageRating?: number;
  totalStudents?: number;
}

export interface Thumbnail {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: AvatarFormat;
    small?: AvatarFormat;
    medium?: AvatarFormat;
    large?: AvatarFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Course {
  id: number;
  documentId: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  thumbnail?: Thumbnail;
  category?: {
    id: number;
    name: string;
  };
  reviews?: Review[];
}

export interface Review {
  id: number;
  documentId: string;
  rating: number;
  comment: string;
  createdAt: string;
  student?: {
    id: number;
    username: string;
  };
  course?: {
    id: number;
    title: string;
  };
}

class InstructorService {
  /**
   * Get all instructors with optional pagination and filtering
   */
  async getAllInstructors(params: {
    page?: number;
    pageSize?: number;
    sort?: string;
  } = {}): Promise<{ data: InstructorProfile[]; meta: any }> {
    try {
      const searchParams = new URLSearchParams();
      
      // Basic filter for instructors
      searchParams.append('filters[isInstructor][$eq]', 'true');
      
      // Populate related data using indexed syntax for Strapi v4/v5
      searchParams.append('populate[0]', 'user');
      searchParams.append('populate[1]', 'avatar');
      
      // Pagination
      if (params.page) {
        searchParams.append('pagination[page]', params.page.toString());
      }
      if (params.pageSize) {
        searchParams.append('pagination[pageSize]', params.pageSize.toString());
      }
      
      // Sorting
      const sort = params.sort || 'firstName:asc';
      searchParams.append('sort', sort);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/user-profiles?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Transform the Strapi response to our interface
      const transformedData = result.data.map((item: any) => ({
        id: item.id,
        documentId: item.documentId,
        firstName: item.firstName,
        lastName: item.lastName,
        bio: item.bio,
        isInstructor: item.isInstructor,
        instructorBio: item.instructorBio,
        expertise: item.expertise,
        experienceLevel: item.experienceLevel,
        socialLinks: item.socialLinks,
        phoneNumber: item.phoneNumber,
        address: item.address,
        city: item.city,
        country: item.country,
        occupation: item.occupation,
        dateOfBirth: item.dateOfBirth,
        interests: item.interests,
        learningGoals: item.learningGoals,
        notificationPreferences: item.notificationPreferences,
        isEmailVerified: item.isEmailVerified,
        lastLoginAt: item.lastLoginAt,
        totalCoursesCompleted: item.totalCoursesCompleted,
        totalLearningHours: item.totalLearningHours,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        publishedAt: item.publishedAt,
        avatar: item.avatar,
        user: item.user,
        courseCount: 0,
        averageRating: 0,
        totalStudents: 0
      }));
      
      return {
        data: transformedData,
        meta: result.meta
      };
    } catch (error) {
      console.error('❌ InstructorService: Error fetching instructors:', error);
      throw new Error('Failed to fetch instructors');
    }
  }

  /**
   * Get specific instructor by documentId
   */
  async getInstructorById(documentId: string): Promise<InstructorProfile> {
    try {
      const searchParams = new URLSearchParams();
      // Use indexed populate syntax for Strapi v4/v5
      searchParams.append('populate[0]', 'user');
      searchParams.append('populate[1]', 'avatar');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/user-profiles/${documentId}?${searchParams}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Instructor not found');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      const item = result.data;
      
      return {
        id: item.id,
        documentId: item.documentId,
        firstName: item.firstName,
        lastName: item.lastName,
        bio: item.bio,
        isInstructor: item.isInstructor,
        instructorBio: item.instructorBio,
        expertise: item.expertise,
        experienceLevel: item.experienceLevel,
        socialLinks: item.socialLinks,
        phoneNumber: item.phoneNumber,
        address: item.address,
        city: item.city,
        country: item.country,
        occupation: item.occupation,
        dateOfBirth: item.dateOfBirth,
        interests: item.interests,
        learningGoals: item.learningGoals,
        notificationPreferences: item.notificationPreferences,
        isEmailVerified: item.isEmailVerified,
        lastLoginAt: item.lastLoginAt,
        totalCoursesCompleted: item.totalCoursesCompleted,
        totalLearningHours: item.totalLearningHours,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        publishedAt: item.publishedAt,
        avatar: item.avatar,
        user: item.user
      };
    } catch (error) {
      console.error('❌ InstructorService: Error fetching instructor:', error);
      throw error;
    }
  }

  /**
   * Get instructor's courses
   */
  async getInstructorCourses(userId: number, params: {
    page?: number;
    pageSize?: number;
    sort?: string;
  } = {}): Promise<{ data: Course[]; meta: any }> {
    try {
      const searchParams = new URLSearchParams();
      
      // Filter courses by instructor user ID
      searchParams.append('filters[instructor][id][$eq]', userId.toString());
      
      // Populate related data
      searchParams.append('populate[0]', 'thumbnail');
      searchParams.append('populate[1]', 'category');
      searchParams.append('populate[2]', 'reviews');
      
      // Pagination
      if (params.page) {
        searchParams.append('pagination[page]', params.page.toString());
      }
      if (params.pageSize) {
        searchParams.append('pagination[pageSize]', params.pageSize.toString());
      }
      
      // Sorting
      const sort = params.sort || 'createdAt:desc';
      searchParams.append('sort', sort);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/courses?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        data: result.data || [],
        meta: result.meta
      };
    } catch (error) {
      console.error('❌ InstructorService: Error fetching instructor courses:', error);
      throw error;
    }
  }

  /**
   * Get instructor's reviews
   */
  async getInstructorReviews(userId: number, params: {
    page?: number;
    pageSize?: number;
  } = {}): Promise<{ data: Review[]; meta: any }> {
    try {
      const searchParams = new URLSearchParams();
      
      // Filter reviews by instructor's courses
      searchParams.append('filters[course][instructor][id][$eq]', userId.toString());
      
      // Populate related data using indexed syntax
      searchParams.append('populate[0]', 'student');
      searchParams.append('populate[1]', 'course');
      
      // Pagination
      if (params.page) {
        searchParams.append('pagination[page]', params.page.toString());
      }
      if (params.pageSize) {
        searchParams.append('pagination[pageSize]', params.pageSize.toString());
      }
      
      // Sort by most recent
      searchParams.append('sort', 'createdAt:desc');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/course-reviews?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        data: result.data || [],
        meta: result.meta
      };
    } catch (error) {
      console.error('❌ InstructorService: Error fetching instructor reviews:', error);
      throw error;
    }
  }

  /**
   * Get instructor stats (courses, students, rating)
   */
  async getInstructorStats(userId: number): Promise<{
    courseCount: number;
    totalStudents: number;
    averageRating: number;
  }> {
    try {
      // Get courses count and total students
      const coursesResponse = await this.getInstructorCourses(userId, { pageSize: 100 });
      const courseCount = coursesResponse.data.length;
      
      // Calculate total students (this would need enrollment data from your API)
      const totalStudents = 0; // Placeholder - you'd need an enrollments endpoint
      
      // Get reviews to calculate average rating
      const reviewsResponse = await this.getInstructorReviews(userId, { pageSize: 100 });
      const reviews = reviewsResponse.data;
      
      let averageRating = 0;
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = totalRating / reviews.length;
      }
      
      return {
        courseCount,
        totalStudents,
        averageRating
      };
    } catch (error) {
      console.error('❌ InstructorService: Error fetching instructor stats:', error);
      return {
        courseCount: 0,
        totalStudents: 0,
        averageRating: 0
      };
    }
  }
}

// Export a singleton instance
export const instructorService = new InstructorService();
