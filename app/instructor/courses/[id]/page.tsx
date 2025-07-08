"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { strapiAPI } from '@/lib/strapi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CourseDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Course ID is missing');
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await strapiAPI.getCourseById(id);

        if (response.data) {
          setCourse(response.data);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

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
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{course.attributes.title}</h1>
      <div className="grid gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={course.attributes.thumbnail?.data?.attributes.url} alt={course.attributes.title} />
                <AvatarFallback>{course.attributes.title[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-lg mb-1">{course.attributes.title}</h4>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.attributes.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <Badge variant="outline">{course.attributes.category}</Badge>
                  <Badge variant="secondary">{course.attributes.level}</Badge>
                  <span className="flex items-center space-x-1">
                    <span>{course.attributes.studentsCount} students</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>${course.attributes.price}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>{course.attributes.rating.toFixed(1)}</span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
