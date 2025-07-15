"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { InstructorSidebar } from '@/components/instructor/instructor-sidebar';
import { InstructorHeader } from '@/components/instructor/instructor-header';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'instructor')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'instructor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-row">
      <InstructorSidebar />
      <div className="flex-1 flex flex-col">
        <InstructorHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}