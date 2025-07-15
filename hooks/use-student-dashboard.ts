import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useStudentEnrollments } from './use-student-enrollments';
import { useStudentCertificates } from './use-student-certificates';

export interface DashboardStats {
  totalEnrollments: number;
  hoursLearned: number;
  totalCertificates: number;
  averageProgress: number;
  inProgressCount: number;
  completedCount: number;
}

export interface RecentActivity {
  id: string;
  type: 'enrollment' | 'completion' | 'certificate';
  title: string;
  subtitle: string;
  date: string;
  icon: 'play' | 'check' | 'award';
}

export interface LearningGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

interface UseStudentDashboardReturn {
  // Data
  enrollments: ReturnType<typeof useStudentEnrollments>['enrollments'];
  inProgressCourses: ReturnType<typeof useStudentEnrollments>['inProgressCourses'];
  completedCourses: ReturnType<typeof useStudentEnrollments>['completedCourses'];
  certificates: ReturnType<typeof useStudentCertificates>['certificates'];
  
  // Computed stats
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  learningGoals: LearningGoal[];
  
  // Loading states
  loading: boolean;
  enrollmentsLoading: boolean;
  certificatesLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  refetch: () => Promise<void>;
}

export function useStudentDashboard(): UseStudentDashboardReturn {
  const { user, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Only fetch data if user is authenticated and has an ID
  const shouldFetch = isAuthenticated && user?.id;

  // Memoize options to prevent unnecessary re-renders
  const enrollmentsOptions = useMemo(() => ({
    userId: shouldFetch ? parseInt(user.id.toString()) : undefined,
    includeCompleted: true,
    populate: ['course', 'course.instructor', 'course.category', 'course.lessons', 'course.thumbnail', 'course.avatar']
  }), [shouldFetch, user?.id]);

  const certificatesOptions = useMemo(() => ({
    userId: shouldFetch ? parseInt(user.id.toString()) : undefined,
    populate: ['course', 'student']
  }), [shouldFetch, user?.id]);

  // Fetch enrollments and certificates
  const {
    enrollments,
    inProgressCourses,
    completedCourses,
    totalEnrollments,
    averageProgress,
    totalHoursLearned,
    loading: enrollmentsLoading,
    error: enrollmentsError,
    refetch: refetchEnrollments
  } = useStudentEnrollments(enrollmentsOptions);

  const {
    certificates,
    totalCertificates,
    loading: certificatesLoading,
    error: certificatesError,
    refetch: refetchCertificates
  } = useStudentCertificates(certificatesOptions);

  // Combine errors
  useEffect(() => {
    if (enrollmentsError || certificatesError) {
      setError(enrollmentsError || certificatesError);
    } else {
      setError(null);
    }
  }, [enrollmentsError, certificatesError]);

  // Computed dashboard stats
  const stats: DashboardStats = useMemo(() => ({
    totalEnrollments,
    hoursLearned: totalHoursLearned,
    totalCertificates,
    averageProgress,
    inProgressCount: inProgressCourses.length,
    completedCount: completedCourses.length
  }), [totalEnrollments, totalHoursLearned, totalCertificates, averageProgress, inProgressCourses.length, completedCourses.length]);

  // Recent activity (last 10 activities)
  const recentActivity: RecentActivity[] = useMemo(() => {
    const activities: RecentActivity[] = [];

    // Add enrollment activities
    enrollments.forEach(enrollment => {
      activities.push({
        id: `enrollment-${enrollment.id}`,
        type: 'enrollment',
        title: 'Enrolled in course',
        subtitle: enrollment.course.title,
        date: enrollment.enrollmentDate,
        icon: 'play'
      });

      // Add completion activities
      if (enrollment.isCompleted && enrollment.completionDate) {
        activities.push({
          id: `completion-${enrollment.id}`,
          type: 'completion',
          title: 'Completed course',
          subtitle: enrollment.course.title,
          date: enrollment.completionDate,
          icon: 'check'
        });
      }
    });

    // Add certificate activities
    certificates.forEach(certificate => {
      activities.push({
        id: `certificate-${certificate.id}`,
        type: 'certificate',
        title: 'Earned certificate',
        subtitle: certificate.course.title,
        date: certificate.issuedDate,
        icon: 'award'
      });
    });

    // Sort by date (most recent first) and take top 10
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [enrollments, certificates]);

  // Learning goals (mock data - could be made configurable)
  const learningGoals: LearningGoal[] = useMemo(() => [
    {
      id: 'courses-month',
      title: 'Complete courses this month',
      target: 3,
      current: completedCourses.filter(course => {
        const completionDate = new Date(course.completionDate || course.enrollmentDate);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return completionDate.getMonth() === currentMonth && completionDate.getFullYear() === currentYear;
      }).length,
      unit: 'courses'
    },
    {
      id: 'hours-week',
      title: 'Study hours this week',
      target: 20,
      current: Math.min(Math.round(totalHoursLearned), 20), // Simplified - would need weekly tracking
      unit: 'hours'
    },
    {
      id: 'certificates',
      title: 'Earn certificates',
      target: 2,
      current: totalCertificates,
      unit: 'certificates'
    }
  ], [completedCourses, totalHoursLearned, totalCertificates]);

  // Refetch all data
  const refetch = async () => {
    await Promise.all([
      refetchEnrollments(),
      refetchCertificates()
    ]);
  };

  const loading = !shouldFetch ? false : (enrollmentsLoading || certificatesLoading);

  return {
    // Data
    enrollments,
    inProgressCourses,
    completedCourses,
    certificates,
    
    // Computed
    stats,
    recentActivity,
    learningGoals,
    
    // Loading states
    loading,
    enrollmentsLoading,
    certificatesLoading,
    
    // Error state
    error,
    
    // Actions
    refetch
  };
}
