"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
import { Users, Search, Calendar, BookOpen, Star } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrolledCourses: Array<{
    id: string;
    title: string;
    progress: number;
    enrollmentDate: string;
  }>;
  totalEnrollments: number;
  averageProgress: number;
  lastActive: string;
}

export default function InstructorStudents() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const currentUser = await apiClient.getCurrentUser();
      
      // Fetch enrollments for instructor's courses
      const response = await apiClient.getEnrollments({
        filters: {
          course: {
            instructor: { id: { $eq: currentUser.id } }
          }
        },
        populate: ['student', 'course'],
        pageSize: 100
      });

      // Group enrollments by student
      const studentMap = new Map<string, Student>();
      
      response.data.forEach(enrollment => {
        const studentId = (enrollment.student as any)?.id?.toString() || '';
        const studentName = (enrollment.student as any)?.username || 'Unknown Student';
        const studentEmail = (enrollment.student as any)?.email || '';
        
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            id: studentId,
            name: studentName,
            email: studentEmail,
            avatar: (enrollment.student as any)?.avatar?.url,
            enrolledCourses: [],
            totalEnrollments: 0,
            averageProgress: 0,
            lastActive: enrollment.lastAccessedAt || enrollment.enrollmentDate
          });
        }

        const student = studentMap.get(studentId)!;
        student.enrolledCourses.push({
          id: (enrollment.course as any)?.id?.toString() || '',
          title: (enrollment.course as any)?.title || 'Unknown Course',
          progress: enrollment.progress || 0,
          enrollmentDate: enrollment.enrollmentDate
        });
        student.totalEnrollments = student.enrolledCourses.length;
        student.averageProgress = student.enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / student.enrolledCourses.length;
      });

      setStudents(Array.from(studentMap.values()));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (isAuthenticated && user && user.role !== 'instructor') {
      router.push('/dashboard/student');
    } else if (isAuthenticated && user) {
      fetchStudents();
    }
  }, [isAuthenticated, authLoading, user, router, fetchStudents]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="container py-0">
      <h1 className="text-3xl font-bold mb-6">My Students</h1>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Enrollments</p>
                <p className="text-2xl font-bold">
                  {students.reduce((sum, student) => sum + student.totalEnrollments, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">
                  {students.length > 0 
                    ? (students.reduce((sum, student) => sum + student.averageProgress, 0) / students.length).toFixed(1)
                    : '0'
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length > 0 ? (
            <div className="space-y-6">
              {filteredStudents.map((student) => (
                <div key={student.id} className="border rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            {student.totalEnrollments} courses
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium mb-2">Enrolled Courses</h4>
                          <div className="space-y-2">
                            {student.enrolledCourses.map((course) => (
                              <div key={course.id} className="flex items-center justify-between text-sm">
                                <span className="truncate">{course.title}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${course.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs">{course.progress}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Activity</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Last active: {new Date(student.lastActive).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <span>Average progress: {student.averageProgress.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No students found' : 'No students yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Students will appear here once they enroll in your courses'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 