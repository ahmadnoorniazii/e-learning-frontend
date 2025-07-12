"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { courseService } from '@/lib/course-service';
import { userProfileService } from '@/lib/user-profile-service';
import { categoriesService } from '@/lib/categories-service';
import { useAuth } from '@/hooks/use-auth';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

export default function TestAPIPage() {
  const { user, isAuthenticated } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  
  // Test registration form
  const [testUser, setTestUser] = useState({
    username: 'testuser' + Date.now(),
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    role: 'student' as 'student' | 'instructor'
  });

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    addResult({ name, status: 'pending', message: 'Running...' });
    
    try {
      const data = await testFn();
      addResult({ 
        name, 
        status: 'success', 
        message: 'Success', 
        data: data?.data || data 
      });
    } catch (error) {
      addResult({ 
        name, 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const testRegistrationEndpoint = async () => {
    setTesting(true);
    clearResults();

    // Test GET endpoint first
    await runTest('GET /api/auth/register-with-role', async () => {
      const response = await fetch('/api/auth/register-with-role');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    });

    // Test POST endpoint with test user
    await runTest('POST /api/auth/register-with-role', async () => {
      const response = await fetch('/api/auth/register-with-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 200)}...`);
      }

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      return result;
    });

    setTesting(false);
  };

  const testPublicEndpoints = async () => {
    setTesting(true);
    clearResults();

    // Test public course access
    await runTest('Public: Get Courses', () => apiClient.getCourses({ page: 1, pageSize: 5 }));
    
    // Test categories
    await runTest('Public: Get Categories', () => categoriesService.getCategories());
    
    // Test tags
    await runTest('Public: Get Tags', () => categoriesService.getTags());

    setTesting(false);
  };

  const testAuthenticatedEndpoints = async () => {
    if (!isAuthenticated || !user) {
      addResult({ 
        name: 'Authentication Check', 
        status: 'error', 
        message: 'User not authenticated' 
      });
      return;
    }

    setTesting(true);
    clearResults();

    // Test authenticated course access
    await runTest('Auth: Get Courses', () => apiClient.getCourses({ page: 1, pageSize: 5 }));
    
    // Test user's enrollments
    await runTest('Auth: Get My Enrollments', () => 
      courseService.getMyEnrollments({ page: 1, pageSize: 10 })
    );
    
    // Test user's progress
    await runTest('Auth: Get My Progress', () => 
      courseService.getLessonProgress({ page: 1, pageSize: 10 })
    );
    
    // Test user's certificates
    await runTest('Auth: Get My Certificates', () => 
      courseService.getMyCertificates()
    );
    
    // Test user profile
    await runTest('Auth: Get My Profile', () => 
      userProfileService.getMyProfile()
    );

    setTesting(false);
  };

  const testInstructorEndpoints = async () => {
    if (!isAuthenticated || !user) {
      addResult({ 
        name: 'Authentication Check', 
        status: 'error', 
        message: 'User not authenticated' 
      });
      return;
    }

    if (user.role !== 'instructor') {
      addResult({ 
        name: 'Role Check', 
        status: 'error', 
        message: 'User is not an instructor' 
      });
      return;
    }

    setTesting(true);
    clearResults();

    // Test instructor course access
    await runTest('Instructor: Get My Courses', () => 
      apiClient.getCourses({ filters: { instructor: Number(user.id) } })
    );
    
    // Test course creation
    await runTest('Instructor: Create Test Course', () => 
      courseService.createCourse({
        title: 'Test Course API',
        description: 'This is a test course created via API',
        price: 99.99,
        difficultyLevel: 'beginner',
        duration: 120,
        isFree: false,
        isPremium: false,
      })
    );

    // Test media upload functionality
    await runTest('Instructor: Test Media Upload', async () => {
      // Create a simple test image file
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#4F46E5';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Test Avatar', 128, 128);
      }
      
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Failed to create test image'));
            return;
          }
          
          try {
            const testFile = new File([blob], 'test-avatar.png', { type: 'image/png' });
            const uploadResult = await courseService.uploadCourseMedia(
              testFile, 
              'Test course avatar', 
              'Generated test avatar for API testing'
            );
            resolve(uploadResult);
          } catch (error) {
            reject(error);
          }
        }, 'image/png');
      });
    });

    // Test course creation with media
    await runTest('Instructor: Create Course with Media', async () => {
      // Create test thumbnail
      const thumbnailCanvas = document.createElement('canvas');
      thumbnailCanvas.width = 1200;
      thumbnailCanvas.height = 630;
      const thumbnailCtx = thumbnailCanvas.getContext('2d');
      if (thumbnailCtx) {
        thumbnailCtx.fillStyle = '#059669';
        thumbnailCtx.fillRect(0, 0, 1200, 630);
        thumbnailCtx.fillStyle = '#FFFFFF';
        thumbnailCtx.font = '48px Arial';
        thumbnailCtx.textAlign = 'center';
        thumbnailCtx.fillText('Course Thumbnail', 600, 315);
      }

      // Create test avatar
      const avatarCanvas = document.createElement('canvas');
      avatarCanvas.width = 256;
      avatarCanvas.height = 256;
      const avatarCtx = avatarCanvas.getContext('2d');
      if (avatarCtx) {
        avatarCtx.fillStyle = '#7C3AED';
        avatarCtx.fillRect(0, 0, 256, 256);
        avatarCtx.fillStyle = '#FFFFFF';
        avatarCtx.font = '24px Arial';
        avatarCtx.textAlign = 'center';
        avatarCtx.fillText('Avatar', 128, 128);
      }

      return new Promise((resolve, reject) => {
        let thumbnailBlob: Blob | null = null;
        let avatarBlob: Blob | null = null;
        let completed = 0;

        const checkComplete = async () => {
          if (++completed === 2 && thumbnailBlob && avatarBlob) {
            try {
              const thumbnailFile = new File([thumbnailBlob], 'test-thumbnail.png', { type: 'image/png' });
              const avatarFile = new File([avatarBlob], 'test-avatar.png', { type: 'image/png' });
              
              const result = await courseService.createCourseWithMedia({
                title: 'Course with Media ' + Date.now(),
                description: 'This course was created with both thumbnail and avatar images',
                shortDescription: 'Complete media test course',
                price: 149.99,
                difficultyLevel: 'intermediate',
                duration: 180,
                isFree: false,
                isPremium: true,
                thumbnailFile,
                avatarFile,
              });
              
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }
        };

        thumbnailCanvas.toBlob((blob) => {
          thumbnailBlob = blob;
          checkComplete();
        }, 'image/png');

        avatarCanvas.toBlob((blob) => {
          avatarBlob = blob;
          checkComplete();
        }, 'image/png');
      });
    });

    setTesting(false);
  };

  const testAdminEndpoints = async () => {
    if (!isAuthenticated || !user) {
      addResult({ 
        name: 'Authentication Check', 
        status: 'error', 
        message: 'User not authenticated' 
      });
      return;
    }

    if (user.role !== 'admin') {
      addResult({ 
        name: 'Role Check', 
        status: 'error', 
        message: 'User is not an admin' 
      });
      return;
    }

    setTesting(true);
    clearResults();

    // Test admin user access
    await runTest('Admin: Get All Users', () => 
      userProfileService.getUserProfiles({ pagination: { page: 1, pageSize: 10 } })
    );
    
    // Test admin course access
    await runTest('Admin: Get All Courses', () => 
      apiClient.getCourses({ page: 1, pageSize: 10 })
    );
    
    // Test admin review access
    await runTest('Admin: Get All Reviews', () => 
      apiClient.getCourseReviews({ page: 1, pageSize: 10 })
    );
    
    // Test admin certificate access
    await runTest('Admin: Get All Certificates', () => 
      apiClient.getCertificates()
    );

    setTesting(false);
  };

  const testMediaUpload = async () => {
    if (!isAuthenticated || !user) {
      addResult({ 
        name: 'Authentication Check', 
        status: 'error', 
        message: 'User not authenticated' 
      });
      return;
    }

    if (user.role !== 'instructor') {
      addResult({ 
        name: 'Role Check', 
        status: 'error', 
        message: 'User is not an instructor' 
      });
      return;
    }

    setTesting(true);
    clearResults();

    // Test basic media upload
    await runTest('Media: Upload Test Image', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Test Upload', 200, 150);
      }
      
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Failed to create test image'));
            return;
          }
          
          try {
            const testFile = new File([blob], 'test-upload.png', { type: 'image/png' });
            const uploadResult = await courseService.uploadCourseMedia(
              testFile, 
              'Test upload image', 
              'Test image for media upload functionality'
            );
            resolve(uploadResult);
          } catch (error) {
            reject(error);
          }
        }, 'image/png');
      });
    });

    // Test avatar and thumbnail workflow
    await runTest('Media: Avatar & Thumbnail Workflow', async () => {
      // This test validates the complete workflow for course media
      const results = {
        avatar: null as any,
        thumbnail: null as any,
      };

      // Create avatar
      const avatarCanvas = document.createElement('canvas');
      avatarCanvas.width = 256;
      avatarCanvas.height = 256;
      const avatarCtx = avatarCanvas.getContext('2d');
      if (avatarCtx) {
        avatarCtx.fillStyle = '#EF4444';
        avatarCtx.fillRect(0, 0, 256, 256);
        avatarCtx.fillStyle = '#FFFFFF';
        avatarCtx.font = '20px Arial';
        avatarCtx.textAlign = 'center';
        avatarCtx.fillText('Course', 128, 120);
        avatarCtx.fillText('Avatar', 128, 145);
      }

      // Create thumbnail
      const thumbnailCanvas = document.createElement('canvas');
      thumbnailCanvas.width = 1200;
      thumbnailCanvas.height = 630;
      const thumbnailCtx = thumbnailCanvas.getContext('2d');
      if (thumbnailCtx) {
        thumbnailCtx.fillStyle = '#10B981';
        thumbnailCtx.fillRect(0, 0, 1200, 630);
        thumbnailCtx.fillStyle = '#FFFFFF';
        thumbnailCtx.font = '48px Arial';
        thumbnailCtx.textAlign = 'center';
        thumbnailCtx.fillText('Course Thumbnail', 600, 300);
        thumbnailCtx.fillText('1200x630', 600, 360);
      }

      return new Promise((resolve, reject) => {
        let completed = 0;
        const totalTasks = 2;

        const checkComplete = () => {
          if (++completed === totalTasks) {
            resolve({
              avatar: results.avatar,
              thumbnail: results.thumbnail,
              message: 'Both avatar and thumbnail uploaded successfully'
            });
          }
        };

        // Upload avatar
        avatarCanvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const avatarFile = new File([blob], 'test-avatar.png', { type: 'image/png' });
              results.avatar = await courseService.uploadCourseMedia(
                avatarFile, 
                'Test course avatar', 
                'Square course icon (256x256)'
              );
              checkComplete();
            } catch (error) {
              reject(error);
            }
          }
        }, 'image/png');

        // Upload thumbnail
        thumbnailCanvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const thumbnailFile = new File([blob], 'test-thumbnail.png', { type: 'image/png' });
              results.thumbnail = await courseService.uploadCourseMedia(
                thumbnailFile, 
                'Test course thumbnail', 
                'Large course cover image (1200x630)'
              );
              checkComplete();
            } catch (error) {
              reject(error);
            }
          }
        }, 'image/png');
      });
    });

    setTesting(false);
  };

  const testUnauthorizedAccess = async () => {
    setTesting(true);
    clearResults();

    addResult({ 
      name: 'Test 401 Auto-Logout', 
      status: 'pending', 
      message: 'Testing automatic logout on 401 error...' 
    });

    try {
      // Make a direct API call with an invalid token to simulate 401
      const invalidToken = 'invalid-test-token-' + Date.now();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${invalidToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        addResult({ 
          name: 'Test 401 Auto-Logout', 
          status: 'success', 
          message: '401 response received. Note: In a real scenario, this would trigger auto-logout and redirect to login page.' 
        });
      } else {
        addResult({ 
          name: 'Test 401 Auto-Logout', 
          status: 'error', 
          message: `Expected 401 but got ${response.status}` 
        });
      }
      
    } catch (error: any) {
      addResult({ 
        name: 'Test 401 Auto-Logout', 
        status: 'error', 
        message: `Network error: ${error.message}` 
      });
    }

    setTesting(false);
  };

  const testImageLoading = () => {
    setTesting(true);
    clearResults();

    addResult({ 
      name: 'Test Image Loading', 
      status: 'pending', 
      message: 'Testing Strapi image loading...' 
    });

    // Test image URLs from the API response
    const testImages = [
      'http://localhost:1337/uploads/medium_course_1_thumbnail_coffee_art_jpg_4323725b87.bin',
      'http://localhost:1337/uploads/small_course_1_thumbnail_coffee_art_jpg_4323725b87.bin',
      'http://localhost:1337/uploads/course_1_thumbnail_coffee_art_jpg_4323725b87.bin'
    ];

    testImages.forEach((imageUrl, index) => {
      const img = new Image();
      img.onload = () => {
        addResult({ 
          name: `Image ${index + 1} Load Test`, 
          status: 'success', 
          message: `✅ Image loaded successfully: ${imageUrl.split('/').pop()}` 
        });
      };
      img.onerror = () => {
        addResult({ 
          name: `Image ${index + 1} Load Test`, 
          status: 'error', 
          message: `❌ Failed to load: ${imageUrl.split('/').pop()}` 
        });
      };
      img.src = imageUrl;
    });

    setTimeout(() => setTesting(false), 3000);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Functionality Test</h1>
        <p className="text-muted-foreground">
          Test all API endpoints and verify permissions are working correctly
        </p>
        
        {isAuthenticated && user && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p><strong>Current User:</strong> {user.name} ({user.email})</p>
            <p><strong>Role:</strong> <Badge variant="outline">{user.role}</Badge></p>
          </div>
        )}
      </div>

      {/* Registration Test Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Role-Based Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={testUser.username}
                onChange={(e) => setTestUser({ ...testUser, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={testUser.email}
                onChange={(e) => setTestUser({ ...testUser, email: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={testUser.password}
                onChange={(e) => setTestUser({ ...testUser, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={testUser.role} onValueChange={(value: 'student' | 'instructor') => setTestUser({ ...testUser, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={testRegistrationEndpoint}
            disabled={testing}
            className="w-full"
          >
            Test Registration with Role
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button 
                onClick={testPublicEndpoints}
                disabled={testing}
                variant="outline"
              >
                Public Endpoints
              </Button>
              
              <Button 
                onClick={testAuthenticatedEndpoints}
                disabled={testing || !isAuthenticated}
                variant="outline"
              >
                Authenticated Endpoints
              </Button>
              
              <Button 
                onClick={testInstructorEndpoints}
                disabled={testing || !isAuthenticated || user?.role !== 'instructor'}
                variant="outline"
              >
                Instructor Endpoints
              </Button>
              
              <Button 
                onClick={testMediaUpload}
                disabled={testing || !isAuthenticated || user?.role !== 'instructor'}
                variant="outline"
              >
                Media Upload
              </Button>
              
              <Button 
                onClick={testAdminEndpoints}
                disabled={testing || !isAuthenticated || user?.role !== 'admin'}
                variant="outline"
              >
                Admin Endpoints
              </Button>
              
              <Button 
                onClick={testUnauthorizedAccess}
                disabled={testing || !isAuthenticated}
                variant="destructive"
              >
                Test 401 Auto-Logout
              </Button>
              
              <Button 
                onClick={testImageLoading}
                disabled={testing}
                variant="secondary"
              >
                Test Image Loading
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Test Results</CardTitle>
          <Button variant="outline" size="sm" onClick={clearResults}>
            Clear Results
          </Button>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tests run yet. Click a test button above to start.
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <Alert 
                  key={index}
                  variant={result.status === 'error' ? 'destructive' : 'default'}
                  className={
                    result.status === 'success' ? 'border-green-200 bg-green-50' :
                    result.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                    ''
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge 
                          variant={
                            result.status === 'success' ? 'default' :
                            result.status === 'error' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {result.status}
                        </Badge>
                        <span className="font-medium">{result.name}</span>
                      </div>
                      <AlertDescription>{result.message}</AlertDescription>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-muted-foreground">
                            View Response Data
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}