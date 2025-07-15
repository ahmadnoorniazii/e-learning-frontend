"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useInstructorCourses } from '@/hooks/use-instructor-courses';
import { Eye, BookOpen, Plus, Star, Users, DollarSign } from 'lucide-react';

export default function InstructorCourses() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { courses, loading, error } = useInstructorCourses();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (isAuthenticated && user && user.role !== 'instructor') {
      router.push('/dashboard/student');
    }
  }, [isAuthenticated, authLoading, user, router]);

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Button asChild>
          <Link href="/instructor/courses/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Link>
        </Button>
      </div>

      {courses.length > 0 ? (
        <div className="grid gap-4">
          {courses.map(course => (
            <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={course.thumbnail?.url} />
                    <AvatarFallback>{course.title[0]}</AvatarFallback>
                  </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg mb-1">{course.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <Badge variant="outline">{course.category?.data?.attributes?.name || 'Uncategorized'}</Badge>
                      <Badge variant="secondary">{course.difficultyLevel || 'Beginner'}</Badge>
                      <span className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrollmentCount} students</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${course.revenue}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating?.toFixed(1) || '0.0'}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                      <Link href={`/courses/${course.documentId}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                  </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/instructor/courses/${course.documentId}/edit`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  </div>
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
