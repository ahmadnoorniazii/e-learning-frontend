"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useInstructorAnalytics } from '@/hooks/use-instructor-analytics';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star, 
  BookOpen,
  Calendar,
  Target
} from 'lucide-react';

export default function InstructorAnalytics() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { analytics, loading, error } = useInstructorAnalytics();

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

  if (!analytics) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No analytics data available</h3>
          <p className="text-muted-foreground">
            Analytics will appear here once you have courses and students
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{analytics.totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{analytics.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Course Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.coursePerformance.map((course) => (
                <div key={course.courseId} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div>
                    <h4 className="font-medium">{course.courseTitle}</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.enrollmentCount} students • {course.completionRate.toFixed(1)}% completion
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${course.revenue}</div>
                    <div className="flex items-center space-x-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {analytics.coursePerformance.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No course performance data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Enrollments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{enrollment.studentName}</p>
                    <p className="text-sm text-muted-foreground">{enrollment.courseTitle}</p>
                  </div>
                  <Badge variant="outline">
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
              {analytics.recentEnrollments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No recent enrollments
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Monthly Revenue</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.monthlyRevenue.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="font-medium">{month.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((month.revenue / Math.max(...analytics.monthlyRevenue.map(m => m.revenue))) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">${month.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 