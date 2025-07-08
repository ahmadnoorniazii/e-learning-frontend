"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Settings, 
  CheckCircle, Circle, BookOpen, Award, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { strapiAPI } from '@/lib/strapi';
import { Course, Lesson, Progress as ProgressType } from '@/lib/types';

export default function LearnPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<ProgressType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchCourseData();
  }, [isAuthenticated, params.id]);

  const fetchCourseData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [courseResponse, progressResponse, enrollmentResponse] = await Promise.all([
        strapiAPI.getCourseById(params.id),
        strapiAPI.getProgress(user.id, params.id),
        strapiAPI.getEnrollments({ userId: user.id, courseId: params.id })
      ]);

      // Check if user is enrolled
      if (!enrollmentResponse.data || enrollmentResponse.data.length === 0) {
        router.push(`/courses/${params.id}`);
        return;
      }

      if (!courseResponse.data) {
        setError('Course not found');
        return;
      }

      const courseData = courseResponse.data;
      const transformedCourse: Course = {
        id: courseData.id.toString(),
        title: courseData.attributes.title,
        description: courseData.attributes.description,
        instructor: {
          id: courseData.attributes.instructor?.data?.id.toString() || '1',
          name: courseData.attributes.instructor?.data?.attributes.username || 'Unknown Instructor',
          email: courseData.attributes.instructor?.data?.attributes.email || '',
          role: 'instructor' as const,
          avatar: courseData.attributes.instructor?.data?.attributes.profile?.avatar?.url,
          createdAt: new Date().toISOString()
        },
        thumbnail: courseData.attributes.thumbnail?.data?.attributes.url || '',
        price: courseData.attributes.price,
        category: courseData.attributes.category,
        level: courseData.attributes.level as 'beginner' | 'intermediate' | 'advanced',
        duration: courseData.attributes.duration || 0,
        lessonsCount: courseData.attributes.lessons?.data?.length || 0,
        studentsCount: courseData.attributes.studentsCount || 0,
        rating: courseData.attributes.rating || 0,
        reviewsCount: courseData.attributes.reviewsCount || 0,
        tags: courseData.attributes.tags || [],
        createdAt: courseData.attributes.createdAt,
        lessons: courseData.attributes.lessons?.data?.map(lesson => ({
          id: lesson.id.toString(),
          title: lesson.attributes.title,
          description: lesson.attributes.description,
          duration: lesson.attributes.duration,
          order: lesson.attributes.order,
          videoUrl: lesson.attributes.videoUrl
        })).sort((a, b) => a.order - b.order) || []
      };

      setCourse(transformedCourse);

      // Set current lesson (first incomplete or first lesson)
      let currentLessonIndex = 0;
      if (progressResponse.data && progressResponse.data.length > 0) {
        const progressData = progressResponse.data[0];
        const completedLessons = progressData.attributes.completedLessons || [];
        setProgress({
          courseId: params.id,
          completedLessons,
          totalLessons: transformedCourse.lessons.length,
          percentage: progressData.attributes.percentage || 0,
          lastAccessed: progressData.attributes.lastAccessed
        });

        // Find first incomplete lesson
        const incompleteIndex = transformedCourse.lessons.findIndex(
          lesson => !completedLessons.includes(lesson.id)
        );
        if (incompleteIndex !== -1) {
          currentLessonIndex = incompleteIndex;
        }
      } else {
        // Create initial progress
        await strapiAPI.createProgress({
          user: user.id,
          course: params.id,
          completedLessons: [],
          percentage: 0,
          lastAccessed: new Date().toISOString()
        });
        setProgress({
          courseId: params.id,
          completedLessons: [],
          totalLessons: transformedCourse.lessons.length,
          percentage: 0,
          lastAccessed: new Date().toISOString()
        });
      }

      if (transformedCourse.lessons[currentLessonIndex]) {
        setCurrentLesson(transformedCourse.lessons[currentLessonIndex]);
      }
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!progress || !user || !course) return;

    try {
      const updatedCompletedLessons = [...progress.completedLessons];
      if (!updatedCompletedLessons.includes(lessonId)) {
        updatedCompletedLessons.push(lessonId);
      }

      const newPercentage = Math.round((updatedCompletedLessons.length / course.lessons.length) * 100);

      // Update progress in Strapi
      const progressResponse = await strapiAPI.getProgress(user.id, params.id);
      if (progressResponse.data && progressResponse.data.length > 0) {
        await strapiAPI.updateProgress(progressResponse.data[0].id, {
          completedLessons: updatedCompletedLessons,
          percentage: newPercentage,
          lastAccessed: new Date().toISOString()
        });
      }

      // Update local state
      setProgress({
        ...progress,
        completedLessons: updatedCompletedLessons,
        percentage: newPercentage,
        lastAccessed: new Date().toISOString()
      });

      // Check if course is completed
      if (newPercentage === 100) {
        await generateCertificate();
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const generateCertificate = async () => {
    if (!user || !course) return;

    try {
      const certificateId = `CERT-${course.id}-${user.id}-${Date.now()}`;
      await strapiAPI.createCertificate({
        certificateId,
        user: user.id,
        course: course.id,
        issuedAt: new Date().toISOString(),
        status: 'issued'
      });
    } catch (err) {
      console.error('Error generating certificate:', err);
    }
  };

  const goToNextLesson = () => {
    if (!course || !currentLesson) return;

    const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < course.lessons.length - 1) {
      setCurrentLesson(course.lessons[currentIndex + 1]);
    }
  };

  const goToPreviousLesson = () => {
    if (!course || !currentLesson) return;

    const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex > 0) {
      setCurrentLesson(course.lessons[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error || 'Course not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="font-semibold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {currentLesson?.title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {progress && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Progress:</span>
                  <Progress value={progress.percentage} className="w-32" />
                  <span className="text-sm font-medium">{progress.percentage}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-t-lg relative">
                  {currentLesson?.videoUrl ? (
                    <video
                      className="w-full h-full rounded-t-lg"
                      controls
                      src={currentLesson.videoUrl}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Video content will be available here</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{currentLesson?.title}</h2>
                    <Button
                      onClick={() => currentLesson && markLessonComplete(currentLesson.id)}
                      disabled={progress?.completedLessons.includes(currentLesson?.id || '')}
                      variant={progress?.completedLessons.includes(currentLesson?.id || '') ? "outline" : "default"}
                    >
                      {progress?.completedLessons.includes(currentLesson?.id || '') ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">
                    {currentLesson?.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={goToPreviousLesson}
                      disabled={!course.lessons.find(l => l.order < (currentLesson?.order || 0))}
                    >
                      <SkipBack className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    <Button
                      onClick={goToNextLesson}
                      disabled={!course.lessons.find(l => l.order > (currentLesson?.order || 0))}
                    >
                      Next
                      <SkipForward className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Course Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {course.lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(lesson)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentLesson?.id === lesson.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {progress?.completedLessons.includes(lesson.id) ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {index + 1}. {lesson.title}
                        </p>
                        <p className="text-xs opacity-75">
                          {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {progress?.percentage === 100 && (
              <Card className="border-0 shadow-lg mt-6">
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Congratulations!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You've completed this course and earned a certificate!
                  </p>
                  <Button className="w-full">
                    <Award className="h-4 w-4 mr-2" />
                    View Certificate
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}