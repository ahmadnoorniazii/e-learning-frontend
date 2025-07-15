import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Course } from '@/lib/api-client';

export interface InstructorCourse extends Course {
  enrollmentCount: number;
  revenue: number;
  lastUpdated: string;
}

export interface UseInstructorCoursesReturn {
  courses: InstructorCourse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    averageRating: number;
  };
}

export function useInstructorCourses(): UseInstructorCoursesReturn {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user to filter courses by instructor
      const currentUser = await apiClient.getCurrentUser();
      
      const response = await apiClient.getCourses({
        filters: {
          instructor: { documentId: { $eq: currentUser.documentId } }
        },
        populate: ['thumbnail', 'avatar', 'category', 'lessons', 'reviews'],
        pageSize: 100
      });

      const transformedCourses: InstructorCourse[] = response.data.map(course => {
        // Calculate revenue based on price and enrollment count
        const price = course.price || 0;
        const enrollmentCount = course.enrollmentCount || 0;
        const revenue = price * enrollmentCount;

        return {
          ...course,
          enrollmentCount,
          revenue,
          lastUpdated: course.updatedAt || course.createdAt
        };
      });

      setCourses(transformedCourses);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate stats from courses
  const stats = useMemo(() => {
    if (courses.length === 0) {
      return {
        totalCourses: 0,
        totalStudents: 0,
        totalRevenue: 0,
        averageRating: 0
      };
    }

    const totalStudents = courses.reduce((sum, course) => sum + course.enrollmentCount, 0);
    const totalRevenue = courses.reduce((sum, course) => sum + course.revenue, 0);
    const averageRating = courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length;

    return {
      totalCourses: courses.length,
      totalStudents,
      totalRevenue,
      averageRating
    };
  }, [courses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    stats
  };
} 