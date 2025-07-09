"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  Calendar,
  Users,
  Star,
  Target,
  CheckCircle,
  Download, // ✅ FIXED: Added missing import
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/ui/stats-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { strapiAPI } from '@/lib/strapi';
import { Course, Certificate } from '@/lib/types';

interface EnrolledCourse extends Course {
  progress: number;
  enrolledAt: string;
}

export default function StudentDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (isAuthenticated && user) {
      if (user.role !== 'student') {
        if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'instructor') {
          router.push('/instructor');
        }
      } else {
        fetchDashboardData();
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [enrollmentsResponse, certificatesResponse] = await Promise.all([
        strapiAPI.getEnrollments({ userId: user.id }),
        strapiAPI.getCertificates({ userId: user.id }),
      ]);

      const enrolledCoursesData: EnrolledCourse[] = [];

      if (enrollmentsResponse.data) {
        for (const enrollment of enrollmentsResponse.data) {
          const courseId = enrollment.attributes.course?.data?.id;
          if (courseId) {
            try {
              const [courseResponse, progressResponse] = await Promise.all([
                strapiAPI.getCourseById(courseId.toString()),
                strapiAPI.getProgress(user.id, courseId.toString()),
              ]);

              if (courseResponse.data) {
                const courseData = courseResponse.data;
                const progressData = progressResponse.data?.[0];

                const course: EnrolledCourse = {
                  id: courseData.id.toString(),
                  title: courseData.attributes.title,
                  description: courseData.attributes.description,
                  instructor: {
                    id: courseData.attributes.instructor?.data?.id.toString() || '1',
                    name: courseData.attributes.instructor?.data?.attributes.username || 'Unknown Instructor',
                    email: courseData.attributes.instructor?.data?.attributes.email || '',
                    role: 'instructor',
                    avatar: courseData.attributes.instructor?.data?.attributes.profile?.avatar?.url,
                    createdAt: new Date().toISOString(),
                  },
                  thumbnail:
                    courseData.attributes.thumbnail?.data?.attributes.url ||
                    'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
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
                  lessons:
                    courseData.attributes.lessons?.data?.map((lesson) => ({
                      id: lesson.id.toString(),
                      title: lesson.attributes.title,
                      description: lesson.attributes.description,
                      duration: lesson.attributes.duration,
                      order: lesson.attributes.order,
                      videoUrl: lesson.attributes.videoUrl,
                    })) || [],
                  progress: progressData?.attributes.percentage || 0,
                  enrolledAt: enrollment.attributes.enrolledAt,
                };

                enrolledCoursesData.push(course);
              }
            } catch (err) {
              console.error('Error fetching course data:', err);
            }
          }
        }
      }

      setEnrolledCourses(enrolledCoursesData);

      const certificatesData: Certificate[] =
        certificatesResponse.data?.map((cert) => ({
          id: cert.id.toString(),
          courseId: cert.attributes.course?.data?.id.toString() || '',
          courseName: cert.attributes.course?.data?.attributes.title || 'Unknown Course',
          userId: user.id,
          userName: user.name,
          completedAt: cert.attributes.issuedAt,
          certificateUrl: cert.attributes.certificateUrl || '#',
        })) || [];

      setCertificates(certificatesData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Courses Enrolled',
      value: enrolledCourses.length.toString(),
      description: 'Active learning',
      icon: BookOpen,
      trend: { value: enrolledCourses.length, isPositive: true },
    },
    {
      title: 'Hours Learned',
      value: `${Math.round(
        enrolledCourses.reduce((total, course) => total + (course.duration * course.progress) / 100, 0) / 60
      )}h`,
      description: 'Total progress',
      icon: Clock,
      trend: { value: 15, isPositive: true },
    },
    {
      title: 'Certificates',
      value: certificates.length.toString(),
      description: 'Completed',
      icon: Award,
      trend: { value: certificates.length, isPositive: true },
    },
    {
      title: 'Average Progress',
      value: `${Math.round(
        enrolledCourses.reduce((total, course) => total + course.progress, 0) / (enrolledCourses.length || 1)
      )}%`,
      description: 'Across all courses',
      icon: TrendingUp,
      trend: { value: 5, isPositive: true },
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'student') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
        {/* Header */}
      <div className="border-b bg-white">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
              <p className="text-muted-foreground">Continue your learning journey</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild>
                <Link href="/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="progress" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="space-y-4">
                {enrolledCourses.filter(course => course.progress < 100).length > 0 ? (
                  <div className="grid gap-4">
                    {enrolledCourses
                      .filter(course => course.progress < 100)
                      .map((course) => (
                        <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                  by {course.instructor.name}
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{course.progress}%</span>
                                  </div>
                                  <Progress value={course.progress} className="w-full" />
                                </div>
                                <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                                  <span className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {Math.floor(course.duration / 60)}h {course.duration % 60}m
                                  </span>
                                  <span className="flex items-center">
                                    <BookOpen className="h-4 w-4 mr-1" />
                                    {course.lessonsCount} lessons
                                  </span>
                                  <Badge variant="outline">{course.level}</Badge>
                                </div>
                              </div>
                              <Button asChild>
                                <Link href={`/courses/${course.id}/learn`}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Continue
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses in progress</h3>
                    <p className="text-muted-foreground mb-4">
                      Start learning by enrolling in a course
                    </p>
                    <Button asChild>
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed">
                {certificates.length > 0 ? (
                  <div className="grid gap-4">
                    {certificates.map((cert) => (
                      <Card key={cert.id} className="border-0 shadow-md">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Award className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{cert.courseName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Completed on {new Date(cert.completedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download Certificate
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete courses to earn certificates
                    </p>
                    <Button asChild>
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="wishlist">
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses in wishlist</h3>
                  <p className="text-muted-foreground mb-4">
                    Browse courses and add them to your wishlist
                  </p>
                  <Button asChild>
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Goals */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Learning Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Complete 3 courses this month</span>
                    <Badge variant="outline">1/3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Study 20 hours this week</span>
                    <Badge variant="outline">12/20h</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Earn 2 certificates</span>
                    <Badge variant="outline">{certificates.length}/2</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrolledCourses.slice(0, 3).map((course, index) => (
                  <div key={course.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <Play className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Enrolled in course</p>
                      <p className="text-xs text-muted-foreground">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(course.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {enrolledCourses.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recommended Courses */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Recommended</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover new courses based on your interests
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/courses">Explore Courses</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
