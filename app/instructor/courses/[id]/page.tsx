"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { strapiAPI } from '@/lib/strapi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Course } from '@/lib/types';

export default function CourseDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Course ID is missing');
      setLoading(false);
      return;
    }

    const courseId = Array.isArray(id) ? id[0] : id;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await strapiAPI.getCourseById(courseId);

        if (response.data) {
          const { attributes } = response.data;
          
          // Map StrapiCourse to Course type
          const mappedCourse: Course = {
            id: response.data.id.toString(),
            title: attributes.title || '',
            description: typeof attributes.description === 'string' 
              ? attributes.description 
              : Array.isArray(attributes.description)
                ? (attributes.description as any[]).map((item: any) => 
                    Array.isArray(item.children) 
                      ? item.children.map((child: any) => child.text || '').join('') 
                      : ''
                  ).join('\n')
                : '',
            instructor: {
              id: attributes.instructor?.data?.id?.toString() || '1',
              name: attributes.instructor?.data?.attributes?.username || 'Unknown Instructor',
              email: attributes.instructor?.data?.attributes?.email || '',
              role: 'instructor',
              avatar: attributes.instructor?.data?.attributes?.profile?.avatar?.url,
              createdAt: attributes.createdAt || new Date().toISOString()
            },
            thumbnail: attributes.thumbnail?.data?.attributes?.url,
            price: attributes.price || 0,
            category: attributes.category || '',
            level: attributes.level || '',
            duration: attributes.duration || 0,
            lessonsCount: attributes.lessons?.data?.length || 0,
            studentsCount: attributes.studentsCount || 0,
            rating: attributes.rating || 0,
            reviewsCount: attributes.reviewsCount || 0,
            tags: attributes.tags || [],
            createdAt: attributes.createdAt || new Date().toISOString(),
            lessons: attributes.lessons?.data?.map((lesson: any) => ({
              id: lesson.id.toString(),
              title: lesson.attributes.title || '',
              description: lesson.attributes.description || '',
              duration: lesson.attributes.duration || 0,
              order: lesson.attributes.order || 0,
              videoUrl: lesson.attributes.videoUrl
            })) || []
          };
          
          setCourse(mappedCourse);
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
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : course ? (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
            <div className="space-x-3">
              <Button variant="outline" onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}>
                Edit Course
              </Button>
              <Button variant="outline" onClick={() => router.push(`/instructor/courses/${course.id}/lessons`)}>
                Manage Lessons
              </Button>
            </div>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={course.thumbnail} alt={course.title} />
                    <AvatarFallback>{course.title[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">{course.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{course.category}</Badge>
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-3">
                      <span>{course.studentsCount ?? 0} students</span>
                      <span>•</span>
                      <span>${course.price}</span>
                      <span>•</span>
                      <span>{course.rating?.toFixed(1) ?? '0.0'} rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
