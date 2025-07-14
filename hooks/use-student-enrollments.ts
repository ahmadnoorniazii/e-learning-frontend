import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Enrollment, Course } from '@/lib/api-client';

export interface StudentEnrollment {
  id: number;
  documentId: string;
  enrollmentDate: string;
  completionDate?: string;
  progress: number;
  isCompleted: boolean;
  lastAccessedAt?: string;
  certificateIssued: boolean;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentAmount: number;
  course: {
    id: number;
    title: string;
    description: string;
    slug: string;
    shortDescription?: string;
    thumbnail?: { url: string };
    price: number;
    difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    rating: number;
    instructor: {
      id: number;
      username: string;
      email: string;
    };
    category?: {
      id: number;
      name: string;
      slug: string;
    };
    lessons?: Array<{
      id: number;
      title: string;
      duration: number;
      sortOrder?: number;
    }>;
  };
}

interface UseStudentEnrollmentsOptions {
  userId?: number;
  includeCompleted?: boolean;
  populate?: string[];
}

interface UseStudentEnrollmentsReturn {
  enrollments: StudentEnrollment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // Derived data
  inProgressCourses: StudentEnrollment[];
  completedCourses: StudentEnrollment[];
  totalEnrollments: number;
  averageProgress: number;
  totalHoursLearned: number;
}

export function useStudentEnrollments(options: UseStudentEnrollmentsOptions = {}): UseStudentEnrollmentsReturn {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { userId, includeCompleted = true } = options;
  
  // Memoize the populate array to prevent unnecessary re-renders
  const populate = useMemo(() => 
    options.populate || ['course', 'course.instructor', 'course.category', 'course.lessons'], 
    [options.populate ? JSON.stringify(options.populate) : null]
  );

  const fetchEnrollments = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setEnrollments([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getEnrollments({
        filters: {
          student: { id: { $eq: userId } }
        },
        populate,
        pageSize: 100
      });

      const processedEnrollments: StudentEnrollment[] = response.data.map((enrollment) => {
        // Handle populated course data - when populated, course comes directly without .data wrapper
        const courseData = (enrollment.course as any)?.attributes || enrollment.course as any;
        
        return {
          id: enrollment.id,
          documentId: enrollment.documentId,
          enrollmentDate: enrollment.enrollmentDate,
          completionDate: enrollment.completionDate,
          progress: enrollment.progress,
          isCompleted: enrollment.isCompleted,
          lastAccessedAt: enrollment.lastAccessedAt,
          certificateIssued: enrollment.certificateIssued,
          paymentStatus: enrollment.paymentStatus,
          paymentAmount: enrollment.paymentAmount,
          course: {
            id: (enrollment.course as any)?.id || (enrollment.course as any)?.data?.id,
            documentId: (enrollment.course as any)?.documentId || (enrollment.course as any)?.data?.documentId,
            title: courseData?.title || 'Unknown Course',
            description: courseData?.description || '',
            slug: courseData?.slug || '',
            shortDescription: courseData?.shortDescription,
            thumbnail: courseData?.thumbnail,
            price: courseData?.price || 0,
            difficultyLevel: courseData?.difficultyLevel,
            duration: courseData?.duration || 0,
            rating: courseData?.rating || 0,
            instructor: {
              id: courseData?.instructor?.id || courseData?.instructor?.data?.id || 0,
              username: courseData?.instructor?.username || courseData?.instructor?.data?.attributes?.username || 'Unknown',
              email: courseData?.instructor?.email || courseData?.instructor?.data?.attributes?.email || ''
            },
            category: courseData?.category ? {
              id: courseData.category.id || courseData.category.data?.id,
              name: courseData.category.name || courseData.category.data?.attributes?.name || 'Uncategorized',
              slug: courseData.category.slug || courseData.category.data?.attributes?.slug || 'uncategorized'
            } : undefined,
            lessons: (courseData?.lessons || courseData?.lessons?.data || []).map((lesson: any) => ({
              id: lesson.id,
              title: lesson.title || 'Untitled Lesson',
              duration: lesson.duration || 0,
              sortOrder: lesson.sortOrder
            }))
          }
        };
      });

      // Filter based on completion status if specified
      const filteredEnrollments = includeCompleted 
        ? processedEnrollments 
        : processedEnrollments.filter(e => !e.isCompleted);

      setEnrollments(filteredEnrollments);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch enrollments');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [userId, includeCompleted, populate]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Derived data calculations
  const inProgressCourses = enrollments.filter(e => !e.isCompleted && e.progress < 100);
  const completedCourses = enrollments.filter(e => e.isCompleted || e.progress >= 100);
  
  const totalEnrollments = enrollments.length;
  
  const averageProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;
  
  const totalHoursLearned = enrollments.reduce((total, enrollment) => {
    const courseHours = enrollment.course.duration / 60; // Convert minutes to hours
    const progressRatio = enrollment.progress / 100;
    return total + (courseHours * progressRatio);
  }, 0);

  return {
    enrollments,
    loading,
    error,
    refetch: fetchEnrollments,
    inProgressCourses,
    completedCourses,
    totalEnrollments,
    averageProgress,
    totalHoursLearned: Math.round(totalHoursLearned * 10) / 10 // Round to 1 decimal place
  };
}
