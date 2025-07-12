import { useEffect, useState } from 'react';
import { courseService } from '@/lib/course-service';
import { Course } from '@/lib/api-client';

export function useFeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    courseService.getFeaturedCourses()
      .then((data) => {
        if (isMounted) setCourses(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load featured courses');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return { courses, loading, error };
}
