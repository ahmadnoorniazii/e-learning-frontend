import { useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import courseService from '@/lib/course-service';
import { Course, Lesson, Enrollment, LessonProgress, CourseReview, Certificate } from '@/lib/api-client';

export interface LearningWorkflowState {
  // Step 1: Course & Enrollment
  course: Course | null;
  enrollment: Enrollment | null;
  
  // Step 2: Lessons & Progress
  lessons: Lesson[];
  lessonProgresses: LessonProgress[];
  
  // Step 3: Reviews & Certificate
  reviews: CourseReview[];
  certificate: Certificate | null;
  hasUserReviewed: boolean;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Progress Calculations
  completedLessons: number;
  totalLessons: number;
  overallProgress: number;
}

export interface LearningWorkflowActions {
  // Step 1: Initialize the learning environment
  initializeLearning: (courseId: string) => Promise<boolean>;
  setCourseData: (course: Course) => void;
  
  // Step 2: Progress tracking
  trackLessonProgress: (lessonId: number, timeSpent?: number, progressPercentage?: number) => Promise<LessonProgress | null>;
  markLessonCompleted: (lessonId: number) => Promise<boolean>;
  
  // Step 3: Course completion
  updateCourseProgress: () => Promise<Enrollment | null>;
  
  // Step 4: Review submission
  submitReview: (rating: number, title: string, comment: string) => Promise<CourseReview | null>;
  
  // Step 5: Certificate generation
  generateCertificate: () => Promise<Certificate | null>;
  
  // Utility functions
  getLessonProgress: (lessonId: number) => LessonProgress | null;
  findCurrentLessonIndex: () => number;
  refreshData: () => Promise<void>;
}

export function useLearningWorkflow(): [LearningWorkflowState, LearningWorkflowActions] {
  const { user, refreshUser } = useAuth();
  
  const [state, setState] = useState<LearningWorkflowState>({
    course: null,
    enrollment: null,
    lessons: [],
    lessonProgresses: [],
    reviews: [],
    certificate: null,
    hasUserReviewed: false,
    loading: false,
    error: null,
    completedLessons: 0,
    totalLessons: 0,
    overallProgress: 0,
  });

  const updateState = useCallback((updates: Partial<LearningWorkflowState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const calculateProgress = useCallback((lessons: Lesson[], progresses: LessonProgress[]) => {
    const totalLessons = lessons.length;
    const completedLessons = progresses.filter(p => p.isCompleted).length;
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    return { totalLessons, completedLessons, overallProgress };
  }, []);

  // Step 1: Initialize Learning Environment
  const initializeLearning = useCallback(async (courseId: string): Promise<boolean> => {
    if (!user) {
      updateState({ error: 'User not authenticated' });
      return false;
    }

    // Ensure user has documentId - refresh if missing
    let currentUser = user;
    if (!currentUser.documentId) {
      console.log('🔄 User missing documentId, refreshing user data...');
      const refreshedUser = await refreshUser();
      if (!refreshedUser || !refreshedUser.documentId) {
        updateState({ error: 'Unable to get user document ID' });
        return false;
      }
      currentUser = refreshedUser;
    }

    try {
      updateState({ loading: true, error: null });
      console.log('🎯 STEP 1: Initializing learning environment for course:', courseId);
      console.log('👤 Current user:', { id: currentUser.id, documentId: currentUser.documentId });

      // 1.1: Get course details
      console.log('📚 Step 1.1: Fetching course details');
      const course = await courseService.getCourseById(courseId);
      if (!course) {
        updateState({ error: 'Course not found', loading: false });
        return false;
      }
      console.log('✅ Course fetched:', { id: course.id, title: course.title });

      // 1.2: Check enrollment status
      console.log('🎫 Step 1.2: Checking enrollment status');
      const enrollment = await courseService.checkEnrollmentStatus(course.documentId.toString());
      if (!enrollment) {
        updateState({ error: 'Not enrolled in this course', loading: false });
        return false;
      }
      console.log('✅ Enrollment verified:', { enrollment, id: enrollment.id, progress: enrollment.progress });

      // 1.3: Extract lessons
      console.log('📝 Step 1.3: Processing lessons');
      const lessons: Lesson[] = Array.isArray(course.lessons) 
        ? course.lessons 
        : (course.lessons as any)?.data || [];
      
      if (lessons.length === 0) {
        updateState({ error: 'This course has no lessons available', loading: false });
        return false;
      }
      console.log('✅ Lessons processed:', lessons.map(l => ({ id: l.id, title: l.title })));

      // 1.4: Get existing lesson progress
      console.log('📊 Step 1.4: Fetching lesson progress');
      const existingProgressRes = await courseService.getLessonProgressForCourse(enrollment.documentId.toString(), lessons?.[0]?.id?.toString());
      const existingProgress: LessonProgress[] = (enrollment as any)?.lessonProgress ?? existingProgressRes;
      console.log('✅ Existing progress fetched:', existingProgress.map(p => ({
        id: p.id,
        lessonId: (p.lesson as any)?.id || (p.lesson as any)?.data?.id,
        isCompleted: p.isCompleted,
        progressPercentage: p.progressPercentage
      })));

      // 1.5: Initialize missing progress entries
      console.log('🔧 Step 1.5: Initializing missing progress entries');
      const progressMap = new Map<number, LessonProgress>();
      console.log("existingProgress", existingProgress)
      // Map existing progress
      existingProgress.forEach(progress => {
        const lessonId = (progress.lesson as any)?.id || (progress.lesson as any)?.data?.id;
        if (lessonId) {
          progressMap.set(lessonId, progress);
        }
      });

      // Create placeholder progress for lessons without existing progress
      const allProgresses: LessonProgress[] = [...existingProgress];
      for (const lesson of lessons) {
        if (!progressMap.has(lesson.id)) {
          const placeholderProgress: LessonProgress = {
            id: 0, // Placeholder ID
            documentId: `placeholder-${lesson.id}`,
            progressPercentage: 0,
            timeSpent: 0,
            isCompleted: false,
            lesson: { data: { id: lesson.id, documentId:lesson.documentId  } } as any,
            enrollment: { data: { id: enrollment.id, documentId:lesson.documentId } } as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            student: { data: { id: user.id } } as any,
          };
          allProgresses.push(placeholderProgress);
          progressMap.set(lesson.id, placeholderProgress);
        }
      }

      // 1.6: Get reviews and certificate
      console.log('⭐ Step 1.6: Fetching reviews and certificate');
      const reviewsResponse = await courseService.getCourseReviews(course.id.toString());
      const reviews = reviewsResponse.data;
      console.log("reviews..", reviews, user)
      const userReview = reviews.find(review => {
        const reviewStudentId = (review.student as any)?.id;
        const reviewStudentDocumentId = (review.student as any)?.documentId;
        return reviewStudentId?.toString() === user?.id?.toString() || 
               reviewStudentDocumentId?.toString() === user?.documentId?.toString();
      });

      let certificate: Certificate | null = null;
      if (enrollment.isCompleted) {
        const certificates = await courseService.getMyCertificates();

        certificate = certificates.find(cert => 
          cert?.course?.documentId?.toString() === courseId &&
          ((cert?.student as any)?.id?.toString() === user?.id || (cert?.student as any)?.documentId?.toString() === user?.documentId)
        ) || null;
      }

      // Calculate progress
      const progressStats = calculateProgress(lessons, allProgresses);

      // Update state with all data
      updateState({
        course,
        enrollment,
        lessons,
        lessonProgresses: allProgresses,
        reviews,
        certificate,
        hasUserReviewed: !!userReview,
        loading: false,
        error: null,
        ...progressStats
      });

      console.log('🎉 STEP 1 COMPLETE: Learning environment initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ STEP 1 FAILED:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Failed to initialize learning environment',
        loading: false 
      });
      return false;
    }
  }, [user, refreshUser, updateState, calculateProgress]);

  // Step 2: Track Lesson Progress
  const trackLessonProgress = useCallback(async (
    lessonId: number, 
    timeSpent: number = 0, 
    progressPercentage: number = 0
  ): Promise<LessonProgress | null> => {
    if (!state.enrollment || !user) return null;

    // Ensure user has documentId
    let currentUser = user;
    if (!currentUser.documentId) {
      const refreshedUser = await refreshUser();
      if (!refreshedUser) return null;
      currentUser = refreshedUser;
    }

    try {
      console.log('📈 STEP 2: Tracking lesson progress', { lessonId, timeSpent, progressPercentage });
      const workflow = await courseService.completeWorkflow();
      const updatedProgress = await workflow.trackLessonProgress(
        state?.enrollment?.documentId.toString(),
        lessonId,
        timeSpent,
        progressPercentage
      );
      // Update local state
      const updatedProgresses = state.lessonProgresses.map(p => {
        // Check multiple ways to match the lesson ID
        const lessonData = p.lesson as any;
        const pLessonId = lessonData?.id || lessonData?.data?.id;
        
        if (pLessonId === lessonId) {
          return updatedProgress;
        }
        return p;
      });
      
      // If not found, add it to the progresses
      const hasExistingProgress = updatedProgresses.some(p => {
        const lessonData = p.lesson as any;
        const pLessonId = lessonData?.id || lessonData?.data?.id;
        return pLessonId === lessonId;
      });
      
      if (!hasExistingProgress) {
        updatedProgresses.push(updatedProgress);
      }
      const progressStats = calculateProgress(state.lessons, updatedProgresses);
      
      updateState({
        lessonProgresses: updatedProgresses,
        ...progressStats
      });
      console.log('✅ STEP 2 COMPLETE: Lesson progress updated');
      return updatedProgress;

    } catch (error) {
      console.error('❌ STEP 2 FAILED:', error);
      updateState({ error: 'Failed to update lesson progress' });
      return null;
    }
  }, [state.enrollment, state.lessons, state.lessonProgresses, user, refreshUser, updateState, calculateProgress]);

  // Step 2b: Mark Lesson as Completed
  const markLessonCompleted = useCallback(async (lessonId: number): Promise<boolean> => {
    const lesson = state.lessons.find(l => l.id === lessonId);
    if (!lesson) return false;

    try {
      console.log('✅ STEP 2b: Marking lesson completed', { lessonId, title: lesson.title });
      const updatedProgress = await trackLessonProgress(lessonId, lesson.duration || 0, 100);
      if (!updatedProgress) return false;
      console.log('🎉 STEP 2b COMPLETE: Lesson marked as completed');
      return true;

    } catch (error) {
      console.error('❌ STEP 2b FAILED:', error);
      return false;
    }
  }, [state.lessons, trackLessonProgress]);

  // Step 3: Update Course Progress
  const updateCourseProgress = useCallback(async (): Promise<Enrollment | null> => {
    if (!state.enrollment) return null;

    try {
      console.log('🎯 STEP 3: Updating course progress');
      const workflow = await courseService.completeWorkflow();
      debugger;
      const updatedEnrollment = await workflow.updateCourseProgress(state.enrollment.documentId.toString());
      updateState({ enrollment: updatedEnrollment });
      console.log('✅ STEP 3 COMPLETE: Course progress updated', {
        progress: updatedEnrollment.progress,
        isCompleted: updatedEnrollment.isCompleted
      });
      return updatedEnrollment;

    } catch (error) {
      debugger;
      console.error('❌ STEP 3 FAILED:', error);
      updateState({ error: 'Failed to update course progress' });
      return null;
    }
  }, [state.enrollment, updateState]);

  // Step 4: Submit Review
  const submitReview = useCallback(async (
    rating: number, 
    title: string, 
    comment: string
  ): Promise<CourseReview | null> => {
    if (!state.course || state.hasUserReviewed) return null;

    try {
      console.log('⭐ STEP 4: Submitting review', { rating, title });
      
      const workflow = await courseService.completeWorkflow();
      const review = await workflow.leaveReview(state.course.id, rating, title, comment);

      updateState({
        reviews: [review, ...state.reviews],
        hasUserReviewed: true
      });

      console.log('✅ STEP 4 COMPLETE: Review submitted');
      return review;

    } catch (error) {
      console.error('❌ STEP 4 FAILED:', error);
      updateState({ error: 'Failed to submit review' });
      return null;
    }
  }, [state.course, state.hasUserReviewed, state.reviews, updateState]);

  // Step 5: Generate Certificate
  const generateCertificate = useCallback(async (): Promise<Certificate | null> => {
    if (!state.enrollment || !state.course || !state.enrollment.isCompleted) return null;

    try {
      console.log('🎓 STEP 5: Generating certificate');
      
      const workflow = await courseService.completeWorkflow();
      const certificate = await workflow.generateCertificate(
        state.enrollment.documentId.toString(),
        state.course.documentId.toString()
      );

      updateState({ certificate });

      console.log('✅ STEP 5 COMPLETE: Certificate generated');
      return certificate;

    } catch (error) {
      console.error('❌ STEP 5 FAILED:', error);
      updateState({ error: 'Failed to generate certificate' });
      return null;
    }
  }, [state.enrollment, state.course, updateState]);

  // Utility Functions
  const getLessonProgress = useCallback((lessonId: number): LessonProgress | null => {
    console.log("🔍 Getting lesson progress for lessonId:", lessonId);
    console.log("📊 Available lesson progresses:", state.lessonProgresses.length);
    
    // Helper function to check if a progress record matches the lesson
    const isMatchingLesson = (p: LessonProgress) => {
      const lessonData = p.lesson?.data ?? p.lesson as any;
      
      // Method 1: Direct ID comparison (numeric)
      if (lessonData?.id === lessonId) {
        return true;
      }
      
      // Method 2: DocumentId comparison 
      if ((lessonData as any)?.documentId || (lessonData?.attributes as any)?.documentId) {
        const docId = (lessonData as any)?.documentId || (lessonData?.attributes as any)?.documentId;
        const docIdAsNumber = parseInt(docId);
        if (!isNaN(docIdAsNumber) && docIdAsNumber === lessonId) {
          return true;
        }
        if (docId === lessonId.toString()) {
          return true;
        }
      }
      
      return false;
    };
    
    // Find all progress records for this lesson
    const matchingProgresses = state.lessonProgresses.filter(isMatchingLesson);
    
    console.log("📊 Matching progresses for lesson", lessonId, ":", matchingProgresses.map(p => ({
      id: p.id,
      progressPercentage: p.progressPercentage,
      isCompleted: p.isCompleted
    })));
    
    if (matchingProgresses.length === 0) {
      console.log("❌ No progress found for lesson", lessonId);
      return null;
    }
    
    // Strategy: First try to find completed progress (100%), otherwise get the highest progress
    const completedProgress = matchingProgresses.find(p => p.progressPercentage === 100 || p.isCompleted);
    
    if (completedProgress) {
      console.log("✅ Found completed progress for lesson", lessonId, ":", completedProgress.progressPercentage + "%");
      return completedProgress;
    }
    
    // If no completed progress, return the one with highest progress percentage
    const highestProgress = matchingProgresses.reduce((highest, current) => 
      (current.progressPercentage || 0) > (highest.progressPercentage || 0) ? current : highest
    );
    
    console.log("📈 Found highest progress for lesson", lessonId, ":", highestProgress.progressPercentage + "%");
    return highestProgress;
  }, [state.lessonProgresses]);

  const findCurrentLessonIndex = useCallback((): number => {
    console.log('🔍 Finding current lesson index...');
    console.log('📚 Available lessons:', state.lessons.map(l => ({ id: l.id, title: l.title })));
    
    const incompleteIndex = state.lessons.findIndex(lesson => {
      const progress = getLessonProgress(lesson.id);
      console.log(`📖 Lesson ${lesson.id} (${lesson.title}):`, {
        hasProgress: !!progress,
        isCompleted: progress?.isCompleted || false
      });
      return !progress || !progress.isCompleted;
    });
    
    const resultIndex = incompleteIndex !== -1 ? incompleteIndex : 0;
    console.log('🎯 Current lesson index determined:', resultIndex);
    return resultIndex;
  }, [state.lessons, getLessonProgress]);

  const refreshData = useCallback(async (): Promise<void> => {
    if (state.course) {
      console.log("state.course", state.course)
      await initializeLearning(state.course.documentId || state.course.id.toString());
    }
  }, [state.course, initializeLearning]);

  const setCourseData = useCallback((course: Course) => {
    console.log('📚 Setting course data for unauthenticated user:', course.title);
    
    // Extract lessons from course data
    const lessons: Lesson[] = Array.isArray(course.lessons) 
      ? course.lessons 
      : (course.lessons as any)?.data || [];
    
    updateState({
      course,
      lessons,
      loading: false,
      error: null,
      totalLessons: lessons.length,
      completedLessons: 0,
      overallProgress: 0
    });
  }, [updateState]);

  const actions: LearningWorkflowActions = {
    initializeLearning,
    setCourseData,
    trackLessonProgress,
    markLessonCompleted,
    updateCourseProgress,
    submitReview,
    generateCertificate,
    getLessonProgress,
    findCurrentLessonIndex,
    refreshData,
  };

  return [state, actions];
}
