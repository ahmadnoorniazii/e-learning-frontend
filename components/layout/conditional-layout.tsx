"use client";

import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show header/footer on auth pages, admin pages, or instructor dashboard pages
  const isAuthPage = pathname?.startsWith('/auth');
  const isAdminPage = pathname?.startsWith('/admin');
  const isInstructorDashboard = pathname?.startsWith('/instructor') && !pathname?.startsWith('/instructors');
  
  if (isAuthPage || isAdminPage || isInstructorDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}