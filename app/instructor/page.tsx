"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, Users, DollarSign, TrendingUp, Plus, Eye, Edit, 
  BarChart3, Calendar, Star, Award, Clock, Target, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/ui/stats-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { strapiAPI } from '@/lib/strapi';
import { Course } from '@/lib/types';

interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
}

interface InstructorCourse extends Course {
  enrollmentCount: number;
  revenue: number;
  lastUpdated: string;
}

export default function InstructorDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [stats, setStats] = useState<InstructorStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructorData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const coursesResponse = await strapiAPI.getCoursesByInstructor(user.id);

      if (coursesResponse.data) {
        console.log('courses', courses, coursesResponse.data, "please");   
        const transformedCourses = coursesResponse.data.map(course => {
          const attributes = course.attributes;
          
          // Handle description field
          const description = typeof attributes.description === 'string' 
            ? attributes.description 
            : Array.isArray(attributes.description)
              ? (attributes.description as any[]).map((item: any) => 
                  Array.isArray(item.children) 
                    ? item.children.map((child: any) => child.text || '').join('') 
                    : ''
                ).join('\n')
              : '';
          
          // Calculate revenue based on price and students count
          const price = attributes.price || 0;
          const studentsCount = attributes.studentsCount || 0;
          const revenue = price * studentsCount;
          
          return {
            id: course.id.toString(),
            title: attributes.title || '',
            description: description,
            instructor: {
              id: attributes.instructor?.data?.id?.toString() || '1',
              name: attributes.instructor?.data?.attributes?.username || 'Unknown Instructor',
              email: attributes.instructor?.data?.attributes?.email || '',
              role: 'instructor',
              avatar: attributes.instructor?.data?.attributes?.profile?.avatar?.url,
              createdAt: attributes.createdAt || new Date().toISOString()
            },
            thumbnail: attributes.thumbnail?.data?.attributes?.url,
            price: price,
            category: attributes.category || '',
            level: attributes.level || '',
            duration: attributes.duration || 0,
            lessonsCount: attributes.lessons?.data?.length || 0,
            studentsCount: studentsCount,
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
            })) || [],
            // InstructorCourse specific fields
            enrollmentCount: studentsCount,
            revenue: revenue,
            lastUpdated: attributes.updatedAt || attributes.createdAt || new Date().toISOString()
          } as InstructorCourse;
        });
        
        console.log('courses______', coursesResponse.data, "please", transformedCourses); 
        setCourses(transformedCourses);
        
        // Safely calculate stats by handling possible undefined values
        setStats({
          totalCourses: transformedCourses.length,
          totalStudents: transformedCourses.reduce((sum, course) => sum + (course.studentsCount || 0), 0),
          totalRevenue: transformedCourses.reduce((sum, course) => sum + (course.revenue || 0), 0),
          averageRating: transformedCourses.length > 0 
            ? transformedCourses.reduce((sum, course) => sum + (course.rating || 0), 0) / transformedCourses.length 
            : 0
        });
      }
    } catch (err) {
      console.error('Error fetching instructor data:', err);
      setError('Failed to load instructor data. Please check your Strapi backend connection.');
    } finally {
      setLoading(false);
    }
  }, [user, courses]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (isAuthenticated && user) {
      if (user.role !== 'instructor') {
        // Redirect non-instructors to appropriate dashboard
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard/student');
        }
      } else {
        fetchInstructorData();
      }
    }
  }, [isAuthenticated, authLoading, user, router, fetchInstructorData]);
console.log('courses',courses);

  const instructorStats = [
    {
      title: 'Total Courses',
      value: stats.totalCourses.toString(),
      description: 'Published courses',
      icon: BookOpen,
      trend: { value: stats.totalCourses, isPositive: true }
    },
    {
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      description: 'Enrolled students',
      icon: Users,
      trend: { value: 15, isPositive: true }
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      description: 'From course sales',
      icon: DollarSign,
      trend: { value: 23, isPositive: true }
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      description: 'Course ratings',
      icon: Star,
      trend: { value: 5, isPositive: true }
    }
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'instructor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
              <p className="text-muted-foreground">Manage your courses and track your teaching performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild>
                <Link href="/instructor/courses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {instructorStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="courses" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="courses">My Courses</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Your Courses</h3>
                  <Button asChild>
                    <Link href="/instructor/courses/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Course
                    </Link>
                  </Button>
                </div>

                {courses.length > 0 ? (
                  <div className="grid gap-4">
                    {courses.map((course) => (
                      <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                              <Image
                                src={course.thumbnail || '/placeholder-course.jpg'}
                                alt={course.title}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-lg mb-1">{course.title}</h4>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {course.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm">
                                <Badge variant="outline">{course.category}</Badge>
                                <Badge variant="secondary">{course.level}</Badge>
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
                                  <span>{course?.rating}</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/courses/${course.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/instructor/courses/${course.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-1" />
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
              </TabsContent>

              <TabsContent value="analytics">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Course Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courses.map((course) => (
                        <div key={course.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                          <div>
                            <h4 className="font-medium">{course.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {course.enrollmentCount} students • {course.reviewsCount} reviews
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${course.revenue}</div>
                            <div className="flex items-center space-x-1 text-sm">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{course.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {courses.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          No course data available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                      <p className="text-muted-foreground">
                        Reviews from your students will appear here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/instructor/courses/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Course
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/instructor/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/instructor/students">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Students
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Teaching Goals */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Teaching Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Create 2 courses this quarter</span>
                    <Badge variant="outline">{stats.totalCourses}/2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reach 100 students</span>
                    <Badge variant="outline">{stats.totalStudents}/100</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Maintain 4.5+ rating</span>
                    <Badge variant="outline">{stats.averageRating.toFixed(1)}/5.0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Recent activity will appear here
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Tips */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Instructor Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">Create engaging content</p>
                    <p className="text-blue-700">Use videos, quizzes, and interactive elements</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">Respond to students</p>
                    <p className="text-green-700">Quick responses improve course ratings</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900">Update regularly</p>
                    <p className="text-purple-700">Keep your courses current and relevant</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}