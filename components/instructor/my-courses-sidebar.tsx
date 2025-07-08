"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { strapiAPI } from '@/lib/strapi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MyCoursesSidebar() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await strapiAPI.getCoursesByInstructor();

        if (response.data) {
          setCourses(response.data);
        } else {
          setError('No courses found');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
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
    <div className="space-y-4">
      <h2 className="text-xl font-bold">My Courses</h2>
      {courses.length > 0 ? (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg mb-1">{course.attributes.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.attributes.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <Badge variant="outline">{course.attributes.category}</Badge>
                      <Badge variant="secondary">{course.attributes.level}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/instructor/courses/${course.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/instructor/courses/${course.id}/edit`}>
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
          <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-4">Start creating your first course to share your knowledge</p>
          <Button asChild>
            <Link href="/instructor/courses/create">Create Your First Course</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
