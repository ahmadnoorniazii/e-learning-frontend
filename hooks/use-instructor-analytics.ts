import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface InstructorAnalytics {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  coursePerformance: Array<{
    courseId: string;
    courseTitle: string;
    enrollmentCount: number;
    revenue: number;
    rating: number;
    completionRate: number;
  }>;
  recentEnrollments: Array<{
    id: string;
    studentName: string;
    courseTitle: string;
    enrollmentDate: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface UseInstructorAnalyticsReturn {
  analytics: InstructorAnalytics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useInstructorAnalytics(): UseInstructorAnalyticsReturn {
  const [analytics, setAnalytics] = useState<InstructorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const currentUser = await apiClient.getCurrentUser();
      
      // Fetch instructor's courses
      const coursesResponse = await apiClient.getCourses({
        filters: {
          instructor: { documentId: { $eq: currentUser.documentId } }
        },
        populate: ['thumbnail', 'category', 'reviews'],
        pageSize: 100
      });

      // Fetch enrollments for instructor's courses
      const enrollmentsResponse = await apiClient.getEnrollments({
        filters: {
          course: {
            instructor: { documentId: { $eq: currentUser.documentId } }
          }
        },
        populate: ['course', 'student'],
        pageSize: 100
      });

      // Calculate analytics from the data
      const courses = coursesResponse.data;
      const enrollments = enrollmentsResponse.data;

      // Calculate course performance
      const coursePerformance = courses.map(course => {
        const courseEnrollments = enrollments.filter(
          enrollment => (enrollment.course as any)?.id === course.id
        );
        
        const enrollmentCount = courseEnrollments.length;
        const revenue = (course.price || 0) * enrollmentCount;
        const completedEnrollments = courseEnrollments.filter(
          enrollment => enrollment.isCompleted
        ).length;
        const completionRate = enrollmentCount > 0 
          ? (completedEnrollments / enrollmentCount) * 100 
          : 0;

        return {
          courseId: course.id.toString(),
          courseTitle: course.title,
          enrollmentCount,
          revenue,
          rating: course.rating || 0,
          completionRate
        };
      });

      // Calculate total stats
      const totalCourses = courses.length;
      const totalStudents = enrollments.length;
      const totalRevenue = coursePerformance.reduce((sum, course) => sum + course.revenue, 0);
      const averageRating = courses.length > 0 
        ? courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length 
        : 0;

      // Get recent enrollments
      const recentEnrollments = enrollments
        .slice(0, 10)
        .map(enrollment => ({
          id: enrollment.id.toString(),
          studentName: (enrollment.student as any)?.username || 'Unknown Student',
          courseTitle: (enrollment.course as any)?.title || 'Unknown Course',
          enrollmentDate: enrollment.enrollmentDate
        }));

      // Mock monthly revenue data (in a real app, this would come from the backend)
      const monthlyRevenue = [
        { month: 'Jan', revenue: totalRevenue * 0.1 },
        { month: 'Feb', revenue: totalRevenue * 0.15 },
        { month: 'Mar', revenue: totalRevenue * 0.2 },
        { month: 'Apr', revenue: totalRevenue * 0.25 },
        { month: 'May', revenue: totalRevenue * 0.3 },
        { month: 'Jun', revenue: totalRevenue * 0.35 }
      ];

      setAnalytics({
        totalCourses,
        totalStudents,
        totalRevenue,
        averageRating,
        coursePerformance,
        recentEnrollments,
        monthlyRevenue
      });

    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
} 