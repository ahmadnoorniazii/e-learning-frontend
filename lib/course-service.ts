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
      console.log('🔍 CourseService.getCourseById called with ID:', id);
      
      // First try to get the course directly with the provided ID
      let response;
      
      try {
        console.log('🔍 Attempting to fetch course directly with ID:', id);
        response = await apiClient.getCourse(id);
        console.log('✅ Successfully got course data:', response.data);
      } catch (directError) {
        console.log('❌ Direct course fetch failed:', directError);
        
        // If direct fetch fails, try searching by different methods
        console.log('🔍 Trying alternative search methods...');
        
        // Method 1: Search by documentId
        try {
          console.log('🔍 Searching by documentId...');
          const searchByDocId = await apiClient.getCourses({
            filters: { documentId: { $eq: id } },
            pageSize: 1
          });
          
          if (searchByDocId.data.length > 0) {
            response = { data: searchByDocId.data[0] };
            console.log('✅ Found course by documentId:', response.data);
          }
        } catch (docIdError) {
          console.log('❌ DocumentId search failed:', docIdError);
        }
        
        // Method 2: If it's a numeric string, try as numeric ID
        if (!response && !isNaN(parseInt(id))) {
          try {
            console.log('🔍 Trying as numeric ID...');
            const numericResponse = await apiClient.getCourse(parseInt(id).toString());
            response = numericResponse;
            console.log('✅ Found course by numeric ID:', response.data);
          } catch (numericError) {
            console.log('❌ Numeric ID search failed:', numericError);
          }
        }
        
        // Method 3: Search in all courses to see what's available
        if (!response) {
          console.log('🔍 Listing available courses for debugging...');
          try {
            const allCourses = await apiClient.getCourses({ pageSize: 10 });
            console.log('📚 Available courses:', allCourses.data.map(c => ({
              id: c.id,
              documentId: c.documentId,
              title: c.title
            })));
          } catch (listError) {
            console.log('❌ Could not list courses:', listError);
          }
          
          throw new Error(`Course not found with ID: ${id}. Check the course ID in the URL.`);
        }
      }

      // Now try to get lessons for this course
      const courseData = response.data;
      console.log('🔍 Getting lessons for course:', { id: courseData.id, documentId: courseData.documentId });
      
      try {
        // Try multiple methods to get lessons
        let lessonsResponse;
        
        // Method 1: Try with course numeric ID
        try {
          console.log('🔍 Fetching lessons with course numeric ID:', courseData.id);
          lessonsResponse = await apiClient.request<any>(`/lessons?filters[course][id]=${courseData.id}&sort=sortOrder:asc`);
          console.log('📚 Lessons response (numeric ID):', lessonsResponse);
        } catch (numericLessonError) {
          console.log('❌ Lessons fetch with numeric ID failed:', numericLessonError);
        }
        
        // Method 2: Try with course documentId if numeric failed
        if (!lessonsResponse?.data || lessonsResponse.data.length === 0) {
          try {
            console.log('🔍 Fetching lessons with course documentId:', courseData.documentId);
            lessonsResponse = await apiClient.request<any>(`/lessons?filters[course][documentId]=${courseData.documentId}&sort=sortOrder:asc`);
            console.log('📚 Lessons response (documentId):', lessonsResponse);
          } catch (docIdLessonError) {
            console.log('❌ Lessons fetch with documentId failed:', docIdLessonError);
          }
        }
        
        if (lessonsResponse?.data && lessonsResponse.data.length > 0) {
          (courseData as any).lessons = lessonsResponse.data;
          console.log('✅ Added', lessonsResponse.data.length, 'lessons to course data');
        } else {
          console.log('⚠️ No lessons found for this course');
          (courseData as any).lessons = [];
        }
        
      } catch (lessonError) {
        console.error('❌ Error fetching lessons:', lessonError);
        (courseData as any).lessons = [];
      }

      return courseData;
      
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
      console.log('🎯 Enrolling in course:', courseId);
      const response = await apiClient.enrollInCourse(courseId, 'completed', paymentAmount);
      const enrollment = response.data;
      
      console.log('✅ Enrollment successful:', enrollment);

      // Initialize lesson progress for all lessons in the course
      try {
        console.log('🔄 Initializing lesson progress...');
        
        // Get current user
        const currentUser = await apiClient.getCurrentUser();
        
        await this.initializeLessonProgress(
          enrollment.id,
          courseId,
          currentUser.id
        );
        console.log('✅ Lesson progress initialized successfully');
      } catch (progressError) {
        console.error('⚠️ Warning: Failed to initialize lesson progress:', progressError);
        // Don't throw here - enrollment was successful, just log the warning
      }

      return enrollment;
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
      console.log('🔄 Updating enrollment progress:', { enrollmentId, progress });
      const response = await apiClient.updateEnrollment(enrollmentId, { progress });
      console.log('✅ Enrollment progress updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error updating enrollment progress:', error);
      throw new Error('Failed to update progress');
    }
  }

  async markCourseCompleted(enrollmentId: string): Promise<Enrollment> {
    try {
      console.log('🎯 Marking course as completed:', enrollmentId);
      const response = await apiClient.markCourseCompleted(enrollmentId);
      console.log('✅ Course marked as completed:', response.data);
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
      console.log('🔍 getLessonProgressForCourse called with:', { enrollmentId, lessonId });
      
      // Parse enrollment ID and check if it's numeric or documentId
      const enrollmentIdNum = parseInt(enrollmentId);
      const isNumericId = !isNaN(enrollmentIdNum);
      
      console.log('📊 Enrollment ID analysis:', { 
        original: enrollmentId, 
        parsed: enrollmentIdNum, 
        isNumeric: isNumericId,
        type: isNumericId ? 'numeric' : 'documentId'
      });
      let filters: any = {};
      
      // Handle both numeric IDs and documentIds
      if (isNumericId) {
        // Use numeric ID filter
        filters.enrollment = { id: { $eq: enrollmentIdNum } };
        console.log('📍 Using numeric enrollment ID filter:', enrollmentIdNum);
      } else {
        // Use documentId filter
        filters.enrollment = { documentId: { $eq: enrollmentId } };
        console.log('🔍 Using documentId enrollment filter:', enrollmentId);
      }

      // Add lesson filter if provided
      if (lessonId) {
        const lessonIdNum = parseInt(lessonId);
        if (!isNaN(lessonIdNum)) {
          filters.lesson = { id: { $eq: lessonIdNum } };
          console.log('🔍 Added lesson ID filter:', lessonIdNum);
        } else {
          filters.lesson = { documentId: { $eq: lessonId } };
          console.log('🔍 Added lesson documentId filter:', lessonId);
        }
      }

      console.log('🔍 Getting lesson progress with filters:', { 
        filters, 
        enrollmentId, 
        lessonId 
      });
 
      const response = await apiClient.getLessonProgress({
        filters,
        populate: ['lesson', 'enrollment'],
        pageSize: 100
      });

      console.log('📋 Lesson progress API response:', response);
      console.log('📊 Number of results:', response.data.length);

      // Log the structure of lesson progress data for debugging
      if (response.data.length > 0) {
        console.log('📋 Sample lesson progress structure:', {
          id: response.data[0].id,
          documentId: response.data[0].documentId,
          lessonStructure: response.data[0].lesson ? {
            hasData: !!response.data[0].lesson,
            lessonId: (response.data[0].lesson as any)?.id,
            lessonKeys: Object.keys(response.data[0].lesson)
          } : 'no lesson',
          enrollmentStructure: response.data[0].enrollment ? {
            hasData: !!response.data[0].enrollment,
            enrollmentId: (response.data[0].enrollment as any)?.id,
            enrollmentKeys: Object.keys(response.data[0].enrollment)
          } : 'no enrollment',
          isCompleted: response.data[0].isCompleted,
          progressPercentage: response.data[0].progressPercentage
        });
      }
      
      // Filter client-side as additional safety check
      const filteredResults = response.data.filter(progress => {
        // Extract enrollment ID from the populated data structure
        const progressEnrollmentId = (progress.enrollment as any)?.id;
        const progressEnrollmentDocumentId = (progress.enrollment as any)?.documentId;
        
        console.log('🔍 Filtering progress:', {
          progressId: progress.id,
          progressDocumentId: progress.documentId,
          progressEnrollmentId,
          progressEnrollmentDocumentId,
          targetEnrollmentId: enrollmentId,
          targetEnrollmentIdNum: enrollmentIdNum,
          isNumericId,
          lessonId: (progress.lesson as any)?.id,
          lessonDocumentId: (progress.lesson as any)?.documentId
        });
        
        // Match by numeric ID or documentId
        if (isNumericId) {
          return progressEnrollmentId === enrollmentIdNum;
        } else {
          // For documentId, match by documentId
          return progressEnrollmentDocumentId === enrollmentId;
        }
      });
      
      console.log('📊 Filtered results count:', filteredResults.length);
      return filteredResults;
      
    } catch (error) {
      console.error('❌ CourseService: Error fetching lesson progress for course:', error);
      return [];
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
      console.log('📝 Creating lesson progress with data:', data);
      
      const progressData = {
        student: data.studentId,
        lesson: data.lessonId,
        enrollment: data.enrollmentId,
        isCompleted: data.isCompleted || false,
        progressPercentage: data.progressPercentage || 0,
        timeSpent: data.timeSpent || 0,
        notes: data.notes || '',
      };
      
      console.log('📝 API request data:', progressData);
      
      const response = await apiClient.createLessonProgress(progressData);
      console.log('✅ Lesson progress created successfully:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error creating lesson progress:', error);
      console.error('❌ Request data was:', data);
      throw new Error(`Failed to create lesson progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async initializeLessonProgress(enrollmentId: number, courseId: number, studentId: number): Promise<LessonProgress[]> {
    try {
      console.log('🔄 Initializing lesson progress for enrollment:', { enrollmentId, courseId, studentId });
      
      // First, get all lessons for the course
      const course = await this.getCourseById(courseId.toString());
      if (!course) {
        throw new Error('Course not found');
      }

      const lessonsRaw = course.lessons || [];
      const lessons = Array.isArray(lessonsRaw) ? lessonsRaw : (lessonsRaw as any)?.data || [];
      
      console.log('📚 Found lessons to initialize progress for:', { 
        lessonsCount: lessons.length,
        lessonIds: lessons.map((l: any) => l.id)
      });

      if (lessons.length === 0) {
        console.log('⚠️ No lessons found for course, skipping progress initialization');
        return [];
      }

      // Create initial progress record for each lesson
      const progressPromises = lessons.map(async (lesson: any) => {
        try {
          console.log('🎯 Creating progress for lesson:', lesson.id);
          return await this.createLessonProgress({
            studentId,
            lessonId: lesson.id,
            enrollmentId,
            isCompleted: false,
            progressPercentage: 0,
            timeSpent: 0
          });
        } catch (error) {
          console.error(`❌ Failed to create progress for lesson ${lesson.id}:`, error);
          throw error;
        }
      });
      
      const createdProgresses = await Promise.all(progressPromises);
      console.log('✅ Successfully initialized lesson progress:', {
        count: createdProgresses.length,
        progressIds: createdProgresses.map(p => p.id)
      });
      
      return createdProgresses;
      
    } catch (error) {
      console.error('❌ Error initializing lesson progress:', error);
      throw error;
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
      console.log('🔄 Updating lesson progress with ID/documentId:', progressId, 'Data:', data);
      
      // Add lastAccessedAt to track when progress was last updated
      const updateData = {
        ...data,
        lastAccessedAt: new Date().toISOString()
      };
      
      console.log('📝 API update data:', updateData);
      
      const response = await apiClient.updateLessonProgress(progressId, updateData);
      console.log('✅ Lesson progress updated successfully:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error updating lesson progress:', error);
      console.error('❌ Update data was:', data);
      throw new Error(`Failed to update lesson progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async markLessonCompleted(progressId: string, timeSpent?: number): Promise<LessonProgress> {
    try {
      console.log('✅ Marking lesson completed with ID/documentId:', progressId);
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
        populate: ['course', 'enrollment', 'student']
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
      console.log('🎓 Generating certificate for enrollment:', enrollmentId, 'course:', courseId);
      const user = await apiClient.getCurrentUser();
      const certificateId = `CERT-${Date.now()}-${courseId}-${user.id}`;
      const verificationCode = `VER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Get the enrollment to extract the numeric ID
      let numericEnrollmentId: number;
      
      // Try to parse as number first
      const parsedId = parseInt(enrollmentId);
      if (!isNaN(parsedId)) {
        numericEnrollmentId = parsedId;
      } else {
        // If it's not a number, it's likely a documentId, so fetch the enrollment
        console.log('🔍 EnrollmentId appears to be documentId, fetching enrollment data...');
        const enrollment = await apiClient.getEnrollment(enrollmentId);
        if (!enrollment.data || !enrollment.data.id) {
          throw new Error('Could not get numeric enrollment ID for certificate generation');
        }
        numericEnrollmentId = enrollment.data.id;
        console.log('✅ Got numeric enrollment ID:', numericEnrollmentId);
      }
      
      const certificateData = {
        student: user.id,
        course: parseInt(courseId),
        enrollment: numericEnrollmentId,
        certificateId,
        verificationCode,
        issuedDate: new Date().toISOString(),
        isValid: true
      };
      
      console.log('📝 Creating certificate with data:', certificateData);
      
      const response = await apiClient.createCertificate(certificateData);
      
      console.log('✅ Certificate created:', response.data);
      
      // Also update the enrollment to mark certificate as issued
      // Use the original enrollmentId (which could be documentId) for the update
      await apiClient.updateEnrollment(enrollmentId, {
        certificateIssued: true
      });
      
      console.log('✅ Enrollment updated with certificate flag');
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
        try {
          console.log('🔄 trackLessonProgress called with:', { enrollmentId, lessonId, timeSpent, progressPercentage });
          
          // Check if lesson progress already exists
          const existingProgress = await this.getLessonProgressForCourse(enrollmentId, lessonId.toString());
          console.log('📋 Existing progress found:', existingProgress.length);
          
          if (existingProgress.length > 0) {
            // Update existing progress using documentId (Strapi v5)
            const progressToUpdate = existingProgress[0];
            const progressDocumentId = progressToUpdate.documentId || progressToUpdate.id.toString();
            console.log('🔄 Updating existing lesson progress with documentId:', progressDocumentId);
            
            // Calculate cumulative time spent
            const newTimeSpent = (progressToUpdate.timeSpent || 0) + timeSpent;
            const isCompleted = progressPercentage >= 100;
            
            console.log('📊 Update data:', {
              progressPercentage,
              timeSpent: newTimeSpent,
              isCompleted,
              previousTimeSpent: progressToUpdate.timeSpent
            });
            
            return await this.updateLessonProgress(progressDocumentId, {
              progressPercentage,
              timeSpent: newTimeSpent,
              isCompleted
            });
          } else {
            // Create new progress - need to handle enrollment ID conversion
            console.log('📝 Creating new lesson progress for lesson:', lessonId);
            
            let numericEnrollmentId: number;
            const parsedId = parseInt(enrollmentId);
            
            if (!isNaN(parsedId)) {
              numericEnrollmentId = parsedId;
            } else {
              // If it's a documentId, fetch the enrollment to get numeric ID
              console.log('� Enrollment ID appears to be documentId, fetching enrollment data...');
              try {
                const enrollment = await apiClient.getEnrollment(enrollmentId);
                if (!enrollment.data || !enrollment.data.id) {
                  throw new Error('Could not get numeric enrollment ID for progress creation');
                }
                numericEnrollmentId = enrollment.data.id;
                console.log('✅ Got numeric enrollment ID:', numericEnrollmentId);
              } catch (enrollmentError) {
                console.error('❌ Failed to fetch enrollment for ID conversion:', enrollmentError);
                throw new Error(`Invalid enrollment ID: ${enrollmentId}`);
              }
            }
            
            return await this.createLessonProgress({
              studentId: user.id,
              lessonId,
              enrollmentId: numericEnrollmentId,
              progressPercentage,
              timeSpent,
              isCompleted: progressPercentage >= 100
            });
          }
        } catch (error) {
          console.error('❌ Error in trackLessonProgress:', error);
          throw error;
        }
      },

      // Step 3: Update course progress
      updateCourseProgress: async (enrollmentId: string) => {
        try {
          console.log('🔄 Starting updateCourseProgress for enrollment:', enrollmentId);
          
          // Get the enrollment to find the course
          const enrollment = await apiClient.getEnrollment(enrollmentId, ['course']);
          console.log('📋 Raw enrollment data:', enrollment);
          
          if (!enrollment.data) {
            throw new Error('Enrollment not found');
          }

          // Handle different possible course data structures
          let courseId: number | null = null;
          
          // Try different ways to get course ID - with populated data, course comes directly
          if ((enrollment.data.course as any)?.documentId) {
            courseId = (enrollment.data.course as any).documentId;
          } else if ((enrollment.data.course as any)?.id) {
            courseId = (enrollment.data.course as any).id;
          } else if ((enrollment.data.course as any)?.data?.id) {
            // Fallback for non-populated course data
            courseId = (enrollment.data.course as any).data.id;
          } else if ((enrollment.data as any).course) {
            // Handle direct course ID
            courseId = (enrollment.data as any).course;
          }

          console.log('🎯 Extracted course ID:', courseId);
          
          if (!courseId) {
            console.error('❌ Course ID structure:', JSON.stringify(enrollment.data.course, null, 2));
            throw new Error('Course not found in enrollment');
          }

          // Get course with lessons
          const course = await this.getCourseById(courseId.toString());
          console.log('📚 Course data fetched:', { 
            id: course.id, 
            title: course.title,
            lessonsType: typeof course.lessons,
            lessonsIsArray: Array.isArray(course.lessons),
            lessonsData: course.lessons
          });
          // Handle both normalized and non-normalized lesson data
          let totalLessons = 0;
          if (course.lessons) {
            if (Array.isArray(course.lessons)) {
              totalLessons = course.lessons.length;
            } else if (course.lessons.data && Array.isArray(course.lessons.data)) {
              totalLessons = course.lessons.data.length;
            }
          }

          console.log('📊 Total lessons found:', totalLessons);

          if (totalLessons === 0) {
            console.log('⚠️ No lessons found for course, keeping current progress');
            return enrollment.data;
          }

          // Get all lesson progress for this enrollment
          const lessonsArray = Array.isArray(course.lessons) ? course.lessons : (course.lessons as any)?.data || [];
          const firstLessonDocumentId = lessonsArray[0]?.documentId;
          const lessonProgresses = await this.getLessonProgressForCourse(enrollmentId, firstLessonDocumentId);
          const completedLessons = lessonProgresses.filter(p => p.isCompleted).length;

          console.log('📊 Progress calculation:', { 
            completedLessons, 
            totalLessons, 
            lessonProgressCount: lessonProgresses.length 
          });

          const overallProgress = Math.round((completedLessons / totalLessons) * 100);
          
          if (overallProgress >= 100) {

            // Mark course as completed
            return await this.markCourseCompleted(enrollmentId);
          } else {

            // Update progress
            return await this.updateEnrollmentProgress(enrollmentId, overallProgress);
          }
        } catch (error) {
          console.error('❌ Error in updateCourseProgress:', error);
          throw error;
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
        enrollment.documentId.toString(),
        lesson.id,
        lesson.timeSpent || 0,
        lesson.progressPercentage || 0
      );
      lessonProgresses.push(progress);
    }
    console.log("meeweee", enrollment?.documentId?.toString())
    // Step 3: Update course progress
    const finalEnrollment = await workflow.updateCourseProgress(enrollment?.documentId?.toString());
    
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
