"use client";

import { useState, useEffect } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Course, Review, Progress as ProgressType } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { strapiAPI } from '@/lib/strapi';

interface CourseContentProps {
  course: Course;
  courseReviews: Review[];
}

export function CourseContent({ course, courseReviews }: CourseContentProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState<ProgressType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkEnrollmentStatus();
    }
  }, [isAuthenticated, user, course.id]);

  const checkEnrollmentStatus = async () => {
    if (!user) return;
    
    try {
      const enrollmentResponse = await strapiAPI.getEnrollments({
        userId: user.id,
        courseId: course.id
      });
      
      if (enrollmentResponse.data && enrollmentResponse.data.length > 0) {
        setIsEnrolled(true);
        
        // Fetch progress
        const progressResponse = await strapiAPI.getProgress(user.id, course.id);
        if (progressResponse.data && progressResponse.data.length > 0) {
          const progressData = progressResponse.data[0];
          setProgress({
            courseId: course.id,
            completedLessons: progressData.attributes.completedLessons || [],
            totalLessons: course.lessons.length,
            percentage: progressData.attributes.percentage || 0,
            lastAccessed: progressData.attributes.lastAccessed
          });
        }
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Create enrollment
      await strapiAPI.createEnrollment({
        user: user.id,
        course: course.id,
        enrolledAt: new Date().toISOString(),
        status: 'active'
      });

      // Create initial progress
      await strapiAPI.createProgress({
        user: user.id,
        course: course.id,
        completedLessons: [],
        percentage: 0,
        lastAccessed: new Date().toISOString()
      });

      // Create order record
      await strapiAPI.createOrder({
        user: user.id,
        course: course.id,
        amount: course.price,
        status: 'completed',
        paymentMethod: 'card'
      });

      setIsEnrolled(true);
      setProgress({
        courseId: course.id,
        completedLessons: [],
        totalLessons: course.lessons.length,
        percentage: 0,
        lastAccessed: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError('Failed to enroll in course. Please try again.');
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
        <div className="container py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  {course.category}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {course.title}
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  {course.description}
                </p>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                    <AvatarFallback>
                      {course.instructor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{course.instructor.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-blue-200">({course.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-5 w-5" />
                  <span>{course.studentsCount.toLocaleString()} students</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(course.duration)} total</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.lessonsCount} lessons</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>Certificate included</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Lifetime access</span>
                </div>
              </div>

              {isEnrolled && progress && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Your Progress</span>
                    <span className="text-sm">{progress.percentage}% complete</span>
                  </div>
                  <Progress value={progress.percentage} className="bg-white/20" />
                  <p className="text-sm text-blue-200 mt-2">
                    {progress.completedLessons.length} of {progress.totalLessons} lessons completed
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-0 shadow-2xl">
                <div className="relative">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    width={400}
                    height={225}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-t-lg">
                    <Button size="lg" className="bg-white text-black hover:bg-white/90">
                      <Play className="h-5 w-5 mr-2" />
                      Preview Course
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold mb-4">
                    ${course.price}
                  </div>
                  
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {isEnrolled ? (
                    <Button 
                      className="w-full mb-4" 
                      size="lg"
                      onClick={handleStartLearning}
                    >
                      Continue Learning
                    </Button>
                  ) : (
                    <>
                      <Button 
                        className="w-full mb-2" 
                        size="lg"
                        onClick={handleEnroll}
                        disabled={loading}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        {loading ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                      <Button variant="outline" className="w-full mb-4" size="lg">
                        Add to Wishlist
                      </Button>
                    </>
                  )}

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level:</span>
                      <Badge variant="outline">{course.level}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formatDuration(course.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lessons:</span>
                      <span>{course.lessonsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language:</span>
                      <span>English</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Certificate:</span>
                      <span>Yes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="container py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>What you'll learn</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Master the fundamentals and advanced concepts</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Build real-world projects from scratch</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Learn industry best practices and patterns</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Get personalized feedback from instructors</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md mt-6">
                  <CardHeader>
                    <CardTitle>Course Description</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {course.description}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Skills you'll gain</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="curriculum" className="mt-8">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <p className="text-muted-foreground">
                  {course.lessonsCount} lessons • {formatDuration(course.duration)} total length
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <Collapsible key={lesson.id}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between h-auto p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{lesson.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDuration(lesson.duration)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isEnrolled ? (
                            progress?.completedLessons.includes(lesson.id) ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                      <p className="text-sm text-muted-foreground ml-11">
                        {lesson.description}
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor" className="mt-8">
            <Card className="border-0 shadow-md">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                    <AvatarFallback className="text-2xl">
                      {course.instructor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{course.instructor.name}</h3>
                    <p className="text-muted-foreground mb-4">Senior Software Engineer & Educator</p>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      With years of experience in the industry, our instructor has worked with 
                      leading tech companies and has taught thousands of students worldwide. Their passion 
                      for education and deep technical expertise makes complex topics accessible and engaging.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            <div className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="text-3xl font-bold">{course.rating}</div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.floor(course.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      Based on {course.reviewsCount} reviews
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {courseReviews.map((review) => (
                    <div key={review.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.userAvatar} alt={review.userName} />
                          <AvatarFallback>
                            {review.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{review.userName}</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}