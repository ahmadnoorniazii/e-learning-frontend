"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Play, Clock, Users, Star, BookOpen, Award, Calendar, 
  ChevronDown, ChevronRight, Lock, Check, ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Course, Review } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import courseService from '@/lib/course-service';
import { Enrollment } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface CourseContentProps {
  course: Course;
  courseReviews: Review[];
  numericCourseId?: string; // Strapi numeric ID for API calls
}

export function CourseContent({ course, courseReviews, numericCourseId }: CourseContentProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEnrollmentStatus = useCallback(async () => {
    if (!user) return;
    
    try {
      const courseIdForAPI = numericCourseId || course.id;
      console.log('🔍 Checking enrollment status:', {
        userId: user.id,
        courseId: course.id,
        numericCourseId,
        courseIdForAPI
      });
      
      const enrollmentData = await courseService.checkEnrollmentStatus(courseIdForAPI);
      
      console.log('📋 Enrollment response:', enrollmentData);
      
      if (enrollmentData) {
        setEnrollment(enrollmentData);
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  }, [user, course.id, numericCourseId]);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkEnrollmentStatus();
    }
  }, [isAuthenticated, user, checkEnrollmentStatus]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Use the new learning workflow
      const workflow = await courseService.completeWorkflow();
      debugger;
      const courseIdForAPI = course?.id?.toString();
      const enrollmentData = await workflow.enrollInCourse(courseIdForAPI, course.price);
      
      setEnrollment(enrollmentData);
      
      toast({
        title: "Successfully Enrolled!",
        description: "You can now start learning this course.",
      });

      // Redirect to learning page
      router.push(`/courses/${course.id}/learn`);
    } catch (err) {
      console.error('Error enrolling:', err);
      setError('Failed to enroll in course. Please try again.');
      toast({
        title: "Enrollment Failed",
        description: "There was an error enrolling in the course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = () => {
    router.push(`/courses/${course.id}/learn`);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isEnrolled = !!enrollment;
  const progressPercentage = enrollment?.progress || 0;

  // Debug enrollment status
  console.log('🔍 Enrollment Status Debug:', {
    enrollment,
    isEnrolled,
    progressPercentage,
    user: user?.id,
    course: course.id
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {course.category}
                </Badge>
                <h1 className="text-4xl font-bold leading-tight">
                  {course.title}
                </h1>
                <p className="text-xl text-blue-100">
                  {course.description}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white/20">
                    <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                    <AvatarFallback className="bg-white/20 text-white">
                      {course.instructor.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{course.instructor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-blue-200">({course.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course?.studentsCount?.toLocaleString()} students</span>
                </div>
              </div>

              {isEnrolled && enrollment && (
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Your Progress</span>
                      <span className="text-sm">{progressPercentage}% complete</span>
                    </div>
                    <ProgressBar value={progressPercentage} className="bg-white/20" />
                    <p className="text-sm text-blue-200 mt-2">
                      0 of {course.lessons.length} lessons completed
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Course Preview/Enrollment Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  {course.thumbnail && (
                    <div className="aspect-video bg-black/20 rounded-lg mb-4 relative overflow-hidden">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="lg" className="rounded-full h-16 w-16" variant="secondary">
                          <Play className="h-6 w-6 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </div>
                    </div>

                    {error && (
                      <Alert className="bg-red-500/20 border-red-500/50">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      {isEnrolled ? (
                        <Button 
                          onClick={handleStartLearning}
                          className="w-full bg-white text-blue-600 hover:bg-white/90"
                          size="lg"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleEnroll}
                          disabled={loading}
                          className="w-full bg-white text-blue-600 hover:bg-white/90"
                          size="lg"
                        >
                          {loading ? (
                            "Enrolling..."
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {course.price === 0 ? 'Enroll for Free' : 'Enroll Now'}
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <Separator className="bg-white/20" />

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration} minutes total</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.lessonsCount} lessons</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="h-4 w-4" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4" />
                        <span>Lifetime access</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="container py-16">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What you&#39;ll learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.objectives?.split('\n').map((objective, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{objective}</span>
                        </div>
                      )) || (
                        <p>Course objectives will be added soon.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {course.prerequisites?.split('\n').map((requirement, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                          <span>{requirement}</span>
                        </div>
                      )) || (
                        <p>No prerequisites required.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p>{course.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Skill Level</span>
                      <Badge variant="outline">{course.level}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Students</span>
                      <span>{course.studentsCount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language</span>
                      <span>English</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated</span>
                      <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {course.tags && course.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <p className="text-muted-foreground">
                  {course.lessonsCount} lessons • {course.duration} minutes total
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {course.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="border-b last:border-b-0">
                      <div className="p-4 flex items-center justify-between hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{lesson.title}</h4>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {isEnrolled ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {lesson.duration} min
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meet Your Instructor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                    <AvatarFallback>
                      {course.instructor.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{course.instructor.name}</h3>
                    <p className="text-muted-foreground">{course.instructor.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {courseReviews.length > 0 ? (
                  courseReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={review.userAvatar} alt={review.userName} />
                            <AvatarFallback>
                              {review.userName.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{review.userName}</h4>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No reviews yet. Be the first to review this course!</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Course Rating</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{course.rating}</div>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-5 w-5 ${i < Math.floor(course.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground mt-2">
                        {course.reviewsCount} reviews
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
