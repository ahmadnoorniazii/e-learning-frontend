/**
 * Course Service
 * Handles course-related API calls using the new API client
 */

import { apiClient, Course, Enrollment, LessonProgress, CourseReview, Certificate } from './api-client';

export interface CourseFilters {
  category?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  isFree?: boolean;
  isPremium?: boolean;
  isActive?: boolean;
  instructor?: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface CourseSearchParams extends PaginationParams {
  filters?: CourseFilters;
  sort?: string;
  populate?: string;
}

class CourseService {
  
  // Public course methods (no authentication required)
  async getPublicCourses(params: CourseSearchParams = {}): Promise<{ data: Course[]; meta?: any }> {
    try {
      // Use array format for populate that should work with Strapi v4
      const defaultPopulate = ['instructor', 'category', 'thumbnail', 'avatar', 'tags', 'lessons'];
      const response = await apiClient.getCourses({
        page: params.page || 1,
        pageSize: params.pageSize || 12,
        populate: params.populate ? params.populate : defaultPopulate,
        filters: params.filters,
        sort: params.sort || 'createdAt:desc',
      });
      return response;
    } catch (error) {
      console.error('❌ CourseService: Error fetching public courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  async getCourseById(id: string): Promise<Course> {
    try {
      // First, just get the course without populate to ensure it works
      console.log('🔍 Fetching course without populate first...');
      const response = await apiClient.getCourse(id);
      console.log('✅ Got basic course data:', response.data);
      
      // Try to get populated data with a simple approach
      try {
        console.log('🔍 Trying to get populated data...');
        const populatedResponse = await apiClient.getCourse(id, 'instructor');
        console.log('✅ Got populated data:', populatedResponse.data);
        
        // Try to get lessons separately since they might not be directly populated
        try {
          console.log('🔍 Trying to get lessons for course...');
          // First try with numeric ID
          let lessonsResponse = await apiClient.request<any>(`/lessons?filters[course][id]=${populatedResponse.data.id}`);
          console.log('📚 Lessons response (numeric ID):', lessonsResponse);
          
          // If no lessons found with numeric ID, try with documentId
          if (!lessonsResponse.data || lessonsResponse.data.length === 0) {
            console.log('🔍 No lessons found with numeric ID, trying documentId...');
            lessonsResponse = await apiClient.request<any>(`/lessons?filters[course][documentId]=${populatedResponse.data.documentId}`);
            console.log('📚 Lessons response (documentId):', lessonsResponse);
          }
          
          if (lessonsResponse.data && lessonsResponse.data.length > 0) {
            (populatedResponse.data as any).lessons = lessonsResponse.data;
            console.log('✅ Added lessons to course data');
          } else {
            console.log('⚠️ No lessons found for this course');
          }
        } catch (lessonsError) {
          console.log('⚠️ Could not fetch lessons:', lessonsError);
        }
        
        return populatedResponse.data;
      } catch (populateError) {
        console.log('⚠️ Populate failed, using basic data:', populateError);
        return response.data;
      }
      
    } catch (error) {
      console.error('❌ CourseService: Error fetching course:', error);
      throw new Error('Failed to fetch course details');
    }
  }

  async getFeaturedCourses(): Promise<Course[]> {
    try {
      const response = await apiClient.getFeaturedCourses();
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error fetching featured courses:', error);
      return [];
    }
  }

  async searchCourses(query: string, params: CourseSearchParams = {}): Promise<{ data: Course[]; meta?: any }> {
    try {
      // Use array format for populate that should work with Strapi v4
      const defaultPopulate = ['instructor', 'category', 'thumbnail', 'avatar', 'tags', 'lessons'];
      const populate: any = params.populate ? params.populate : defaultPopulate;
      const response = await apiClient.searchCourses(
        query,
        populate
      );
      return response;
    } catch (error) {
      console.error('❌ CourseService: Error searching courses:', error);
      throw new Error('Failed to search courses');
    }
  }

  async getCoursesByCategory(categoryId: string): Promise<Course[]> {
    try {
      const response = await apiClient.getCoursesByCategory(categoryId);
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error fetching courses by category:', error);
      return [];
    }
  }

  async getCourseStats(id: string): Promise<{
    enrollmentCount: number;
    reviewCount: number;
    lessonCount: number;
    rating: number;
    completionRate: number;
  }> {
    try {
      const response = await apiClient.getCourseStats(id);
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error fetching course stats:', error);
      // Return default stats if endpoint is not available
      return {
        enrollmentCount: 0,
        reviewCount: 0,
        lessonCount: 0,
        rating: 0,
        completionRate: 0,
      };
    }
  }

  // Student enrollment methods
  async enrollInCourse(courseId: number, paymentAmount?: number): Promise<Enrollment> {
    try {
      const response = await apiClient.enrollInCourse(courseId, 'completed', paymentAmount);
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error enrolling in course:', error);
      throw new Error('Failed to enroll in course');
    }
  }

  async getMyEnrollments(params: PaginationParams = {}): Promise<{ data: Enrollment[]; meta?: any }> {
    try {
      const response = await apiClient.getEnrollments({
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        populate: { course: ['thumbnail', 'avatar', 'instructor'] } as any,
      });
      
      return response;
    } catch (error) {
      console.error('❌ CourseService: Error fetching enrollments:', error);
      throw new Error('Failed to fetch enrollments');
    }
  }

  async checkEnrollmentStatus(courseId: string): Promise<Enrollment | null> {
    try {
      console.log('🔍 checkEnrollmentStatus called with courseId:', courseId);
      const user = await apiClient.getCurrentUser();
      console.log('👤 Current user:', user?.id);
      
      const response = await apiClient.getEnrollments({
        filters: {
          student: { id: { $eq: user.id } },
          course: { id: { $eq: courseId } }
        }
      });
      
      console.log('📋 Enrollment API response:', response);
      console.log('📊 Enrollment data count:', response.data?.length || 0);
      
      const enrollment = response.data.length > 0 ? response.data[0] : null;
      console.log('✅ Final enrollment result:', enrollment);
      
      return enrollment;
    } catch (error) {
      console.error('❌ CourseService: Error checking enrollment status:', error);
      return null;
    }
  }

  async updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<Enrollment> {
    try {
      const response = await apiClient.updateEnrollment(enrollmentId, { progress });
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error updating enrollment progress:', error);
      throw new Error('Failed to update progress');
    }
  }

  async markCourseCompleted(enrollmentId: string): Promise<Enrollment> {
    try {
      const response = await apiClient.markCourseCompleted(enrollmentId);
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error marking course completed:', error);
      throw new Error('Failed to mark course completed');
    }
  }

  // Lesson progress tracking
  async getLessonProgress(params: PaginationParams = {}): Promise<{ data: LessonProgress[]; meta?: any }> {
    try {
      const response = await apiClient.getLessonProgress({
        page: params.page || 1,
        pageSize: params.pageSize || 50,
        populate: ['lesson', { enrollment: ['course'] }] as any,
      });
      
      return response;
    } catch (error) {
      console.error('❌ CourseService: Error fetching lesson progress:', error);
      throw new Error('Failed to fetch lesson progress');
    }
  }

  async getLessonProgressForCourse(enrollmentId: string, lessonId?: string): Promise<LessonProgress[]> {
    try {
      const filters: any = {
        enrollment: { id: { $eq: enrollmentId } }
      };
      
      if (lessonId) {
        filters.lesson = { id: { $eq: lessonId } };
      }
      
      const response = await apiClient.getLessonProgress({
        filters,
        populate: ['lesson', 'enrollment']
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error fetching lesson progress for course:', error);
      throw new Error('Failed to fetch lesson progress for course');
    }
  }

  async createLessonProgress(data: {
    studentId: number;
    lessonId: number;
    enrollmentId: number;
    isCompleted?: boolean;
    progressPercentage?: number;
    timeSpent?: number;
    notes?: string;
  }): Promise<LessonProgress> {
    try {
      const response = await apiClient.createLessonProgress({
        student: data.studentId,
        lesson: data.lessonId,
        enrollment: data.enrollmentId,
        isCompleted: data.isCompleted,
        progressPercentage: data.progressPercentage,
        timeSpent: data.timeSpent,
        notes: data.notes,
      });
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error creating lesson progress:', error);
      throw new Error('Failed to create lesson progress');
    }
  }

  async updateLessonProgress(
    progressId: string, 
    data: {
      isCompleted?: boolean;
      progressPercentage?: number;
      timeSpent?: number;
      notes?: string;
    }
  ): Promise<LessonProgress> {
    try {
      const response = await apiClient.updateLessonProgress(progressId, data);
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error updating lesson progress:', error);
      throw new Error('Failed to update lesson progress');
    }
  }

  async markLessonCompleted(progressId: string, timeSpent?: number): Promise<LessonProgress> {
    try {
      const response = await apiClient.markLessonCompleted(progressId, timeSpent);
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error marking lesson completed:', error);
      throw new Error('Failed to mark lesson completed');
    }
  }

  // Course reviews
  async getCourseReviews(courseId: string, params: PaginationParams = {}): Promise<{ data: CourseReview[]; meta?: any }> {
    try {
      const response = await apiClient.getCourseReviews({
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        populate: 'student' as any,
        filters: {
          course: { id: { $eq: courseId } }
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ CourseService: Error fetching course reviews:', error);
      return { data: [] };
    }
  }

  async createCourseReview(data: {
    course: number;
    rating: number;
    title: string;
    comment: string;
    isPublic?: boolean;
  }): Promise<CourseReview> {
    try {
      const user = await apiClient.getCurrentUser();
      const response = await apiClient.createCourseReview({
        student: user.id,
        course: data.course,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        isPublic: data.isPublic
      });
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error creating course review:', error);
      throw new Error('Failed to create review');
    }
  }

  async updateCourseReview(
    reviewId: string, 
    data: {
      rating?: number;
      title?: string;
      comment?: string;
      isPublic?: boolean;
    }
  ): Promise<CourseReview> {
    try {
      const response = await apiClient.updateCourseReview(reviewId, data);
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error updating course review:', error);
      throw new Error('Failed to update review');
    }
  }

  // Certificates
  async getMyCertificates(): Promise<Certificate[]> {
    try {
      const user = await apiClient.getCurrentUser();
      const response = await apiClient.getCertificates({
        filters: {
          student: { id: { $eq: user.id } }
        },
        populate: ['course', 'enrollment']
      });
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error fetching certificates:', error);
      return [];
    }
  }

  async getCertificate(certificateId: string): Promise<Certificate> {
    try {
      const response = await apiClient.getCertificate(certificateId);
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error fetching certificate:', error);
      throw new Error('Failed to fetch certificate');
    }
  }

  async generateCertificate(enrollmentId: string, courseId: string): Promise<Certificate> {
    try {
      const user = await apiClient.getCurrentUser();
      const certificateId = `CERT-${Date.now()}-${courseId}-${user.id}`;
      const verificationCode = `VER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const response = await apiClient.createCertificate({
        student: user.id,
        course: parseInt(courseId),
        enrollment: parseInt(enrollmentId),
        certificateId,
        verificationCode,
        issuedDate: new Date().toISOString(),
        isValid: true
      });
      
      // Also update the enrollment to mark certificate as issued
      await apiClient.updateEnrollment(enrollmentId, {
        certificateIssued: true
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error generating certificate:', error);
      throw new Error('Failed to generate certificate');
    }
  }

  async verifyCertificate(certificateId: string, verificationCode: string): Promise<Certificate | null> {
    try {
      const response = await apiClient.verifyCertificate(certificateId, verificationCode);
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('❌ CourseService: Error verifying certificate:', error);
      return null;
    }
  }

  // Instructor methods (protected - require instructor role)
  
  // Media upload helper method
  async uploadCourseMedia(file: File, altText?: string, caption?: string): Promise<{ id: number; url: string }> {
    try {
      const formData = new FormData();
      formData.append('files', file);
      
      if (altText || caption) {
        formData.append('fileInfo', JSON.stringify({
          alternativeText: altText || '',
          caption: caption || ''
        }));
      }
      
      const response = await apiClient.uploadFile(formData);
      
      if (response && response.length > 0) {
        return {
          id: response[0].id,
          url: response[0].url
        };
      }
      
      throw new Error('Upload response is empty');
    } catch (error) {
      console.error('❌ CourseService: Error uploading media:', error);
      throw new Error('Failed to upload media file');
    }
  }

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
    thumbnail?: number; // File ID after upload
    avatar?: number; // File ID after upload
  }): Promise<Course> {
    try {
      const response = await apiClient.createCourse(courseData);
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error creating course:', error);
      throw new Error('Failed to create course');
    }
  }

  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
    try {
      const response = await apiClient.updateCourse(courseId, courseData);
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error updating course:', error);
      throw new Error('Failed to update course');
    }
  }

  async deleteCourse(courseId: string): Promise<void> {
    try {
      await apiClient.deleteCourse(courseId);
    } catch (error) {
      console.error('❌ CourseService: Error deleting course:', error);
      throw new Error('Failed to delete course');
    }
  }

  // Complete course creation workflow with media uploads
  async createCourseWithMedia(courseData: {
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
    thumbnailFile?: File; // Thumbnail image file to upload
    avatarFile?: File; // Avatar image file to upload
  }): Promise<Course> {
    try {
      const finalCourseData: any = {
        title: courseData.title,
        description: courseData.description,
        shortDescription: courseData.shortDescription,
        price: courseData.price,
        isFree: courseData.isFree ?? false,
        isPremium: courseData.isPremium ?? false,
        difficultyLevel: courseData.difficultyLevel,
        duration: courseData.duration,
        objectives: courseData.objectives,
        prerequisites: courseData.prerequisites,
        category: courseData.category,
        tags: courseData.tags,
      };

      // Upload thumbnail if provided
      if (courseData.thumbnailFile) {
        const thumbnailUpload = await this.uploadCourseMedia(
          courseData.thumbnailFile,
          `${courseData.title} thumbnail`,
          'Course thumbnail image'
        );
        finalCourseData.thumbnail = thumbnailUpload.id;
      }

      // Upload avatar if provided
      if (courseData.avatarFile) {
        const avatarUpload = await this.uploadCourseMedia(
          courseData.avatarFile,
          `${courseData.title} avatar`,
          'Course avatar icon'
        );
        finalCourseData.avatar = avatarUpload.id;
      }

      // Create the course with uploaded media IDs
      return await this.createCourse(finalCourseData);
    } catch (error) {
      console.error('❌ CourseService: Error creating course with media:', error);
      throw new Error('Failed to create course with media files');
    }
  }

  // Update course with media support
  async updateCourseWithMedia(courseId: string, courseData: {
    title?: string;
    description?: string;
    shortDescription?: string;
    price?: number;
    isFree?: boolean;
    isPremium?: boolean;
    difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
    duration?: number;
    objectives?: string;
    prerequisites?: string;
    category?: number;
    tags?: number[];
    thumbnailFile?: File; // New thumbnail to upload
    avatarFile?: File; // New avatar to upload
    thumbnail?: number; // Existing thumbnail ID
    avatar?: number; // Existing avatar ID
  }): Promise<Course> {
    try {
      const updateData: any = { ...courseData };

      // Upload new thumbnail if provided
      if (courseData.thumbnailFile) {
        const thumbnailUpload = await this.uploadCourseMedia(
          courseData.thumbnailFile,
          `${courseData.title || 'Course'} thumbnail`,
          'Course thumbnail image'
        );
        updateData.thumbnail = thumbnailUpload.id;
        delete updateData.thumbnailFile;
      }

      // Upload new avatar if provided
      if (courseData.avatarFile) {
        const avatarUpload = await this.uploadCourseMedia(
          courseData.avatarFile,
          `${courseData.title || 'Course'} avatar`,
          'Course avatar icon'
        );
        updateData.avatar = avatarUpload.id;
        delete updateData.avatarFile;
      }

      // Remove file objects from update data
      delete updateData.thumbnailFile;
      delete updateData.avatarFile;

      return await this.updateCourse(courseId, updateData);
    } catch (error) {
      console.error('❌ CourseService: Error updating course with media:', error);
      throw new Error('Failed to update course with media files');
    }
  }

  // Complete Learning Workflow Implementation
  async completeWorkflow(): Promise<{
    enrollInCourse: (courseId: number, paymentAmount?: number) => Promise<Enrollment>;
    trackLessonProgress: (enrollmentId: string, lessonId: number, timeSpent?: number, progressPercentage?: number) => Promise<LessonProgress>;
    updateCourseProgress: (enrollmentId: string) => Promise<Enrollment>;
    leaveReview: (courseId: number, rating: number, title: string, comment: string) => Promise<CourseReview>;
    generateCertificate: (enrollmentId: string, courseId: string) => Promise<Certificate>;
  }> {
    const user = await apiClient.getCurrentUser();
    
    return {
      // Step 1: Enroll in a course
      enrollInCourse: async (courseId: number, paymentAmount?: number) => {
        return await this.enrollInCourse(courseId, paymentAmount);
      },

      // Step 2: Track lesson progress
      trackLessonProgress: async (enrollmentId: string, lessonId: number, timeSpent: number = 0, progressPercentage: number = 0) => {
        // Check if lesson progress already exists
        const existingProgress = await this.getLessonProgressForCourse(enrollmentId, lessonId.toString());
        
        if (existingProgress.length > 0) {
          // Update existing progress
          const progressId = existingProgress[0].id.toString();
          return await this.updateLessonProgress(progressId, {
            progressPercentage,
            timeSpent
          });
        } else {
          // Create new progress
          return await this.createLessonProgress({
            studentId: user.id,
            lessonId,
            enrollmentId: parseInt(enrollmentId),
            progressPercentage,
            timeSpent,
            isCompleted: progressPercentage >= 100
          });
        }
      },

      // Step 3: Update course progress
      updateCourseProgress: async (enrollmentId: string) => {
        // Get all lesson progress for this enrollment
        const lessonProgresses = await this.getLessonProgressForCourse(enrollmentId);
        const completedLessons = lessonProgresses.filter(p => p.isCompleted).length;
        const totalLessons = lessonProgresses.length;
        
        const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        
        if (overallProgress >= 100) {
          // Mark course as completed
          return await this.markCourseCompleted(enrollmentId);
        } else {
          // Update progress
          return await this.updateEnrollmentProgress(enrollmentId, overallProgress);
        }
      },

      // Step 4: Leave a review
      leaveReview: async (courseId: number, rating: number, title: string, comment: string) => {
        return await this.createCourseReview({
          course: courseId,
          rating,
          title,
          comment,
          isPublic: true
        });
      },

      // Step 5: Generate certificate
      generateCertificate: async (enrollmentId: string, courseId: string) => {
        return await this.generateCertificate(enrollmentId, courseId);
      }
    };
  }

  // Utility method to execute the complete workflow for a student
  async executeCompleteWorkflow(params: {
    courseId: number;
    lessons: Array<{ id: number; timeSpent?: number; progressPercentage?: number }>;
    review?: { rating: number; title: string; comment: string };
    paymentAmount?: number;
  }): Promise<{
    enrollment: Enrollment;
    lessonProgresses: LessonProgress[];
    finalEnrollment: Enrollment;
    review?: CourseReview;
    certificate?: Certificate;
  }> {
    const workflow = await this.completeWorkflow();
    
    // Step 1: Enroll in course
    const enrollment = await workflow.enrollInCourse(params.courseId, params.paymentAmount);
    
    // Step 2: Track lesson progress for each lesson
    const lessonProgresses: LessonProgress[] = [];
    for (const lesson of params.lessons) {
      const progress = await workflow.trackLessonProgress(
        enrollment.id.toString(),
        lesson.id,
        lesson.timeSpent || 0,
        lesson.progressPercentage || 0
      );
      lessonProgresses.push(progress);
    }
    
    // Step 3: Update course progress
    const finalEnrollment = await workflow.updateCourseProgress(enrollment.id.toString());
    
    // Step 4: Leave a review (optional)
    let review: CourseReview | undefined;
    if (params.review) {
      review = await workflow.leaveReview(
        params.courseId,
        params.review.rating,
        params.review.title,
        params.review.comment
      );
    }
    
    // Step 5: Generate certificate (if course is completed)
    let certificate: Certificate | undefined;
    if (finalEnrollment.isCompleted) {
      certificate = await workflow.generateCertificate(
        finalEnrollment.id.toString(),
        params.courseId.toString()
      );
    }
    
    return {
      enrollment,
      lessonProgresses,
      finalEnrollment,
      review,
      certificate
    };
  }

  // Helper method to enrich course data with missing relationships
  async enrichCourseData(course: any): Promise<Course> {
    try {
      // If instructor data is missing or minimal, try to fetch it
      if (!course.instructor || (typeof course.instructor === 'number')) {
        const instructorId = typeof course.instructor === 'number' ? course.instructor : course.instructor?.id;
        if (instructorId) {
          try {
            // Note: This would require an instructor endpoint
            // For now, we'll use the existing data or fallback
            console.log('⚠️ Instructor data missing, using fallback');
          } catch (error) {
            console.log('❌ Could not fetch instructor data:', error);
          }
        }
      }

      // If category data is missing, provide fallback
      if (!course.category || (typeof course.category === 'number')) {
        console.log('⚠️ Category data missing, using fallback');
      }

      return course;
    } catch (error) {
      console.error('❌ Error enriching course data:', error);
      return course;
    }
  }

  // Utility methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}min`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  }

  getDifficultyColor(level: string): string {
    switch (level) {
      case 'beginner':
        return 'green';
      case 'intermediate':
        return 'yellow';
      case 'advanced':
        return 'red';
      default:
        return 'gray';
    }
  }
}

export const courseService = new CourseService();
export default courseService;
