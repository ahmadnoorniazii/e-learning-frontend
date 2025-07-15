"use client";

import { useEffect } from 'react';
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
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/ui/stats-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useStudentDashboard } from '@/hooks/use-student-dashboard';

export default function StudentDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Use the custom dashboard hook
  const {
    inProgressCourses,
    completedCourses,
    certificates,
    stats,
    recentActivity,
    learningGoals,
    loading,
    error,
    refetch
  } = useStudentDashboard();

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
      }
      // No need to fetch data manually - the hook handles it
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Certificate download function
  const downloadCertificate = (cert: any) => {
    if (cert.certificateUrl) {
      // Download using the certificate URL
      const link = document.createElement('a');
      link.href = cert.certificateUrl;
      link.download = `certificate-${cert.certificateId || cert.id}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Generate a certificate download if URL is not available
      try {
        const certificateContent = `
          <html>
            <head>
              <title>Certificate of Completion</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; margin: 0; }
                .certificate { border: 3px solid #2563eb; padding: 40px; max-width: 800px; margin: 0 auto; }
                h1 { color: #2563eb; margin-bottom: 30px; }
                .student-name { font-size: 2em; color: #1e40af; margin: 20px 0; }
                .course-name { font-size: 1.5em; color: #3730a3; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="certificate">
                <h1>Certificate of Completion</h1>
                <p>This certifies that</p>
                <div class="student-name">${user?.username || 'Student'}</div>
                <p>has successfully completed the course</p>
                <div class="course-name">${cert.course?.title || 'Course'}</div>
                <p>Issued on: ${new Date(cert.issuedDate || cert.createdAt).toLocaleDateString()}</p>
                <p>Certificate ID: ${cert.certificateId || cert.id}</p>
                ${cert.verificationCode ? `<p>Verification Code: ${cert.verificationCode}</p>` : ''}
              </div>
            </body>
          </html>
        `;
        
        const blob = new Blob([certificateContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate-${cert.certificateId || cert.id}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating certificate download:', error);
        alert('Error downloading certificate. Please try again.');
      }
    }
  };

  // Helper function to get proper thumbnail URL
  const getThumbnailUrl = (thumbnail: any) => {
    console.log('🖼️ Processing student dashboard thumbnail:', thumbnail);
    
    if (!thumbnail) {
      console.log('⚠️ No thumbnail found for student dashboard course');
      return 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    
    console.log('📸 Thumbnail object:', thumbnail);
    
    const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    
    // Check if it's a Strapi media object with formats (priority: medium > small > thumbnail)
    if (thumbnail.formats) {
      if (thumbnail.formats.medium) {
        const url = `${baseURL}${thumbnail.formats.medium.url}`;
        console.log('✅ Using medium format for student course:', url);
        return url;
      }
      if (thumbnail.formats.small) {
        const url = `${baseURL}${thumbnail.formats.small.url}`;
        console.log('✅ Using small format for student course:', url);
        return url;
      }
      if (thumbnail.formats.thumbnail) {
        const url = `${baseURL}${thumbnail.formats.thumbnail.url}`;
        console.log('✅ Using thumbnail format for student course:', url);
        return url;
      }
    }
    
    // Check if it's a Strapi media object with direct url
    if (thumbnail.url) {
      const url = thumbnail.url.startsWith('http') 
        ? thumbnail.url 
        : `${baseURL}${thumbnail.url}`;
      console.log('✅ Using direct URL for student course:', url);
      return url;
    }
    
    // Check if it's nested in data attribute (Strapi v4/v5 structure)
    if (thumbnail.data && thumbnail.data.attributes) {
      const attrs = thumbnail.data.attributes;
      if (attrs.formats && attrs.formats.medium) {
        const url = `${baseURL}${attrs.formats.medium.url}`;
        console.log('✅ Using nested medium format for student course:', url);
        return url;
      }
      if (attrs.url) {
        const url = attrs.url.startsWith('http') ? attrs.url : `${baseURL}${attrs.url}`;
        console.log('✅ Using nested direct URL for student course:', url);
        return url;
      }
    }
    
    console.log('⚠️ Could not process student course thumbnail, using fallback');
    return 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  // Create stats for the UI components
  const dashboardStats = [
    {
      title: 'Courses Enrolled',
      value: stats.totalEnrollments.toString(),
      description: 'Active learning',
      icon: BookOpen,
      trend: { value: stats.totalEnrollments, isPositive: true },
    },
    {
      title: 'Hours Learned',
      value: `${stats.hoursLearned}h`,
      description: 'Total progress',
      icon: Clock,
      trend: { value: Math.round(stats.hoursLearned), isPositive: true },
    },
    {
      title: 'Certificates',
      value: stats.totalCertificates.toString(),
      description: 'Completed',
      icon: Award,
      trend: { value: stats.totalCertificates, isPositive: true },
    },
    {
      title: 'Average Progress',
      value: `${stats.averageProgress}%`,
      description: 'Across all courses',
      icon: TrendingUp,
      trend: { value: stats.averageProgress, isPositive: true },
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
      <div className="container py-8">
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="progress" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="space-y-4">
                {inProgressCourses.length > 0 ? (
                  <div className="grid gap-4">
                    {inProgressCourses.map((enrollment) => (
                      <Card key={enrollment.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <img
                              src={getThumbnailUrl(enrollment.course.thumbnail)}
                              alt={enrollment.course.title}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1">{enrollment.course.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                by {enrollment.course.instructor?.username || 'Unknown Instructor'}
                              </p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{enrollment.progress}%</span>
                                </div>
                                <ProgressBar value={enrollment.progress} className="w-full" />
                              </div>
                              <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {Math.floor(enrollment.course.duration / 60)}h {enrollment.course.duration % 60}m
                                </span>
                                <span className="flex items-center">
                                  <BookOpen className="h-4 w-4 mr-1" />
                                  {enrollment.course.lessons?.length || 0} lessons
                                </span>
                                <Badge variant="outline">{enrollment.course.difficultyLevel || 'beginner'}</Badge>
                              </div>
                            </div>
                            <Button asChild>
                              <Link href={`/courses/${enrollment.course?.documentId}/learn`}>
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

              <TabsContent value="completed" className="space-y-4">
                {completedCourses.length > 0 ? (
                  <div className="grid gap-4">
                    {completedCourses.map((enrollment) => (
                      <Card key={enrollment.id} className="border-0 shadow-md">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                src={getThumbnailUrl(enrollment.course.thumbnail)}
                                alt={enrollment.course.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <h3 className="font-semibold">{enrollment.course.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Completed on {enrollment.completionDate ? new Date(enrollment.completionDate).toLocaleDateString() : 'Recently'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            <Button variant="outline" asChild>
                                <Link href={`/courses/${enrollment.course.documentId}/learn`}>
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  Review
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
                    <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No completed courses yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete courses to see them here
                    </p>
                    <Button asChild>
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                )}
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
                  {learningGoals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between">
                      <span className="text-sm">{goal.title}</span>
                      <Badge variant="outline">{goal.current}/{goal.target} {goal.unit}</Badge>
                    </div>
                  ))}
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
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        {activity.icon === 'play' && <Play className="h-4 w-4" />}
                        {activity.icon === 'check' && <CheckCircle className="h-4 w-4" />}
                        {activity.icon === 'award' && <Award className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Certificates */}
            {certificates.length > 0 && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Certificates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {certificates.slice(0, 3).map((cert) => (
                    <div key={cert.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{cert.course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(cert.issuedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => downloadCertificate(cert)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {certificates.length > 3 && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="#certificates">View All Certificates</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

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
