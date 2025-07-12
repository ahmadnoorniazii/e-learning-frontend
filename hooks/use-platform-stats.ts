import { useEffect, useState } from 'react';
import { courseService } from '@/lib/course-service';

export interface PlatformStats {
  students: number;
  instructors: number;
  courses: number;
  completionRate: number;
}

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    // You may want to replace this with a real API call for platform stats
    Promise.all([
      courseService.getPublicCourses({ page: 1, pageSize: 1 }),
      courseService.getFeaturedCourses(),
    ])
      .then(([allCourses, featuredCourses]) => {
        if (!isMounted) return;
        // Fallback: count students/instructors/courses from available data
        const courses = allCourses.data || [];
        const students = courses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0);
        const instructors = new Set(courses.map(c => c.instructor?.data?.id)).size;
        setStats({
          students,
          instructors,
          courses: courses.length,
          completionRate: 94, // Placeholder, replace with real stat if available
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return { stats, loading, error };
}
