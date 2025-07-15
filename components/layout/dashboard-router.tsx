"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/courses', // This covers /courses/[id] and /courses/[id]/learn
  '/faq',
  '/instructors', // Public instructors listing and /instructors/[id]
  '/auth/login',
  '/auth/register',
  '/test-auth',
  '/test-lesson-progress' // This covers /test-lesson-progress/[id]
];

// Function to check if a route is public (handles dynamic routes)
const isRoutePublic = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    // Handle dynamic routes like /courses/[id] and /courses/[id]/learn
    if (route === '/courses') {
      return pathname === '/courses' || 
             pathname.startsWith('/courses/');
    }
    // Handle instructor routes including /instructors/[id]
    if (route === '/instructors') {
      return pathname === '/instructors' || 
             pathname.startsWith('/instructors/');
    }
    // Handle test-api routes including nested pages
    if (route === '/test-api') {
      return pathname === '/test-api' || 
             pathname.startsWith('/test-api/');
    }
    // Handle test-lesson-progress routes including /test-lesson-progress/[id]
    if (route === '/test-lesson-progress') {
      return pathname === '/test-lesson-progress' || 
             pathname.startsWith('/test-lesson-progress/');
    }
    return pathname.startsWith(route);
  });
};

// Define role-based route permissions
const ROLE_PERMISSIONS = {
  admin: {
    allowed: ['/admin', '/dashboard'],
    blocked: ['/instructor', '/dashboard/student']
  },
  instructor: {
    allowed: ['/instructor', '/dashboard'],
    blocked: ['/admin', '/dashboard/student']
  },
  student: {
    allowed: ['/dashboard/student', '/dashboard', '/profile', '/notifications'],
    blocked: ['/admin', '/instructor']
  }
};

export function DashboardRouter() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is public
  const isPublicRoute = () => {
    return isRoutePublic(pathname);
  };

  // Check if user has permission to access current route
  const hasPermission = () => {
    if (!user || !isAuthenticated) return false;

    const userRole = user.role as keyof typeof ROLE_PERMISSIONS;
    const permissions = ROLE_PERMISSIONS[userRole];
    
    if (!permissions) return false;

    // Check if route is explicitly blocked
    const isBlocked = permissions.blocked.some(blockedRoute => 
      pathname.startsWith(blockedRoute)
    );
    
    if (isBlocked) return false;

    // Check if route is explicitly allowed
    const isAllowed = permissions.allowed.some(allowedRoute => 
      pathname.startsWith(allowedRoute)
    );

    return isAllowed;
  };

  // Handle smart dashboard routing based on role
  useEffect(() => {
    if (loading || !isAuthenticated || !user) return;

    // Handle /dashboard route - redirect to appropriate dashboard
    if (pathname === '/dashboard') {
      switch (user.role) {
        case 'admin':
          console.log('🔄 DashboardRouter: Redirecting admin to /admin');
          router.push('/admin');
          break;
        case 'instructor':
          console.log('🔄 DashboardRouter: Redirecting instructor to /instructor');
          router.push('/instructor');
          break;
        case 'student':
        default:
          console.log('🔄 DashboardRouter: Redirecting student to /dashboard/student');
          router.push('/dashboard/student');
          break;
      }
    }
  }, [user, isAuthenticated, loading, pathname, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow access to public routes
  if (isPublicRoute()) {
    return null;
  }

  // Redirect to login if not authenticated and trying to access protected route
  if (!isAuthenticated) {
    console.log('🔄 DashboardRouter: User not authenticated, checking route...', { pathname, isPublic: isPublicRoute() });
    
    // Only redirect if this is not a public route
    if (!isPublicRoute()) {
      console.log('🔄 DashboardRouter: Redirecting unauthenticated user to login');
      router.push('/auth/login');
      return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
  }

  // Block access if user doesn't have permission
  if (!hasPermission()) {
    console.log('� DashboardRouter: Access denied for', user?.role, 'to', pathname);
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Your current role ({user?.role}) doesn&apos;t allow access to this area.
            </p>
            <Button 
              onClick={() => router.back()} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null; // Allow access - render nothing
}