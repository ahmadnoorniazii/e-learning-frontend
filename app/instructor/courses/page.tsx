"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { strapiAPI } from '@/lib/strapi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { Eye, BookOpen, Plus } from 'lucide-react';

export default function InstructorCourses() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    level: string;
    studentsCount: number;
    revenue: number;
    rating: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (isAuthenticated && user) {
      fetchCourses();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || typeof user.id !== 'number') {
        throw new Error('Invalid user data');
      }

      const response = await strapiAPI.getCoursesByInstructor(user.id);

      if (response.data) {
        setCourses(response.data.map(course => ({
          id: course.id,
          title: course.attributes.title,
          description: course.attributes.description,
          category: course.attributes.category,
          level: course.attributes.level,
          studentsCount: course.attributes.studentsCount,
          revenue: course.attributes.price * course.attributes.studentsCount,
          rating: course.attributes.rating,
        })));
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-8">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>
      {courses.length > 0 ? (
        <div className="grid gap-4">
          {courses.map(course => (
            <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback>{course.title[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg mb-1">{course.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <Badge variant="outline">{course.category}</Badge>
                      <Badge variant="secondary">{course.level}</Badge>
                      <span className="flex items-center space-x-1">
                        <span>{course.studentsCount} students</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>${course.revenue}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>{course.rating.toFixed(1)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/instructor/courses/${course.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-4">
            Start creating your first course to share your knowledge
          </p>
          <Button asChild>
            <Link href="/instructor/courses/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Course
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
