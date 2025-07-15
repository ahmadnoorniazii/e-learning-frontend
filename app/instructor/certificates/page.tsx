"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
import { Award, Download, Calendar, User, BookOpen } from 'lucide-react';

interface Certificate {
  id: string;
  certificateId: string;
  verificationCode: string;
  issuedDate: string;
  certificateUrl?: string;
  isValid: boolean;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  course: {
    id: string;
    title: string;
  };
  enrollment: {
    id: string;
    completionDate: string;
  };
}

export default function InstructorCertificates() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const currentUser = await apiClient.getCurrentUser();
      
      // Fetch certificates for instructor's courses
      const response = await apiClient.getCertificates({
        filters: {
          course: {
            instructor: { id: { $eq: currentUser.id } }
          },
          isValid: { $eq: true }
        },
        populate: ['student', 'course', 'enrollment'],
        pageSize: 100
      });

      const transformedCertificates: Certificate[] = response.data.map(certificate => ({
        id: certificate.id.toString(),
        certificateId: certificate.certificateId,
        verificationCode: certificate.verificationCode,
        issuedDate: certificate.issuedDate,
        certificateUrl: certificate.certificateUrl,
        isValid: certificate.isValid,
        student: {
          id: (certificate.student as any)?.id?.toString() || '',
          name: (certificate.student as any)?.username || 'Unknown Student',
          email: (certificate.student as any)?.email || '',
          avatar: (certificate.student as any)?.avatar?.url
        },
        course: {
          id: (certificate.course as any)?.id?.toString() || '',
          title: (certificate.course as any)?.title || 'Unknown Course'
        },
        enrollment: {
          id: (certificate.enrollment as any)?.id?.toString() || '',
          completionDate: (certificate.enrollment as any)?.completionDate || certificate.issuedDate
        }
      }));

      setCertificates(transformedCertificates);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch certificates');
      setCertificates([]);
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
      fetchCertificates();
    }
  }, [isAuthenticated, authLoading, user, router, fetchCertificates]);

  const downloadCertificate = (certificate: Certificate) => {
    if (certificate.certificateUrl) {
      // Download using the certificate URL
      const link = document.createElement('a');
      link.href = certificate.certificateUrl;
      link.download = `certificate-${certificate.certificateId || certificate.id}.pdf`;
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
                <div class="student-name">${certificate.student?.data?.attributes?.username || 'Student'}</div>
                <p>has successfully completed the course</p>
                <div class="course-name">${certificate.course?.data?.attributes?.title || 'Course'}</div>
                <p>Issued on: ${new Date(certificate.issuedDate || certificate.createdAt).toLocaleDateString()}</p>
                <p>Certificate ID: ${certificate.certificateId || certificate.id}</p>
                ${certificate.verificationCode ? `<p>Verification Code: ${certificate.verificationCode}</p>` : ''}
              </div>
            </body>
          </html>
        `;
        
        const blob = new Blob([certificateContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate-${certificate.certificateId || certificate.id}.html`;
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
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Issued Certificates</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Certificates</p>
                <p className="text-2xl font-bold">{certificates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Students</p>
                <p className="text-2xl font-bold">
                  {new Set(certificates.map(c => c.student.id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Courses</p>
                <p className="text-2xl font-bold">
                  {new Set(certificates.map(c => c.course.id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle>All Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length > 0 ? (
            <div className="space-y-6">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="border rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={certificate.student.avatar} />
                      <AvatarFallback>
                        {certificate.student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{certificate.student.name}</h3>
                          <p className="text-sm text-muted-foreground">{certificate.student.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={certificate.isValid ? "default" : "destructive"}>
                            {certificate.isValid ? 'Valid' : 'Invalid'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium mb-2">Course Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <span>{certificate.course.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Completed: {new Date(certificate.enrollment.completionDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4 text-muted-foreground" />
                              <span>Issued: {new Date(certificate.issuedDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Certificate Info</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">ID:</span> {certificate.certificateId}
                            </div>
                            <div>
                              <span className="font-medium">Verification Code:</span> {certificate.verificationCode}
                            </div>
                            <div className="pt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => downloadCertificate(certificate)}
                                className="w-full"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Certificate
                              </Button>
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
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No certificates issued yet</h3>
              <p className="text-muted-foreground">
                Certificates will appear here once students complete your courses
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 