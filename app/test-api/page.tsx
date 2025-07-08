"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { strapiAPI } from '@/lib/strapi';
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
    await runTest('Public: Get Courses', () => strapiAPI.getCourses({ page: 1, pageSize: 5 }));
    
    // Test public reviews access
    await runTest('Public: Get Reviews', () => strapiAPI.getReviews({ page: 1, pageSize: 5 }));

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
    await runTest('Auth: Get Courses', () => strapiAPI.getCourses({ page: 1, pageSize: 5 }));
    
    // Test user's enrollments
    await runTest('Auth: Get My Enrollments', () => 
      strapiAPI.getEnrollments({ userId: user.id, page: 1, pageSize: 10 })
    );
    
    // Test user's progress
    await runTest('Auth: Get My Progress', () => 
      strapiAPI.getProgress(user.id)
    );
    
    // Test user's certificates
    await runTest('Auth: Get My Certificates', () => 
      strapiAPI.getCertificates({ userId: user.id })
    );
    
    // Test user's orders
    await runTest('Auth: Get My Orders', () => 
      strapiAPI.getOrders({ filters: { user: user.id } })
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
      strapiAPI.getCourses({ filters: { instructor: user.id } })
    );
    
    // Test course creation
    await runTest('Instructor: Create Test Course', () => 
      strapiAPI.createCourse({
        title: 'Test Course API',
        description: 'This is a test course created via API',
        price: 99.99,
        category: 'Web Development',
        level: 'beginner',
        publicationStatus: 'draft',
        duration: 120,
        tags: ['test', 'api'],
        instructor: user.id,
        studentsCount: 0,
        rating: 0,
        reviewsCount: 0,
        lessons: [
          {
            title: 'Test Lesson 1',
            description: 'First test lesson',
            duration: 30,
            order: 1
          },
          {
            title: 'Test Lesson 2',
            description: 'Second test lesson',
            duration: 45,
            order: 2
          }
        ]
      })
    );

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
      strapiAPI.getUsers({ page: 1, pageSize: 10 })
    );
    
    // Test admin course access
    await runTest('Admin: Get All Courses', () => 
      strapiAPI.getCourses({ page: 1, pageSize: 10 })
    );
    
    // Test admin order access
    await runTest('Admin: Get All Orders', () => 
      strapiAPI.getOrders({ page: 1, pageSize: 10 })
    );
    
    // Test admin review access
    await runTest('Admin: Get All Reviews', () => 
      strapiAPI.getReviews({ page: 1, pageSize: 10 })
    );
    
    // Test admin certificate access
    await runTest('Admin: Get All Certificates', () => 
      strapiAPI.getCertificates({ page: 1, pageSize: 10 })
    );

    setTesting(false);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                onClick={testAdminEndpoints}
                disabled={testing || !isAuthenticated || user?.role !== 'admin'}
                variant="outline"
              >
                Admin Endpoints
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