import { useEffect, useState } from 'react';
import { categoriesService } from '@/lib/categories-service';
import { CourseCategory } from '@/lib/api-client';

export function useCategories() {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    categoriesService.getCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, loading, error };
}
