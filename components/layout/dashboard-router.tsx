"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export function DashboardRouter() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      // If not authenticated and trying to access protected routes, redirect to login
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/instructor')) {
        console.log('🔄 DashboardRouter: Redirecting unauthenticated user to login');
        router.push('/auth/login');
      }
      return;
    }

    if (!user) return;

    console.log('🔄 DashboardRouter: Current user role:', user.role, 'Current path:', pathname);

    // Role-based dashboard routing
    const handleDashboardRouting = () => {
      switch (user.role) {
        case 'admin':
          // Admin should go to admin panel
          if (pathname === '/dashboard') {
            console.log('🔄 DashboardRouter: Redirecting admin from /dashboard to /admin');
            router.push('/admin');
          }
          // Prevent admin from accessing student/instructor dashboards
          else if (pathname.startsWith('/instructor') && !pathname.startsWith('/admin')) {
            console.log('🔄 DashboardRouter: Redirecting admin from instructor area to admin');
            router.push('/admin');
          }
          else if (pathname.startsWith('/dashboard/student')) {
            console.log('🔄 DashboardRouter: Redirecting admin from student dashboard to admin');
            router.push('/admin');
          }
          break;

        case 'instructor':
          // Instructor should go to instructor dashboard
          if (pathname === '/dashboard') {
            console.log('🔄 DashboardRouter: Redirecting instructor from /dashboard to /instructor');
            router.push('/instructor');
          }
          // Prevent instructor from accessing admin panel
          else if (pathname.startsWith('/admin')) {
            console.log('🔄 DashboardRouter: Redirecting instructor from admin to instructor dashboard');
            router.push('/instructor');
          }
          else if (pathname.startsWith('/dashboard/student')) {
            console.log('🔄 DashboardRouter: Redirecting instructor from student dashboard to instructor');
            router.push('/instructor');
          }
          break;

        case 'student':
        default:
          // Student should go to student dashboard
          if (pathname.startsWith('/admin')) {
            console.log('🔄 DashboardRouter: Redirecting student from admin to student dashboard');
            router.push('/dashboard/student');
          }
          else if (pathname.startsWith('/instructor')) {
            console.log('🔄 DashboardRouter: Redirecting student from instructor to student dashboard');
            router.push('/dashboard/student');
          }
          else if (pathname === '/dashboard') {
            console.log('🔄 DashboardRouter: Redirecting student from /dashboard to /dashboard/student');
            router.push('/dashboard/student');
          }
          break;
      }
    };

    handleDashboardRouting();
  }, [user, isAuthenticated, loading, pathname, router]);

  return null; // This component doesn't render anything
}