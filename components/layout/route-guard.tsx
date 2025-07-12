"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

export function RouteGuard({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  fallbackPath = '/auth/login' 
}: RouteGuardProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      // Don't redirect, just block access
      return;
    }
  }, [user, isAuthenticated, loading, allowedRoles, requireAuth, fallbackPath, router]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check role permissions
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
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
            <div className="space-y-2">
              <Button 
                onClick={() => router.back()} 
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button 
                onClick={() => router.push('/')} 
                variant="secondary" 
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience components for common use cases
export const AdminOnly = ({ children }: { children: ReactNode }) => (
  <RouteGuard allowedRoles={['admin']}>{children}</RouteGuard>
);

export const InstructorOnly = ({ children }: { children: ReactNode }) => (
  <RouteGuard allowedRoles={['instructor']}>{children}</RouteGuard>
);

export const StudentOnly = ({ children }: { children: ReactNode }) => (
  <RouteGuard allowedRoles={['student']}>{children}</RouteGuard>
);

export const AuthenticatedOnly = ({ children }: { children: ReactNode }) => (
  <RouteGuard requireAuth={true}>{children}</RouteGuard>
);
